import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  type CollisionDetection,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { KanbanBoardProps, KanbanCard } from "../types";
import { defaultTheme, mergeTheme } from "../themes";
import { Card } from "./Card";
import { Column } from "./Column";
import {
  moveCard,
  deleteCard,
  updateCardInBoard,
  updateColumn,
} from "../utils";

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  onCardMove,
  onCardUpdate,
  onCardDelete,
  onColumnUpdate,
  onColumnDelete,
  theme: customTheme,
  className = "",
  cardComponent: CustomCard,
  columnComponent: CustomColumn,
  enableAnimations = true,
  enableDragAndDrop = true,
  maxCardsPerColumn,
}) => {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [localBoard, setLocalBoard] = useState(board);
  const [dragOverInfo, setDragOverInfo] = useState<{
    cardId: string | null;
    columnId: string | null;
    position: "before" | "after" | "column" | null;
  }>({ cardId: null, columnId: null, position: null });

  // Track previous drag over info to prevent unnecessary updates
  const previousDragOverInfo = useRef<{
    cardId: string | null;
    columnId: string | null;
    position: "before" | "after" | "column" | null;
  }>({ cardId: null, columnId: null, position: null });

  const theme = mergeTheme(defaultTheme, customTheme);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Prefer cards over columns when determining the current "over" target.
  // If hovering a column, snap to the nearest card within that column.
  const collisionDetectionStrategy = useCallback<CollisionDetection>(
    (args) => {
      const { active, droppableContainers, pointerCoordinates } = args;

      // Helper to get droppable container by id safely
      const getContainer = (id: string) =>
        droppableContainers.find((c) => String(c.id) === String(id));

      // First try pointerWithin for precise targeting
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);

      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        // Ignore the active item itself
        if (overId === active.id) {
          // Find the next best collision that isn't the active item
          const alternative = intersections.find((c) => c.id !== active.id);
          if (alternative) {
            overId = alternative.id;
          }
        }

        const overContainer =
          overId != null ? getContainer(String(overId)) : null;
        const overType = overContainer?.data.current?.type as
          | string
          | undefined;

        if (overType === "card") {
          // We're over a card already; prioritize cards by filtering out columns and the active item
          const filtered = intersections.filter((c) => {
            if (c.id === active.id) return false;
            const cont = getContainer(String(c.id));
            return cont?.data.current?.type === "card";
          });
          return filtered.length > 0 ? filtered : intersections;
        }

        if (overType === "column") {
          const columnId = overContainer?.data.current?.columnId as
            | string
            | undefined;
          const column = localBoard.columns.find((col) => col.id === columnId);

          if (column && pointerCoordinates) {
            // Build a list of candidate card collisions within this column, excluding the active card
            const candidates = column.cards
              .map((card) => card.id)
              .filter((id) => id !== active.id)
              .map((id) => {
                const cont = getContainer(id);
                const rect = cont?.rect.current;
                if (!rect) return null;
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = centerX - pointerCoordinates.x;
                const dy = centerY - pointerCoordinates.y;
                const distance = Math.hypot(dx, dy);
                return { id, data: { value: distance } } as const;
              })
              .filter(
                (v): v is { id: string; data: { value: number } } => v != null
              )
              .sort((a, b) => a.data.value - b.data.value);

            if (candidates.length > 0) {
              return candidates;
            }
          }
          // Empty column or no pointer; fall back to the column itself
          return [{ id: String(overId) }];
        }
      }

      // Final fallback: closestCenter, but prefer cards and ignore active item when possible
      const fallback = closestCenter(args);
      const cardOnly = fallback.filter((c) => {
        if (c.id === active.id) return false;
        const cont = droppableContainers.find(
          (d) => String(d.id) === String(c.id)
        );
        return cont?.data.current?.type === "card";
      });
      return cardOnly.length > 0 ? cardOnly : fallback;
    },
    [localBoard.columns]
  );

  React.useEffect(() => {
    setLocalBoard(board);
  }, [board]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!enableDragAndDrop) return;

      const { active } = event;
      if (active.data.current?.type === "card") {
        setActiveCard(active.data.current.card);
        previousDragOverInfo.current = {
          cardId: null,
          columnId: null,
          position: null,
        };
      }
    },
    [enableDragAndDrop]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!enableDragAndDrop) return;

      const { active, over } = event;

      if (!over || active.data.current?.type !== "card") {
        setDragOverInfo({ cardId: null, columnId: null, position: null });
        return;
      }

      const overData = over.data.current;

      if (overData?.type === "card") {
        // Simple comparison: if dragged card is above target card = "before"
        const activeRect = event.active.rect.current.translated;
        const overRect = over.rect;

        if (!activeRect) return;

        const position = activeRect.top < overRect.top ? "before" : "after";

        const newDragInfo = {
          cardId: over.id as string,
          columnId: overData.columnId as string,
          position: position as "before" | "after",
        };

        // Only update if something actually changed
        const prev = previousDragOverInfo.current;
        if (
          prev.cardId !== newDragInfo.cardId ||
          prev.columnId !== newDragInfo.columnId ||
          prev.position !== newDragInfo.position
        ) {
          setDragOverInfo(newDragInfo);
          previousDragOverInfo.current = newDragInfo;
          console.log("🎯 Changed to:", over.id, "position:", position);
        }
      } else if (overData?.type === "column") {
        const newDragInfo = {
          cardId: null as string | null,
          columnId: overData.columnId as string,
          position: "column" as const, // Special position for dropping on empty areas of columns
        };

        const prev = previousDragOverInfo.current;
        if (
          prev.cardId !== newDragInfo.cardId ||
          prev.columnId !== newDragInfo.columnId ||
          prev.position !== newDragInfo.position
        ) {
          setDragOverInfo(newDragInfo);
          previousDragOverInfo.current = newDragInfo;
          console.log("Drag over column:", overData.columnId);
        }
      } else {
        const newDragInfo = {
          cardId: null as string | null,
          columnId: null as string | null,
          position: null as "before" | "after" | "column" | null,
        };
        const prev = previousDragOverInfo.current;
        if (
          prev.cardId !== newDragInfo.cardId ||
          prev.columnId !== newDragInfo.columnId ||
          prev.position !== newDragInfo.position
        ) {
          setDragOverInfo(newDragInfo);
          previousDragOverInfo.current = newDragInfo;
        }
      }
    },
    [enableDragAndDrop]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!enableDragAndDrop) return;

      const { active, over } = event;

      setActiveCard(null);
      previousDragOverInfo.current = {
        cardId: null,
        columnId: null,
        position: null,
      };
      const finalDragInfo = dragOverInfo; // capture current drag info
      setDragOverInfo({ cardId: null, columnId: null, position: null });

      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (activeData?.type === "card") {
        const activeCardId = active.id as string;
        const activeColumnId = activeData.columnId as string;

        // Determine target column and position
        let targetColumnId: string;
        let insertIndex: number;

        if (overData?.type === "card") {
          targetColumnId = overData.columnId as string;
          const targetColumn = localBoard.columns.find(
            (col) => col.id === targetColumnId
          );
          if (!targetColumn) return;

          // Find the position to insert based on the last drag info
          const targetCardIndex = targetColumn.cards.findIndex(
            (card) => card.id === over.id
          );
          if (targetCardIndex === -1) return;

          // Use the position from drag over info
          insertIndex =
            finalDragInfo.position === "after"
              ? targetCardIndex + 1
              : targetCardIndex;
        } else if (overData?.type === "column") {
          targetColumnId = overData.columnId as string;
          const targetColumn = localBoard.columns.find(
            (col) => col.id === targetColumnId
          );
          insertIndex = targetColumn ? targetColumn.cards.length : 0;
        } else {
          return;
        }

        // Perform the move
        if (activeColumnId === targetColumnId) {
          // Same column reordering
          const column = localBoard.columns.find(
            (col) => col.id === targetColumnId
          );
          if (!column) return;

          const activeIndex = column.cards.findIndex(
            (card) => card.id === activeCardId
          );
          if (activeIndex === -1) return;

          // Adjust insert index if moving within same column
          let adjustedIndex = insertIndex;
          if (activeIndex < insertIndex) {
            adjustedIndex -= 1;
          }

          if (activeIndex !== adjustedIndex) {
            const newCards = arrayMove(
              column.cards,
              activeIndex,
              adjustedIndex
            );
            const newBoard = {
              ...localBoard,
              columns: localBoard.columns.map((col) =>
                col.id === targetColumnId ? { ...col, cards: newCards } : col
              ),
            };
            setLocalBoard(newBoard);
            onCardMove?.(
              activeCardId,
              activeColumnId,
              targetColumnId,
              adjustedIndex
            );
          }
        } else {
          // Cross-column move
          const newBoard = moveCard(
            localBoard,
            activeCardId,
            activeColumnId,
            targetColumnId,
            insertIndex
          );
          setLocalBoard(newBoard);
          onCardMove?.(
            activeCardId,
            activeColumnId,
            targetColumnId,
            insertIndex
          );
        }
      }
    },
    [enableDragAndDrop, localBoard, onCardMove, dragOverInfo]
  );

  const handleCardUpdate = useCallback(
    (cardId: string, updates: Partial<KanbanCard>) => {
      const newBoard = updateCardInBoard(localBoard, cardId, updates);
      setLocalBoard(newBoard);
      onCardUpdate?.(cardId, updates);
    },
    [localBoard, onCardUpdate]
  );

  const handleCardDelete = useCallback(
    (cardId: string, columnId: string) => {
      const newBoard = deleteCard(localBoard, cardId, columnId);
      setLocalBoard(newBoard);
      onCardDelete?.(cardId, columnId);
    },
    [localBoard, onCardDelete]
  );

  const handleColumnUpdate = useCallback(
    (columnId: string, updates: Partial<(typeof localBoard.columns)[0]>) => {
      const newBoard = updateColumn(localBoard, columnId, updates);
      setLocalBoard(newBoard);
      onColumnUpdate?.(columnId, updates);
    },
    [localBoard, onColumnUpdate]
  );

  const handleColumnDelete = useCallback(
    (columnId: string) => {
      const newBoard = {
        ...localBoard,
        columns: localBoard.columns.filter(col => col.id !== columnId),
      };
      
      setLocalBoard(newBoard);
      onColumnDelete?.(columnId);
    },
    [localBoard, onColumnDelete]
  );

  const CardComponent = CustomCard || Card;
  const ColumnComponent = CustomColumn || Column;

  return (
    <div
      className={`kanban-board ${className}`}
      style={{
        backgroundColor: theme.colors.background,
        minHeight: "100vh",
        padding: theme.spacing.lg,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-4">
          <AnimatePresence>
            {localBoard.columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                onUpdate={(updates) => handleColumnUpdate(column.id, updates)}
                onDelete={() => handleColumnDelete(column.id)}
                theme={theme}
              >
                {column.cards.map((card, index) => (
                  <div key={card.id} style={{ position: "relative" }}>
                    {/* Show drop indicator before card */}
                    {dragOverInfo.cardId === card.id &&
                      dragOverInfo.position === "before" &&
                      activeCard && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            borderTop: `2px dashed ${theme.colors.primary}`,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        />
                      )}

                    <CardComponent
                      card={card}
                      columnId={column.id}
                      onUpdate={(updates) => handleCardUpdate(card.id, updates)}
                      onDelete={() => handleCardDelete(card.id, column.id)}
                      theme={theme}
                    />

                    {/* Show drop indicator after card */}
                    {dragOverInfo.cardId === card.id &&
                      dragOverInfo.position === "after" &&
                      activeCard && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            borderBottom: `2px dashed ${theme.colors.primary}`,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        />
                      )}
                  </div>
                ))}

                {/* Show drop indicator for empty column area */}
                {dragOverInfo.columnId === column.id &&
                  dragOverInfo.position === "column" &&
                  activeCard && (
                    <div
                      style={{
                        height: 0,
                        borderTop: `2px dashed ${theme.colors.primary}`,
                        pointerEvents: "none",
                        marginTop: theme.spacing.md,
                      }}
                    />
                  )}
              </ColumnComponent>
            ))}
          </AnimatePresence>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard && enableAnimations ? (
            <motion.div
              style={{
                opacity: 0.5,
              }}
            >
              <CardComponent
                card={activeCard}
                columnId=""
                theme={theme}
                isDragging={true}
              />
            </motion.div>
          ) : (
            activeCard && (
              <div style={{ opacity: 0.5 }}>
                <CardComponent
                  card={activeCard}
                  columnId=""
                  theme={theme}
                  isDragging={true}
                />
              </div>
            )
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

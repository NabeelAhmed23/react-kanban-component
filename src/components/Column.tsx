import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { ColumnComponentProps } from "../types";

export const Column: React.FC<ColumnComponentProps> = ({
  column,
  onUpdate,
  onDelete,
  theme,
  children,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      columnId: column.id,
      accepts: ["card"],
    },
  });

  const cardIds = column.cards.map((card) => card.id);

  const handleColumnTitleEdit = () => {
    const newTitle = prompt("Edit column title:", column.title);
    if (newTitle && newTitle !== column.title) {
      onUpdate?.({ title: newTitle });
    }
  };

  return (
    <motion.div
      // Disable automatic height/layout animation to prevent card height jumps
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        flex flex-col min-w-96  h-full rounded-lg p-4 transition-all duration-200 group
        ${isOver ? "ring-2 ring-opacity-50" : ""}
      `}
      style={{
        backgroundColor: theme.colors.columnBackground,
        boxShadow: theme.shadows.column,
        borderRadius: theme.borderRadius,
        border: `1px solid ${theme.colors.border}`,
        ...(isOver && {
          ringColor: theme.colors.primary,
          backgroundColor: theme.colors.primary + "10",
        }),
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleColumnTitleEdit}
            className="text-lg font-semibold hover:text-opacity-80 transition-colors text-left"
            style={{ color: theme.colors.text }}
          >
            {column.title}
          </button>
          <span
            className="text-sm px-2 py-1 rounded-full grid place-items-center w-7 h-7"
            style={{
              backgroundColor: theme.colors.secondary + "20",
              color: theme.colors.secondary,
            }}
          >
            {column.cards.length}
          </span>
          {column.maxCards && (
            <span
              className="text-xs"
              style={{ color: theme.colors.textSecondary }}
            >
              / {column.maxCards}
            </span>
          )}
        </div>
        
        {/* Column Actions */}
        <div className="flex items-center space-x-1">
          {onDelete && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${column.title}"? This will also delete all cards in this list.`)) {
                  onDelete();
                }
              }}
              className="p-1 rounded hover:bg-red-100 transition-colors text-red-500 opacity-0 group-hover:opacity-100"
              title="Delete list"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div ref={setNodeRef} className="flex-1 min-h-0">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 h-full overflow-y-auto">
            <AnimatePresence>{children}</AnimatePresence>

            {/* Empty state */}
            {column.cards.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <svg
                  className="w-12 h-12 mb-2 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.textSecondary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p
                  className="text-sm opacity-75"
                  style={{ color: theme.colors.textSecondary }}
                >
                  Drop cards here
                </p>
              </motion.div>
            )}
          </div>
        </SortableContext>
      </div>
    </motion.div>
  );
};

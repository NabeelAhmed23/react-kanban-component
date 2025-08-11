/// <reference lib="es2020.intl" />

import { KanbanBoard, KanbanCard, KanbanColumn } from "./types";

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const findCardById = (
  board: KanbanBoard,
  cardId: string
): { card: KanbanCard; columnId: string } | null => {
  for (const column of board.columns) {
    const card = column.cards.find((c) => c.id === cardId);
    if (card) {
      return { card, columnId: column.id };
    }
  }
  return null;
};

export const findColumnById = (
  board: KanbanBoard,
  columnId: string
): KanbanColumn | null => {
  return board.columns.find((column) => column.id === columnId) || null;
};

export const createCard = (
  cardData: Omit<KanbanCard, "id" | "createdAt" | "updatedAt">
): KanbanCard => {
  const now = new Date();
  return {
    ...cardData,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
};

export const updateCard = (
  card: KanbanCard,
  updates: Partial<KanbanCard>
): KanbanCard => {
  return {
    ...card,
    ...updates,
    updatedAt: new Date(),
  };
};

export const moveCard = (
  board: KanbanBoard,
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  newIndex: number
): KanbanBoard => {
  const newBoard = { ...board };
  const fromColumn = newBoard.columns.find((col) => col.id === fromColumnId);
  const toColumn = newBoard.columns.find((col) => col.id === toColumnId);

  if (!fromColumn || !toColumn) {
    return board;
  }

  const cardIndex = fromColumn.cards.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) {
    return board;
  }

  const [card] = fromColumn.cards.splice(cardIndex, 1);

  const adjustedIndex = Math.min(newIndex, toColumn.cards.length);
  toColumn.cards.splice(adjustedIndex, 0, updateCard(card, {}));

  return newBoard;
};

export const addCard = (
  board: KanbanBoard,
  columnId: string,
  cardData: Omit<KanbanCard, "id" | "createdAt" | "updatedAt">
): KanbanBoard => {
  const newBoard = { ...board };
  const column = newBoard.columns.find((col) => col.id === columnId);

  if (!column) {
    return board;
  }

  const newCard = createCard(cardData);
  column.cards.push(newCard);

  return newBoard;
};

export const deleteCard = (
  board: KanbanBoard,
  cardId: string,
  columnId: string
): KanbanBoard => {
  const newBoard = { ...board };
  const column = newBoard.columns.find((col) => col.id === columnId);

  if (!column) {
    return board;
  }

  column.cards = column.cards.filter((card) => card.id !== cardId);
  return newBoard;
};

export const updateCardInBoard = (
  board: KanbanBoard,
  cardId: string,
  updates: Partial<KanbanCard>
): KanbanBoard => {
  const newBoard = { ...board };

  for (const column of newBoard.columns) {
    const cardIndex = column.cards.findIndex((card) => card.id === cardId);
    if (cardIndex !== -1) {
      column.cards[cardIndex] = updateCard(column.cards[cardIndex], updates);
      break;
    }
  }

  return newBoard;
};

export const updateColumn = (
  board: KanbanBoard,
  columnId: string,
  updates: Partial<KanbanColumn>
): KanbanBoard => {
  const newBoard = { ...board };
  const columnIndex = newBoard.columns.findIndex((col) => col.id === columnId);

  if (columnIndex !== -1) {
    newBoard.columns[columnIndex] = {
      ...newBoard.columns[columnIndex],
      ...updates,
    };
  }

  return newBoard;
};

export const getCardPriorityColor = (priority?: string): string => {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50";
    case "medium":
      return "text-yellow-600 bg-yellow-50";
    case "low":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSec < 60) {
    return rtf.format(-diffSec, "second");
  }
  const minutes = Math.round(diffSec / 60);
  const absMin = Math.abs(minutes);
  if (absMin < 60) {
    return rtf.format(-minutes, "minute");
  }
  const hours = Math.round(diffSec / 3600);
  const absHours = Math.abs(hours);
  if (absHours < 24) {
    return rtf.format(-hours, "hour");
  }
  const days = Math.round(diffSec / 86400);
  const absDays = Math.abs(days);
  if (absDays < 7) {
    return rtf.format(-days, "day");
  }
  const weeks = Math.round(diffSec / 604800);
  const absWeeks = Math.abs(weeks);
  if (absWeeks < 5) {
    return rtf.format(-weeks, "week");
  }
  const months = Math.round(diffSec / 2629800); // average month seconds
  const absMonths = Math.abs(months);
  if (absMonths < 12) {
    return rtf.format(-months, "month");
  }
  const years = Math.round(diffSec / 31557600); // average year seconds
  return rtf.format(-years, "year");
};

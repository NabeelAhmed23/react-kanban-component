import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { CardComponentProps } from "../types";
import { getCardPriorityColor, formatDate, formatTimeAgo } from "../utils";

export const Card: React.FC<CardComponentProps> = ({
  card,
  columnId,
  onUpdate,
  onDelete,
  theme,
}) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
      columnId,
    },
  });

  const motionStyle = {
    backgroundColor: theme.colors.cardBackground,
    boxShadow: theme.shadows.card,
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
  };

  const handleEdit = () => {
    const newTitle = prompt("Edit card title:", card.title);
    if (newTitle && newTitle !== card.title) {
      onUpdate?.({ title: newTitle });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      onDelete?.();
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={motionStyle}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        relative p-4 rounded-lg cursor-grab active:cursor-grabbing
        transition-colors duration-200 ease-in-out
        group
      `}
    >
      <div className="flex justify-between space-y-2">
        {/* Priority indicator */}
        {card.priority && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getCardPriorityColor(
              card.priority
            )}`}
          >
            {card.priority.toUpperCase()}
          </div>
        )}

        {/* Card actions */}
        <div className="flex space-x-1">
          {typeof handleEdit !== "undefined" && (
            <button
              onClick={handleEdit}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
              style={{ color: theme.colors.secondary }}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-100 transition-colors text-red-500"
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
        </div>
      </div>

      {/* Card content */}
      <div>
        <div className="mb-2">
          <h3
            className="font-semibold text-sm leading-tight"
            style={{ color: theme.colors.text }}
          >
            {card.title}
          </h3>
          {(card.updatedAt || card.createdAt) && (
            <div
              className="text-xs mt-0.5"
              style={{ color: theme.colors.textSecondary }}
            >
              {formatTimeAgo(card.updatedAt || card.createdAt!)}
            </div>
          )}
        </div>

        {card.description && (
          <p
            className="text-sm mb-3 leading-relaxed"
            style={{ color: theme.colors.textSecondary }}
          >
            {card.description}
          </p>
        )}

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: theme.colors.primary + "20",
                  color: theme.colors.primary,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            {card.assignee && (
              <div
                className="flex items-center space-x-1"
                style={{ color: theme.colors.textSecondary }}
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{card.assignee}</span>
              </div>
            )}
          </div>

          {card.dueDate && (
            <div
              className="flex items-center space-x-1"
              style={{ color: theme.colors.textSecondary }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{formatDate(card.dueDate)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

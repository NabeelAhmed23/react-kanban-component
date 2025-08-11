export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  priority?: "low" | "medium" | "high";
  assignee?: string;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  customData?: Record<string, any>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  maxCards?: number;
  color?: string;
  customData?: Record<string, any>;
}

export interface KanbanBoard {
  columns: KanbanColumn[];
}

export interface KanbanTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    cardBackground: string;
    columnBackground: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    danger: string;
  };
  borderRadius: string;
  shadows: {
    card: string;
    column: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current: {
        type: "card" | "column";
        card?: KanbanCard;
        columnId?: string;
      };
    };
  };
  over: {
    id: string;
    data?: {
      current?: {
        type: "card" | "column";
        accepts?: string[];
        columnId?: string;
      };
    };
  } | null;
}

export interface KanbanBoardProps {
  board: KanbanBoard;
  onCardMove?: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newIndex: number
  ) => void;
  onCardUpdate?: (cardId: string, updates: Partial<KanbanCard>) => void;
  onCardDelete?: (cardId: string, columnId: string) => void;
  onColumnUpdate?: (columnId: string, updates: Partial<KanbanColumn>) => void;
  onColumnDelete?: (columnId: string) => void;
  theme?: Partial<KanbanTheme>;
  className?: string;
  cardComponent?: React.ComponentType<CardComponentProps>;
  columnComponent?: React.ComponentType<ColumnComponentProps>;
  enableAnimations?: boolean;
  enableDragAndDrop?: boolean;
  maxCardsPerColumn?: number;
}

export interface CardComponentProps {
  card: KanbanCard;
  columnId: string;
  onUpdate?: (updates: Partial<KanbanCard>) => void;
  onDelete?: () => void;
  isDragging?: boolean;
  theme: KanbanTheme;
}

export interface ColumnComponentProps {
  column: KanbanColumn;
  onUpdate?: (updates: Partial<KanbanColumn>) => void;
  onDelete?: () => void;
  theme: KanbanTheme;
  children: React.ReactNode;
}


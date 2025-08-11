# React Kanban Component

A fully customizable, animated kanban board component for React with TypeScript and TailwindCSS support.

## Features

- 🎯 **Drag and Drop**: Smooth card movement between columns with @dnd-kit
- 🎨 **Customizable Themes**: Built-in themes (default, dark, colorful) with full customization
- 🔄 **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- 📝 **Rich Card Content**: Support for titles, descriptions, tags, priorities, assignees, and due dates
- 🎛️ **Column Management**: Add/edit columns with optional card limits
- 🔧 **TypeScript Support**: Fully typed for better development experience
- 📱 **Responsive Design**: Works on all screen sizes
- ⚡ **Performance Optimized**: Efficient rendering with React best practices
- 🎨 **TailwindCSS Integration**: Styled with utility classes

## Installation

```bash
npm install react-kanban-component
```

### Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

```tsx
import React, { useState } from 'react';
import { KanbanBoard, KanbanBoardData } from 'react-kanban-component';

const initialBoard: KanbanBoardData = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      cards: [
        {
          id: '1',
          title: 'Task 1',
          description: 'This is a sample task',
          priority: 'high',
          tags: ['urgent'],
        }
      ]
    },
    {
      id: 'doing',
      title: 'In Progress',
      cards: []
    },
    {
      id: 'done',
      title: 'Done',
      cards: []
    }
  ]
};

function App() {
  const [board, setBoard] = useState(initialBoard);

  const handleCardMove = (cardId, fromColumnId, toColumnId, newIndex) => {
    // Handle card movement logic
    console.log('Card moved:', { cardId, fromColumnId, toColumnId, newIndex });
  };

  return (
    <KanbanBoard
      board={board}
      onCardMove={handleCardMove}
    />
  );
}
```

## API Reference

### KanbanBoard Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `board` | `KanbanBoardData` | Required | The board data structure |
| `onCardMove` | `function` | - | Called when a card is moved |
| `onCardUpdate` | `function` | - | Called when a card is updated |
| `onCardDelete` | `function` | - | Called when a card is deleted |
| `onCardCreate` | `function` | - | Called when a card is created |
| `onColumnUpdate` | `function` | - | Called when a column is updated |
| `theme` | `Partial<KanbanTheme>` | `defaultTheme` | Theme customization |
| `className` | `string` | `''` | Additional CSS classes |
| `enableAnimations` | `boolean` | `true` | Enable/disable animations |
| `enableDragAndDrop` | `boolean` | `true` | Enable/disable drag and drop |
| `maxCardsPerColumn` | `number` | - | Global max cards per column |

### Data Types

#### KanbanCard

```typescript
interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  customData?: Record<string, any>;
}
```

#### KanbanColumn

```typescript
interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  maxCards?: number;
  color?: string;
  customData?: Record<string, any>;
}
```

#### KanbanTheme

```typescript
interface KanbanTheme {
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
```

## Helper Functions

The library provides utility functions for common operations:

```typescript
import {
  addCard,
  deleteCard,
  moveCard,
  updateCardInBoard,
  updateColumn,
  generateId,
} from 'react-kanban-component';

// Add a new card
const newBoard = addCard(board, 'column-id', {
  title: 'New Task',
  description: 'Task description'
});

// Move a card between columns
const movedBoard = moveCard(board, 'card-id', 'from-column', 'to-column', 0);

// Delete a card
const updatedBoard = deleteCard(board, 'card-id', 'column-id');

// Update a card
const modifiedBoard = updateCardInBoard(board, 'card-id', {
  title: 'Updated Title'
});
```

## Themes

### Built-in Themes

```typescript
import { darkTheme, colorfulTheme, defaultTheme } from 'react-kanban-component';

<KanbanBoard board={board} theme={darkTheme} />
```

### Custom Theme

```typescript
const customTheme = {
  colors: {
    primary: '#your-color',
    background: '#your-bg-color',
    // ... other color overrides
  }
};

<KanbanBoard board={board} theme={customTheme} />
```

## Advanced Usage

### Event Handlers

```typescript
function MyKanbanBoard() {
  const [board, setBoard] = useState(initialBoard);

  const handleCardMove = (cardId, fromColumnId, toColumnId, newIndex) => {
    const newBoard = moveCard(board, cardId, fromColumnId, toColumnId, newIndex);
    setBoard(newBoard);
    
    // Optional: sync with backend
    syncWithBackend(newBoard);
  };

  const handleCardUpdate = (cardId, updates) => {
    const newBoard = updateCardInBoard(board, cardId, updates);
    setBoard(newBoard);
  };

  const handleCardDelete = (cardId, columnId) => {
    const newBoard = deleteCard(board, cardId, columnId);
    setBoard(newBoard);
  };

  const handleCardCreate = (columnId, cardData) => {
    const newBoard = addCard(board, columnId, cardData);
    setBoard(newBoard);
  };

  return (
    <KanbanBoard
      board={board}
      onCardMove={handleCardMove}
      onCardUpdate={handleCardUpdate}
      onCardDelete={handleCardDelete}
      onCardCreate={handleCardCreate}
    />
  );
}
```

### Custom Components

```typescript
import { CardComponentProps, ColumnComponentProps } from 'react-kanban-component';

const CustomCard: React.FC<CardComponentProps> = ({ card, theme }) => (
  <div style={{ backgroundColor: theme.colors.cardBackground }}>
    <h3>{card.title}</h3>
    {/* Your custom card content */}
  </div>
);

<KanbanBoard
  board={board}
  cardComponent={CustomCard}
/>
```

## Styling

The component uses TailwindCSS classes internally but can be styled with any CSS framework. The theme system provides comprehensive customization options.

### CSS Variables

For additional customization, you can override CSS variables:

```css
.kanban-board {
  --kanban-primary: #3b82f6;
  --kanban-secondary: #6b7280;
  --kanban-background: #f8fafc;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © NabeelAhmed23

## Changelog

### v1.0.0
- Initial release
- Drag and drop functionality
- Multiple themes
- Animation support
- TypeScript support
- Comprehensive documentation
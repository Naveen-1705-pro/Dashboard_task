import { Column, Task } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: string) => void;
  isDraggedOver?: boolean;
}

const columnStyles = {
  todo: 'border-blue-200 bg-blue-50/30',
  'in-progress': 'border-amber-200 bg-amber-50/30',
  done: 'border-green-200 bg-green-50/30',
};

export const KanbanColumn = ({
  column,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onTaskClick,
  onAddTask,
  isDraggedOver,
}: KanbanColumnProps) => {
  return (
    <div className="flex flex-col h-full min-w-[320px] max-w-[380px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-lg">{column.title}</h2>
          <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-md transition-colors"
          aria-label={`Add task to ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, column.id)}
        className={`
          flex-1 rounded-xl border-2 border-dashed p-3 transition-all duration-200 min-h-[500px]
          ${isDraggedOver ? 'border-primary bg-primary/5 scale-[1.02]' : columnStyles[column.id as keyof typeof columnStyles]}
        `}
        role="region"
        aria-label={`${column.title} column`}
      >
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No tasks yet
          </div>
        ) : (
          <div className="space-y-0">
            {column.tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

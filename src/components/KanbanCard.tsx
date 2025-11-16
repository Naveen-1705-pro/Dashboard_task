import { Task, Priority } from '@/types/kanban';
import { Calendar, User, Tag } from 'lucide-react';
import { format } from 'date-fns';

interface KanbanCardProps {
  task: Task;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onClick: () => void;
}

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  high: { color: 'bg-priority-high', label: 'High' },
  medium: { color: 'bg-priority-medium', label: 'Medium' },
  low: { color: 'bg-priority-low', label: 'Low' },
};

export const KanbanCard = ({ task, isDragging, onDragStart, onDragEnd, onClick }: KanbanCardProps) => {
  const priorityInfo = priorityConfig[task.priority];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`
        group bg-card border border-border rounded-lg p-4 mb-3 cursor-move
        transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        ${isDragging ? 'opacity-50 rotate-2' : 'opacity-100'}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
          {task.title}
        </h3>
        <div className={`w-2 h-2 rounded-full ${priorityInfo.color} flex-shrink-0 mt-1.5`} />
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {task.tags?.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {task.assignee && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>{task.assignee}</span>
          </div>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

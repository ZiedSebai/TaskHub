import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '../../components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id || task._id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-pointer hover:shadow-md transition-all ${isDragging ? 'opacity-50 rotate-2' : ''}`}
      onClick={onClick}
    >
      <CardContent
        className="p-4 hover:bg-accent/50 transition-colors rounded-lg"
        {...listeners}
        {...attributes}
      >
        <h4 className="font-semibold mb-2 text-base">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            <span>📅</span>
            <span>Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


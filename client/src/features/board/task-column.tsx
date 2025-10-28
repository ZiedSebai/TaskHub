import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './task-card';
import type { BoardColumn } from '../../types';

interface TaskColumnProps {
  column: BoardColumn;
}

export function TaskColumn({ column }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  // Safe access to tasks with default empty array
  const tasks = column.tasks || [];

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 sm:w-80 bg-card rounded-xl border-2 transition-all duration-200 p-4 ${
        isOver ? 'border-primary/50 bg-primary/5' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h3 className="font-bold text-lg">{column.name}</h3>
        <span className="text-xs bg-muted px-2 py-1 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>
          <div className="space-y-3 min-h-[400px] pb-2 flex flex-col">
            {tasks.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-muted-foreground text-center">Drop tasks here</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard key={task.id || task._id} task={task} />
              ))
            )}
          </div>
    </div>
  );
}
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';
import { tasksApi } from '../../api/tasks';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskColumn } from './task-column';
import { TaskCard } from './task-card';
import { CreateTaskDialog } from './create-task-dialog';
import { MembersPanel } from './members-panel';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import type { Task } from '../../types';

export function Board() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [membersPanelOpen, setMembersPanelOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', id],
    queryFn: () => projectsApi.getBoard(id!),
    enabled: !!id,
  });

  const { mutate: moveTask } = useMutation({
    mutationFn: (payload: {
      projectId: string;
      sourceStatus: string;
      destStatus: string;
      taskId: string;
      destIndex: number;
    }) => tasksApi.reorderMove(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
    },
  });

  const handleDragStart = (event: any) => {
    const taskId = event.active.id as string;
    const task = normalizedColumns
      .flatMap((col) => col.tasks || [])
      .find((t) => t.id === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);

  if (!over || !id || !board || !normalizedColumns) return;

    const sourceTaskId = active.id as string;
    const targetStatus = over.id as string;

    // Find the task being dragged
    let sourceTask: Task | undefined;
    let sourceStatus: string | undefined;

    for (const column of normalizedColumns) {
      const task = (column.tasks || []).find((t) => t.id === sourceTaskId);
      if (task) {
        sourceTask = task;
        sourceStatus = column.id;
        break;
      }
    }

    if (!sourceTask || !sourceStatus) return;

    // If dropped in the same column, call backend with single-move payload
    if (sourceStatus === targetStatus) {
      const targetColumn = normalizedColumns.find((col) => col.id === targetStatus);
      if (!targetColumn || !targetColumn.tasks) return;

      const tasksWithoutDropped = targetColumn.tasks.filter((t) => t.id !== sourceTaskId);
      const overTaskIndex = tasksWithoutDropped.findIndex(
        (t) => over.id === t.id || (over as any).data?.current?.type === 'task'
      );

      const destIndex = overTaskIndex === -1 ? targetColumn.tasks.length : overTaskIndex;

      moveTask({ projectId: id!, sourceStatus, destStatus: targetStatus, taskId: sourceTaskId, destIndex });
      return;
    }

    // Task moved to different column
  const sourceColumn = normalizedColumns.find((col) => col.id === sourceStatus);
  const targetColumn = normalizedColumns.find((col) => col.id === targetStatus);

    if (!sourceColumn || !targetColumn) return;

    // Compute destination index in the target column based on where the item was dropped
    const targetTasks = targetColumn.tasks || [];
    const overTaskIndex = targetTasks.findIndex((t) => t.id === (over?.id as string));
    const destIndex = overTaskIndex === -1 ? targetTasks.length : overTaskIndex;

    // Call backend single-move endpoint
    moveTask({ projectId: id!, sourceStatus, destStatus: targetStatus, taskId: sourceTaskId, destIndex });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Board not found</p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Safe calculations with optional chaining and defaults
  // Normalize columns: some backends may use different keys (tasks/items/cards)
  const normalizedColumns = (board.columns || []).map((col) => ({
    ...col,
    tasks: col.tasks || (col as any).items || (col as any).cards || [],
  }));

  // Debug log the board and normalized columns so we can inspect shape at runtime
  // eslint-disable-next-line no-console
  console.log('Board fetched:', board);
  // eslint-disable-next-line no-console
  console.log('Normalized columns:', normalizedColumns);

  const totalTasks = normalizedColumns.reduce((sum, col) => sum + (col.tasks?.length || 0), 0);
  const columnsCount = normalizedColumns.length;
  const membersCount = board.members?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {board.name || 'Project Board'}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {columnsCount} columns, {totalTasks} tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setMembersPanelOpen(true)} className="h-10">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Members</span>
                <span className="hidden sm:inline ml-1">({membersCount})</span>
                <span className="sm:hidden">{membersCount}</span>
              </Button>
              <Button onClick={() => setCreateTaskOpen(true)} className="h-10">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {normalizedColumns.map((column) => (
              <div key={column.id || column._id}>
                <SortableContext
                  id={column.id}
                  items={(column.tasks || []).map((t) => t.id || t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TaskColumn key={column.id} column={column} />
                </SortableContext>
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        columns={normalizedColumns}
      />

      <MembersPanel
        open={membersPanelOpen}
        onOpenChange={setMembersPanelOpen}
        members={board.members || []}
      />
    </div>
  );
}
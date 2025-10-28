import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { tasksApi } from '../../api/tasks';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog';
import { Plus } from 'lucide-react';
import type { BoardColumn } from '../../types';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: BoardColumn[];
}

export function CreateTaskDialog({ open, onOpenChange, columns }: CreateTaskDialogProps) {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  // Safe columns array
  const safeColumns = columns || [];

  // Define desired default statuses. We'll try to map them to existing column ids where names match.
  const DEFAULT_STATUSES = [
    { id: 'backlog', name: 'Backlog' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'review', name: 'Review' },
    { id: 'done', name: 'Done' },
  ];

  // Build options: prefer matching column ids (by name), otherwise fall back to default ids
  const statusOptions = DEFAULT_STATUSES.map((ds) => {
    const match = safeColumns.find((c) => (c.name || '').toLowerCase() === ds.name.toLowerCase());
    return {
      value: match ? (match.id || match._id) : ds.id,
      label: ds.name,
    };
  });

  // When the dialog opens and columns are available, ensure a default status is selected.
  useEffect(() => {
    if (open) {
      // Prefer a mapped status option (first one)
      if (statusOptions && statusOptions.length > 0) {
        setStatus(statusOptions[0].value || '');
      } else if (columns && columns.length > 0) {
        setStatus(columns[0].id || columns[0]._id || '');
      }
    }
  }, [columns, open]);

  // Debug: log columns when dialog opens so we can inspect names at runtime
  useEffect(() => {
    if (open) {
      console.log('CreateTaskDialog columns:', columns, 'statusOptions:', statusOptions);
    }
  }, [open, columns]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      // Resolve the status to the column NAME (backend expects the status name, not id).
      // First try to find a matching column by id or name.
      const matchedColumn = safeColumns.find(
        (c) => (c.id || c._id) === status || (c.name || '') === status
      );

      let resolvedStatusName = '';
      if (matchedColumn) {
        resolvedStatusName = matchedColumn.name;
      } else {
        // If the selected value is one of our default status ids, map to its label.
        const ds = DEFAULT_STATUSES.find((d) => d.id === status);
        if (ds) {
          resolvedStatusName = ds.name;
        } else {
          // Fallback to the first column's name or the raw status string.
          resolvedStatusName = safeColumns[0]?.name || status;
        }
      }

      // Backend expects `project` field (not projectId) and status must be the column name.
      return tasksApi.create({
        title,
        description,
        status: resolvedStatusName,
        order: 0,
        project: id!,
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      setTitle('');
      setDescription('');
      setStatus(statusOptions[0]?.value || columns[0]?.id || '');
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    mutate();
  };

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">Create New Task</DialogTitle>
          <DialogDescription className="text-center">
            Add a new task to your project board
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Task Title
            </label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isPending}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="desc" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="desc"
              placeholder="Add task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={isPending}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
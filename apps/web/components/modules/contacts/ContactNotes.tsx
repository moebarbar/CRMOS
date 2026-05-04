'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { note as noteSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { relativeTime } from '@/lib/utils/format';

interface FormValues {
  body: string;
}

export function ContactNotes({ contactId }: { contactId: string }) {
  const utils = trpc.useUtils();
  const list = trpc.notes.listFor.useQuery({ targetType: 'CONTACT', targetId: contactId });

  const create = trpc.notes.create.useMutation({
    onSuccess: () => {
      reset({ body: '' });
      toast.success('Note added');
      void utils.notes.listFor.invalidate({ targetType: 'CONTACT', targetId: contactId });
      void utils.activity.forTarget.invalidate({ targetType: 'CONTACT', targetId: contactId });
    },
    onError: (err) => toast.error(err.message),
  });

  const remove = trpc.notes.delete.useMutation({
    onSuccess: () => {
      void utils.notes.listFor.invalidate({ targetType: 'CONTACT', targetId: contactId });
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(noteSchemas.createNoteSchema.pick({ body: true })),
    defaultValues: { body: '' },
    mode: 'onChange',
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit((values) =>
          create.mutate({ targetType: 'CONTACT', targetId: contactId, body: values.body }),
        )}
        className="bg-card space-y-2 rounded-lg border p-4"
      >
        <Textarea placeholder="Add a note about this contact…" rows={3} {...register('body')} />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={!isValid || isSubmitting || create.isPending}>
            {create.isPending ? 'Saving…' : 'Add note'}
          </Button>
        </div>
      </form>

      {list.isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : !list.data || list.data.length === 0 ? (
        <p className="bg-card text-muted-foreground rounded-lg border p-6 text-center text-sm">
          No notes yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.data.map((n) => (
            <li key={n.id} className="bg-card rounded-lg border p-4">
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>{relativeTime(n.createdAt)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    if (confirm('Delete note?')) remove.mutate({ id: n.id });
                  }}
                >
                  Delete
                </Button>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{n.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

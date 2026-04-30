'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { membership as membershipSchemas } from '@chiefos/shared';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormValues = membershipSchemas.InviteMemberInput;

export function InviteMemberForm() {
  const utils = trpc.useUtils();
  const invite = trpc.membership.invite.useMutation({
    onSuccess: () => {
      toast.success('Invite sent.');
      reset();
      void utils.membership.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(membershipSchemas.inviteMemberSchema),
    defaultValues: { email: '', role: 'MEMBER' },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => invite.mutate(values))}
      className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
    >
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="teammate@company.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring"
          {...register('role')}
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
          <option value="CONTRACTOR">Contractor</option>
          <option value="CLIENT">Client</option>
        </select>
      </div>
      <Button type="submit" disabled={invite.isPending}>
        {invite.isPending ? 'Sending…' : 'Send invite'}
      </Button>
    </form>
  );
}
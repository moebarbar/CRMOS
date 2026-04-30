import { z } from 'zod';
import { ROLES } from '../constants';

export const roleSchema = z.enum(ROLES);

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: roleSchema.exclude(['OWNER', 'CUSTOM']).default('MEMBER'),
  customRoleId: z.string().cuid().optional(),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMembershipSchema = z.object({
  membershipId: z.string().cuid(),
  role: roleSchema.optional(),
  customRoleId: z.string().cuid().nullable().optional(),
  notificationsEmail: z.boolean().optional(),
  notificationsPush: z.boolean().optional(),
});
export type UpdateMembershipInput = z.infer<typeof updateMembershipSchema>;

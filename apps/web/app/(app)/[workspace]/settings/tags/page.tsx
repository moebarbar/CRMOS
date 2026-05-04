import { TagsManager } from '@/components/modules/tags/TagsManager';

export const metadata = { title: 'Tags' };

export default function TagsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tags</h1>
        <p className="text-muted-foreground text-sm">
          Color-coded labels for contacts, companies, deals, and more.
        </p>
      </div>
      <TagsManager />
    </div>
  );
}

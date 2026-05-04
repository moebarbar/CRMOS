import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome to your workspace</h1>
        <p className="text-muted-foreground text-sm">
          The empty room. CRM, deals, projects, and Moe arrive in later phases.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Phase 0 · Foundation</CardTitle>
            <CardDescription>Shipped</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Auth, multi-tenancy, app shell, schema baseline.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phase 1 · CRM Core</CardTitle>
            <CardDescription>Next up</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Contacts, companies, tags, custom fields, saved views, CSV import.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phase 10 · Moe</CardTitle>
            <CardDescription>The launch demo</CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Voice-to-action AI that runs every module via tool calls.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

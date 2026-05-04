'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { CheckCircle2, FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TARGET_FIELDS = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
] as const;

type TargetKey = (typeof TARGET_FIELDS)[number]['key'];

const COMMON_MAPPINGS: Record<string, TargetKey> = {
  'first name': 'firstName',
  firstname: 'firstName',
  'given name': 'firstName',
  'last name': 'lastName',
  lastname: 'lastName',
  surname: 'lastName',
  'family name': 'lastName',
  email: 'email',
  'email address': 'email',
  'e-mail': 'email',
  phone: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  cell: 'phone',
  'job title': 'jobTitle',
  title: 'jobTitle',
  position: 'jobTitle',
  city: 'city',
  country: 'country',
};

type Step = 'upload' | 'map' | 'committing' | 'done';

export function ContactImportWizard({ workspaceSlug }: { workspaceSlug: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, TargetKey | ''>>({});
  const [result, setResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    total: number;
  } | null>(null);

  const importMutation = trpc.contacts.bulkImport.useMutation({
    onSuccess: (r) => {
      setResult(r);
      setStep('done');
      toast.success(`Imported ${r.created} new, updated ${r.updated}`);
    },
    onError: (err) => {
      toast.error(err.message);
      setStep('map');
    },
  });

  const utils = trpc.useUtils();

  const onFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (parsed) => {
        const fields = parsed.meta.fields ?? [];
        setHeaders(fields);
        setRows(parsed.data);

        // Auto-map columns by name match.
        const auto: Record<string, TargetKey | ''> = {};
        for (const h of fields) {
          const lower = h.trim().toLowerCase();
          auto[h] = COMMON_MAPPINGS[lower] ?? '';
        }
        setMapping(auto);

        setStep('map');
      },
      error: (err) => toast.error(`CSV parse error: ${err.message}`),
    });
  };

  const mapped = useMemo(() => {
    return rows.map((row) => {
      const out: Partial<Record<TargetKey, string>> = {};
      for (const [csvCol, target] of Object.entries(mapping)) {
        if (target) {
          const value = row[csvCol];
          if (value !== undefined && value.trim() !== '') {
            out[target] = value.trim();
          }
        }
      }
      return out;
    });
  }, [rows, mapping]);

  const validRowCount = useMemo(
    () => mapped.filter((r) => r.firstName || r.lastName || r.email || r.phone).length,
    [mapped],
  );

  if (step === 'upload') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload a CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="bg-muted/30 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center transition-colors">
            <Upload className="text-muted-foreground h-6 w-6" />
            <div>
              <p className="text-sm font-medium">Drop a CSV file here, or click to browse</p>
              <p className="text-muted-foreground text-xs">
                Up to 2,000 rows. Header row required.
              </p>
            </div>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
              }}
            />
          </label>
        </CardContent>
      </Card>
    );
  }

  if (step === 'done' && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Import complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="grid gap-2 text-sm sm:grid-cols-4">
            <Stat label="Created" value={result.created} />
            <Stat label="Updated" value={result.updated} />
            <Stat label="Skipped" value={result.skipped} />
            <Stat label="Total rows" value={result.total} />
          </ul>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                void utils.contacts.list.invalidate();
                router.push(`/${workspaceSlug}/contacts`);
              }}
            >
              View contacts
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setStep('upload');
                setHeaders([]);
                setRows([]);
                setMapping({});
                setResult(null);
              }}
            >
              Import another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Map columns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Match each CSV column to a contact field. Unmatched columns are ignored.
          </p>
          <ul className="divide-y rounded-lg border">
            {headers.map((h) => (
              <li key={h} className="flex items-center gap-3 px-4 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{h}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    Sample: {rows[0]?.[h] ?? '—'}
                  </p>
                </div>
                <select
                  value={mapping[h] ?? ''}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [h]: e.target.value as TargetKey | '' }))
                  }
                  className="border-input h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm"
                >
                  <option value="">— ignore —</option>
                  {TARGET_FIELDS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Preview ({validRowCount} of {rows.length} rows will import)
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs uppercase tracking-wider">
                {TARGET_FIELDS.map((f) => (
                  <th key={f.key} className="px-3 py-2">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mapped.slice(0, 10).map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  {TARGET_FIELDS.map((f) => (
                    <td key={f.key} className="text-muted-foreground px-3 py-1.5">
                      {r[f.key] ?? <span className="text-muted-foreground/60">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 10 && (
            <p className="text-muted-foreground mt-3 text-xs">
              Showing first 10 of {rows.length} rows.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          disabled={validRowCount === 0 || importMutation.isPending}
          onClick={() => {
            setStep('committing');
            importMutation.mutate({
              rows: mapped.map((r) => ({
                firstName: r.firstName ?? null,
                lastName: r.lastName ?? null,
                email: r.email ?? null,
                phone: r.phone ?? null,
                jobTitle: r.jobTitle ?? null,
                city: r.city ?? null,
                country: r.country ?? null,
              })),
            });
          }}
        >
          {importMutation.isPending
            ? 'Importing…'
            : `Import ${validRowCount} contact${validRowCount === 1 ? '' : 's'}`}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setStep('upload');
            setHeaders([]);
            setRows([]);
            setMapping({});
          }}
        >
          Start over
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <li className="bg-card rounded-lg border px-4 py-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
    </li>
  );
}

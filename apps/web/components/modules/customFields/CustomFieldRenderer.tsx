'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface CustomFieldDef {
  id: string;
  key: string;
  label: string;
  type: string;
  options: { value: string; label: string; color?: string }[] | null;
  required: boolean;
}

interface Props {
  def: CustomFieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}

/**
 * Phase 1 first cut: 8 most-used types render as proper inputs.
 * Remaining types (USER, CONTACT, FILE, ADDRESS, MULTI_SELECT, DATETIME)
 * fall back to a plain text input — refined when the related modules ship.
 */
export function CustomFieldRenderer({ def, value, onChange, error }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={def.id}>
        {def.label}
        {def.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Field def={def} value={value} onChange={onChange} />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

function Field({ def, value, onChange }: Pick<Props, 'def' | 'value' | 'onChange'>) {
  switch (def.type) {
    case 'TEXTAREA':
    case 'ADDRESS':
      return (
        <Textarea
          id={def.id}
          rows={3}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'NUMBER':
    case 'CURRENCY':
      return (
        <Input
          id={def.id}
          type="number"
          step={def.type === 'CURRENCY' ? '0.01' : 'any'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );
    case 'BOOLEAN':
      return (
        <input
          id={def.id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case 'DATE':
      return (
        <Input
          id={def.id}
          type="date"
          value={typeof value === 'string' ? value.slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case 'DATETIME':
      return (
        <Input
          id={def.id}
          type="datetime-local"
          value={typeof value === 'string' ? value.slice(0, 16) : ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case 'EMAIL':
      return (
        <Input
          id={def.id}
          type="email"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'URL':
      return (
        <Input
          id={def.id}
          type="url"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://"
        />
      );
    case 'PHONE':
      return (
        <Input
          id={def.id}
          type="tel"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'SELECT':
      return (
        <select
          id={def.id}
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm shadow-sm"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
        >
          <option value="">—</option>
          {def.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'MULTI_SELECT': {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="border-input flex flex-wrap gap-2 rounded-md border p-2">
          {def.options?.map((o) => {
            const checked = arr.includes(o.value);
            return (
              <label key={o.value} className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    onChange(
                      e.target.checked ? [...arr, o.value] : arr.filter((v) => v !== o.value),
                    );
                  }}
                />
                {o.label}
              </label>
            );
          })}
        </div>
      );
    }
    default:
      // TEXT, USER, CONTACT, FILE — string fallback
      return (
        <Input
          id={def.id}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

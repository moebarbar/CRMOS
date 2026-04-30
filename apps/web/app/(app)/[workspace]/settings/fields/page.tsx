'use client';

import { useState } from 'react';
import { customField as customFieldSchemas } from '@chiefos/shared';
import { CustomFieldsManager } from '@/components/modules/customFields/CustomFieldsManager';
import { cn } from '@/lib/utils/cn';

export default function CustomFieldsPage() {
  const [entity, setEntity] = useState<customFieldSchemas.CustomFieldEntity>('CONTACT');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Custom fields</h1>
        <p className="text-sm text-muted-foreground">
          Track data unique to your business on any record type.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        {customFieldSchemas.CUSTOM_FIELD_ENTITIES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEntity(e)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              entity === e
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {e.charAt(0) + e.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <CustomFieldsManager entity={entity} />
    </div>
  );
}

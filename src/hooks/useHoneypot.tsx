import { useState, type ReactElement } from 'react';

/**
 * SECURITY: honeypot anti-spam field for public forms.
 * Renders a text input named `website` that is visually removed and skipped by
 * keyboard/assistive tech; humans never fill it, bots usually do. The value is
 * sent as `website` in the payload and the backend silently drops submissions
 * where it is non-empty (see rejectHoneypot in docker/backend/server.js).
 */
export const HONEYPOT_FIELD = 'website';

export function useHoneypot(): { honeypotField: ReactElement; honeypotValue: string } {
  const [value, setValue] = useState('');

  const honeypotField = (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
    >
      <label htmlFor={`hp-${HONEYPOT_FIELD}`}>Website</label>
      <input
        id={`hp-${HONEYPOT_FIELD}`}
        type="text"
        name={HONEYPOT_FIELD}
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );

  return { honeypotField, honeypotValue: value };
}

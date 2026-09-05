import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../../hooks/useLocalizedPath';

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

/**
 * RGPD consent for public forms (art. 7: freely given, specific, informed,
 * unambiguous). Never pre-checked. The submitting form must refuse to send
 * while `checked` is false and must include `consent: true` + a timestamp in
 * the payload so the server can enforce and record it.
 */
export default function ConsentCheckbox({ id, checked, onChange, error }: ConsentCheckboxProps) {
  const { t } = useTranslation('common');
  const { localizedPath } = useLocalizedPath();
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 text-sm text-gray-700 cursor-pointer">
        <input
          id={id}
          name="consent"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span>
          {t('consent.label')}{' '}
          <Link
            to={localizedPath('/privacy')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 underline hover:text-indigo-700"
          >
            {t('consent.privacyLink')}
          </Link>
          . {t('consent.note')}
        </span>
      </label>
      {error && (
        <p id={errorId} className="text-red-500 text-xs mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

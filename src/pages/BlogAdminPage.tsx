import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, CheckCircle, Archive, RefreshCw, AlertTriangle } from 'lucide-react';
import CrmLayout from '../components/crm/CrmLayout';
import SEOHead from '../components/SEOHead';
import { api } from '../utils/api';

type PostStatus = 'draft' | 'published' | 'archived';

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  language: 'fr' | 'en' | 'nl';
  status: PostStatus;
  category: string | null;
  author_name: string | null;
  read_time: number | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

/**
 * CRM › Articles — review queue for the auto-blog.
 *
 * The n8n workflow parks an article (FR + EN + NL) as `draft` when its quality
 * gate fails (year mentions, forbidden "proof" phrasing, missing internal
 * links, too short) and mails the reasons. Until 2026-09-05 publishing such a
 * draft required a raw API call; this page lists drafts, previews them (the
 * public article page shows drafts to a logged-in user) and publishes or
 * archives the three language versions together.
 */
const STATUS_TABS: PostStatus[] = ['draft', 'published', 'archived'];

const baseSlug = (slug: string) => slug.replace(/-(en|nl)$/, '');

export default function BlogAdminPage() {
  const { t, i18n } = useTranslation('crm');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await api.get<AdminPost[]>('/blog-posts', { status, limit: 200 });
      setPosts(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('blogAdmin.loadError'));
    } finally {
      setLoading(false);
    }
  }, [status, t]);

  useEffect(() => { load(); }, [load]);

  // One row per subject: the FR post plus its EN/NL siblings.
  const groups = useMemo(() => {
    const map = new Map<string, AdminPost[]>();
    for (const p of posts) {
      const key = baseSlug(p.slug);
      map.set(key, [...(map.get(key) || []), p]);
    }
    return [...map.entries()]
      .map(([key, items]) => ({ key, items: items.sort((a, b) => a.language.localeCompare(b.language)) }))
      .sort((a, b) => (b.items[0].updated_at || '').localeCompare(a.items[0].updated_at || ''));
  }, [posts]);

  const setGroupStatus = async (items: AdminPost[], next: PostStatus) => {
    setBusy(baseSlug(items[0].slug));
    try {
      await Promise.all(items.map((p) => api.put(`/blog-posts/${p.id}`, { status: next })));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('blogAdmin.updateError'));
    } finally {
      setBusy(null);
    }
  };

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const previewHref = (p: AdminPost) => `${p.language === 'fr' ? '' : `/${p.language}`}/blog/${p.slug}`;

  return (
    <CrmLayout>
      <SEOHead title={t('blogAdmin.seoTitle')} noindex nofollow />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t('blogAdmin.title')}</h1>
            <p className="text-sm text-gray-600 mt-1">{t('blogAdmin.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t('blogAdmin.refresh')}
          </button>
        </div>

        <div role="tablist" aria-label={t('blogAdmin.title')} className="flex gap-2 border-b border-gray-200 mb-6">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              role="tab"
              type="button"
              aria-selected={status === s}
              onClick={() => setStatus(s)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                status === s ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {t(`blogAdmin.status.${s}`)}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-600">{t('blogAdmin.loading')}</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-gray-600">{t(`blogAdmin.empty.${status}`)}</p>
        ) : (
          <ul className="space-y-3">
            {groups.map(({ key, items }) => {
              const fr = items.find((p) => p.language === 'fr') || items[0];
              return (
                <li key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-gray-900 leading-snug">{fr.title}</h2>
                      <p className="mt-1 text-xs text-gray-500 font-mono truncate">{key}</p>
                      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                        <div><dt className="inline font-medium">{t('blogAdmin.columns.category')} : </dt><dd className="inline">{fr.category || '—'}</dd></div>
                        <div><dt className="inline font-medium">{t('blogAdmin.columns.author')} : </dt><dd className="inline">{fr.author_name || '—'}</dd></div>
                        <div><dt className="inline font-medium">{t('blogAdmin.columns.updated')} : </dt><dd className="inline">{fmtDate(fr.updated_at)}</dd></div>
                        {fr.published_at && (
                          <div><dt className="inline font-medium">{t('blogAdmin.columns.published')} : </dt><dd className="inline">{fmtDate(fr.published_at)}</dd></div>
                        )}
                      </dl>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {items.map((p) => (
                          <li key={p.id}>
                            <a
                              href={previewHref(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:border-indigo-400 hover:text-indigo-700"
                            >
                              {p.language.toUpperCase()}
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                        {items.length < 3 && (
                          <li className="text-xs text-amber-700 self-center">{t('blogAdmin.missingLanguages', { count: 3 - items.length })}</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {status !== 'published' && (
                        <button
                          type="button"
                          disabled={busy === key}
                          onClick={() => setGroupStatus(items, 'published')}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" aria-hidden="true" />
                          {t('blogAdmin.actions.publish')}
                        </button>
                      )}
                      {status !== 'archived' && (
                        <button
                          type="button"
                          disabled={busy === key}
                          onClick={() => setGroupStatus(items, 'archived')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                          {t('blogAdmin.actions.archive')}
                        </button>
                      )}
                      {status === 'archived' && (
                        <button
                          type="button"
                          disabled={busy === key}
                          onClick={() => setGroupStatus(items, 'draft')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {t('blogAdmin.actions.restore')}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </CrmLayout>
  );
}

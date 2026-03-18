import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import CrmLayout from '../components/crm/CrmLayout';
import PrivateRoute from '../components/PrivateRoute';
import {
  Linkedin,
  Plus,
  Send,
  Check,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Link2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Loader2,
  ExternalLink,
  Sparkles,
  X,
  Save
} from 'lucide-react';
import {
  LinkedinPost,
  LinkedinStatus,
  LinkedinSettings,
  fetchLinkedinStatus,
  fetchLinkedinConnectUrl,
  fetchLinkedinPosts,
  generateLinkedinPost,
  publishLinkedinPost,
  approveLinkedinPost,
  updateLinkedinPost,
  deleteLinkedinPost,
  fetchLinkedinSettings,
  updateLinkedinSettings
} from '../services/linkedinService';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  generated: { label: 'Généré', color: 'bg-blue-100 text-blue-700', icon: Sparkles },
  review_pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700', icon: Check },
  published: { label: 'Publié', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  failed: { label: 'Échoué', color: 'bg-red-100 text-red-700', icon: XCircle },
  queued: { label: 'En file', color: 'bg-orange-100 text-orange-700', icon: Clock },
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: Edit3 }
};

const LinkedinPage: React.FC = () => {
  const [status, setStatus] = useState<LinkedinStatus | null>(null);
  const [posts, setPosts] = useState<LinkedinPost[]>([]);
  const [total, setTotal] = useState(0);
  const [settings, setSettings] = useState<LinkedinSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<LinkedinPost | null>(null);
  const [editingPost, setEditingPost] = useState<LinkedinPost | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, postsRes, settingsRes] = await Promise.all([
        fetchLinkedinStatus().catch(() => ({ connected: false, message: 'Non connecté' } as LinkedinStatus)),
        fetchLinkedinPosts({ status: statusFilter || undefined, limit: 50 }),
        fetchLinkedinSettings().catch(() => null)
      ]);
      setStatus(statusRes);
      setPosts(postsRes.posts);
      setTotal(postsRes.total);
      setSettings(settingsRes);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConnect = async () => {
    try {
      const { url } = await fetchLinkedinConnectUrl();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion LinkedIn');
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError('');
      const post = await generateLinkedinPost();
      setSuccess(`Post généré : "${post.title}"`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur de génération');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      setPublishing(id);
      setError('');
      const result = await publishLinkedinPost(id);
      setSuccess(result.postUrl ? `Publié sur LinkedIn !` : 'Publication réussie');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Erreur de publication');
    } finally {
      setPublishing(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveLinkedinPost(id);
      setSuccess('Post approuvé');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce post ?')) return;
    try {
      await deleteLinkedinPost(id);
      setSelectedPost(null);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    try {
      await updateLinkedinPost(editingPost.id, { content: editContent });
      setEditingPost(null);
      setSuccess('Post mis à jour');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleAutoPublish = async () => {
    if (!settings?.linkedin_config) return;
    const newConfig = {
      ...settings.linkedin_config,
      auto_publish: !settings.linkedin_config.auto_publish,
      manual_approval: settings.linkedin_config.auto_publish
    };
    try {
      await updateLinkedinSettings('linkedin_config', newConfig);
      setSuccess(newConfig.auto_publish ? 'Publication automatique activée' : 'Approbation manuelle activée');
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const clearMessages = () => { setError(''); setSuccess(''); };

  if (loading) {
    return (
      <PrivateRoute>
        <CrmLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </CrmLayout>
      </PrivateRoute>
    );
  }

  return (
    <PrivateRoute>
      <CrmLayout>
        <Helmet>
          <title>LinkedIn Auto-Publishing | AInspiration CRM</title>
        </Helmet>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LinkedIn</h1>
                <p className="text-sm text-gray-500">Publication automatique de contenu IA</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Générer un post
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={clearMessages} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{success}</span>
              <button onClick={clearMessages} className="ml-auto"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Connection Status */}
          <div className="mb-6 p-4 bg-white border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${status?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {status?.connected
                      ? `Connecté : ${status.profileData?.name || 'LinkedIn'}`
                      : 'Non connecté à LinkedIn'}
                  </p>
                  {status?.connected && status.daysLeft && (
                    <p className="text-xs text-gray-500">Token expire dans {status.daysLeft} jours</p>
                  )}
                </div>
              </div>
              {!status?.connected && (
                <button
                  onClick={handleConnect}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Connecter LinkedIn
                </button>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && settings && (
            <div className="mb-6 p-4 bg-white border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Publication automatique</span>
                  <button
                    onClick={handleToggleAutoPublish}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.linkedin_config?.auto_publish ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.linkedin_config?.auto_publish ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Planning</span>
                  <p className="text-sm font-medium">
                    {settings.scheduling_config?.cron_day || 'jeudi'} à {settings.scheduling_config?.cron_hour || 10}h
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">Total posts</span>
                  <p className="text-sm font-medium">{total}</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="mb-4 flex gap-2">
            {['', 'review_pending', 'approved', 'published', 'generated', 'failed'].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === '' ? 'Tous' : STATUS_CONFIG[f]?.label || f}
              </button>
            ))}
            <button onClick={loadData} className="ml-auto p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Linkedin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucun post LinkedIn</p>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                Générer le premier post
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => {
                const statusConf = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
                const StatusIcon = statusConf.icon;

                return (
                  <div key={post.id} className="bg-white border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConf.label}
                            </span>
                            {post.angle && (
                              <span className="text-xs text-gray-400">{post.angle.replace('_', ' ')}</span>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(post.created_at).toLocaleDateString('fr-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 truncate">{post.title || 'Sans titre'}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                            {post.hook || post.content?.slice(0, 150)}
                          </p>
                          {post.hashtags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.hashtags.slice(0, 5).map((tag, i) => (
                                <span key={i} className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                  {tag.startsWith('#') ? tag : `#${tag}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {post.status !== 'published' && (
                            <button
                              onClick={() => { setEditingPost(post); setEditContent(post.content); }}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {post.status === 'review_pending' && (
                            <button
                              onClick={() => handleApprove(post.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Approuver"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {['generated', 'approved', 'queued'].includes(post.status) && (
                            <button
                              onClick={() => handlePublish(post.id)}
                              disabled={publishing === post.id || !status?.connected}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                              title="Publier"
                            >
                              {publishing === post.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Send className="w-4 h-4" />}
                            </button>
                          )}
                          {post.linkedin_post_url && (
                            <a
                              href={post.linkedin_post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Voir sur LinkedIn"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded view */}
                      {selectedPost?.id === post.id && (
                        <div className="mt-4 pt-4 border-t">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 p-4 rounded-lg">
                            {post.content}
                          </pre>
                          {post.published_at && (
                            <p className="mt-2 text-xs text-gray-400">
                              Publié le {new Date(post.published_at).toLocaleString('fr-BE')}
                            </p>
                          )}
                          {post.error_message && (
                            <p className="mt-2 text-xs text-red-500">Erreur : {post.error_message}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Edit Modal */}
          {editingPost && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Modifier le post</h3>
                  <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="w-full h-64 p-3 border rounded-lg text-sm font-sans resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{editContent.length} caractères</p>
                </div>
                <div className="flex justify-end gap-2 p-4 border-t">
                  <button
                    onClick={() => setEditingPost(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CrmLayout>
    </PrivateRoute>
  );
};

export default LinkedinPage;

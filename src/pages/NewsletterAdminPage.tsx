import React, { useState, useEffect } from 'react';
import { sanitizeHtml } from '../utils/validation';
import {
  Mail,
  Users,
  Send,
  Trash2,
  Plus,
  RefreshCw,
  Calendar,
  FileText,
  BarChart3,
  Sparkles,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CrmLayout from '../components/crm/CrmLayout';
import {
  getSubscribers,
  getNewsletters,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  sendNewsletter,
  deleteSubscriber,
  getNewsletterStats,
  generateNewsletterContent,
  getSendLogs,
  addSubscriber
} from '../services/newsletterService';
import { NewsletterSubscriber, Newsletter, NewsletterSendLog } from '../utils/types';

type TabType = 'dashboard' | 'subscribers' | 'newsletters' | 'history' | 'create';

interface SendLogWithEmail extends NewsletterSendLog {
  subscriber_email?: string;
}

export default function NewsletterAdminPage() {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    unsubscribedCount: 0,
    totalNewsletters: 0,
    sentNewsletters: 0
  });

  // Form state for creating newsletter
  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    content: '',
    html_content: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sendLogs, setSendLogs] = useState<SendLogWithEmail[]>([]);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('');
  const [isAddingSubscriber, setIsAddingSubscriber] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subscribersData, newslettersData, statsData, logsData] = await Promise.all([
        getSubscribers(),
        getNewsletters(),
        getNewsletterStats(),
        getSendLogs()
      ]);
      setSubscribers(subscribersData);
      setNewsletters(newslettersData);
      setStats(statsData);
      setSendLogs(logsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const generated = await generateNewsletterContent();
      setNewNewsletter({
        ...newNewsletter,
        subject: generated.subject,
        content: generated.content
      });
      setMessage({ type: 'success', text: 'Contenu généré avec succès!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la génération du contenu' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.subject || !newNewsletter.content) {
      setMessage({ type: 'error', text: 'Veuillez remplir le sujet et le contenu' });
      return;
    }

    try {
      await createNewsletter({
        subject: newNewsletter.subject,
        content: newNewsletter.content,
        html_content: newNewsletter.html_content,
        status: 'draft'
      });
      setMessage({ type: 'success', text: 'Newsletter créée avec succès!' });
      setNewNewsletter({ subject: '', content: '', html_content: '' });
      loadData();
      setActiveTab('newsletters');
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la création' });
    }
  };

  const handleSendNewsletter = async (newsletterId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir envoyer cette newsletter à tous les abonnés actifs?')) {
      return;
    }

    setIsSending(true);
    setMessage(null);
    try {
      const result = await sendNewsletter(newsletterId);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        loadData();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette newsletter?')) {
      return;
    }

    try {
      await deleteNewsletter(id);
      setMessage({ type: 'success', text: 'Newsletter supprimée' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonné?')) {
      return;
    }

    try {
      await deleteSubscriber(id);
      setMessage({ type: 'success', text: 'Abonné supprimé' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = newSubscriberEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Email invalide' });
      return;
    }

    setIsAddingSubscriber(true);
    setMessage(null);

    try {
      await addSubscriber(email, 'manual_admin');
      setMessage({ type: 'success', text: `Abonné ${email} ajouté avec succès` });
      setNewSubscriberEmail('');
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de l\'ajout de l\'abonné' });
    } finally {
      setIsAddingSubscriber(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: React.ElementType }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      unsubscribed: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      bounced: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      sent: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    const badge = badges[status] || badges.draft;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Abonnés actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscribers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total abonnés</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Newsletters envoyées</p>
              <p className="text-2xl font-bold text-gray-900">{stats.sentNewsletters}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Send className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Désabonnements</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unsubscribedCount}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveTab('create')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Créer une newsletter
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir les données
          </button>
        </div>
      </div>

      {/* Recent Newsletters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Newsletters récentes</h3>
        {newsletters.slice(0, 5).length > 0 ? (
          <div className="space-y-3">
            {newsletters.slice(0, 5).map(nl => (
              <div key={nl.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{nl.subject}</p>
                  <p className="text-sm text-gray-500">
                    {nl.sent_at ? new Date(nl.sent_at).toLocaleDateString('fr-FR') : 'Non envoyée'}
                  </p>
                </div>
                {getStatusBadge(nl.status)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aucune newsletter</p>
        )}
      </div>
    </div>
  );

  const renderSubscribers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold">Abonnés ({subscribers.length})</h3>

          {/* Add subscriber form */}
          <form onSubmit={handleAddSubscriber} className="flex gap-2">
            <input
              type="email"
              value={newSubscriberEmail}
              onChange={(e) => setNewSubscriberEmail(e.target.value)}
              placeholder="Email du nouvel abonné..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
              disabled={isAddingSubscriber}
            />
            <button
              type="submit"
              disabled={isAddingSubscriber || !newSubscriberEmail.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
            >
              {isAddingSubscriber ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Ajouter
            </button>
          </form>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {subscribers.map(sub => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    {sub.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(sub.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sub.source || 'website'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString('fr-FR') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteSubscriber(sub.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucun abonné pour le moment
          </div>
        )}
      </div>
    </div>
  );

  const renderNewsletters = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Newsletters ({newsletters.length})</h3>
        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Nouvelle
        </button>
      </div>
      <div className="divide-y divide-gray-200">
        {newsletters.map(nl => (
          <div key={nl.id} className="p-6 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-lg">{nl.subject}</h4>
                  {getStatusBadge(nl.status)}
                </div>
                <p className="text-gray-600 line-clamp-2 mb-2">{nl.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {nl.created_at ? new Date(nl.created_at).toLocaleDateString('fr-FR') : '-'}
                  </span>
                  {nl.recipients_count && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {nl.recipients_count} destinataires
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {nl.status === 'draft' && (
                  <button
                    onClick={() => handleSendNewsletter(nl.id)}
                    disabled={isSending}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Envoyer
                  </button>
                )}
                <button
                  onClick={() => handleDeleteNewsletter(nl.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {newsletters.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Aucune newsletter créée
          </div>
        )}
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Créer une newsletter</h3>

      <div className="space-y-6">
        {/* AI Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Générer avec l'IA
          </button>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sujet
          </label>
          <input
            type="text"
            value={newNewsletter.subject}
            onChange={(e) => setNewNewsletter({ ...newNewsletter, subject: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Sujet de la newsletter..."
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenu
          </label>
          <textarea
            value={newNewsletter.content}
            onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Contenu de la newsletter..."
          />
        </div>

        {/* HTML Content (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenu HTML (optionnel)
          </label>
          <textarea
            value={newNewsletter.html_content}
            onChange={(e) => setNewNewsletter({ ...newNewsletter, html_content: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
            placeholder="<html>...</html>"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setActiveTab('newsletters')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleCreateNewsletter}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Créer la newsletter
          </button>
        </div>
      </div>
    </div>
  );

  const renderHistory = () => {
    const sentNewsletters = newsletters.filter(n => n.status === 'sent');

    return (
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Newsletters envoyées</p>
                <p className="text-2xl font-bold text-gray-900">{sentNewsletters.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Emails envoyés</p>
                <p className="text-2xl font-bold text-gray-900">{sendLogs.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Destinataires uniques</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(sendLogs.map(l => l.subscriber_email)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sent Newsletters with Full Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Historique des newsletters envoyées</h3>
            <p className="text-sm text-gray-500">Cliquez sur une newsletter pour voir son contenu complet</p>
          </div>

          {sentNewsletters.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune newsletter envoyée pour le moment
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sentNewsletters.map(nl => {
                const nlLogs = sendLogs.filter(l => l.newsletter_id === nl.id);
                const isSelected = selectedNewsletter?.id === nl.id;

                return (
                  <div key={nl.id} className="p-6">
                    <div
                      className="cursor-pointer"
                      onClick={() => setSelectedNewsletter(isSelected ? null : nl)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{nl.subject}</h4>
                            {getStatusBadge(nl.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Envoyée le {nl.sent_at ? new Date(nl.sent_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {nlLogs.length} destinataire{nlLogs.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {/* Recipients */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Destinataires:</h5>
                          <div className="flex flex-wrap gap-2">
                            {nlLogs.map(log => (
                              <span
                                key={log.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                              >
                                <Mail className="w-3 h-3" />
                                {log.subscriber_email}
                                {log.status === 'sent' && <CheckCircle className="w-3 h-3 text-green-500" />}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Full Content */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Contenu de la newsletter:</h5>
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans bg-white p-4 rounded border">
                              {nl.content}
                            </pre>
                          </div>
                        </div>

                        {/* HTML Preview if available */}
                        {nl.html_content && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Aperçu HTML:</h5>
                            <div
                              className="bg-white p-4 rounded border prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: sanitizeHtml(nl.html_content) }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Send Logs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Journal des envois</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destinataire</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Newsletter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sendLogs.slice(0, 20).map(log => {
                  const newsletter = newsletters.find(n => n.id === log.newsletter_id);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.sent_at ? new Date(log.sent_at).toLocaleString('fr-FR') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {log.subscriber_email || log.subscriber_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {newsletter?.subject || 'Newsletter supprimée'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sendLogs.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Aucun envoi enregistré
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'subscribers', label: 'Abonnés', icon: Users },
    { id: 'newsletters', label: 'Newsletters', icon: FileText },
    { id: 'history', label: 'Historique', icon: Clock },
    { id: 'create', label: 'Créer', icon: Plus }
  ];

  return (
    <CrmLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion Newsletter</h1>
          <p className="text-gray-600">Gérez vos abonnés et envoyez des newsletters</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'subscribers' && renderSubscribers()}
            {activeTab === 'newsletters' && renderNewsletters()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'create' && renderCreate()}
          </>
        )}
      </div>
    </CrmLayout>
  );
}

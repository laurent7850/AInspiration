import React, { useState, useEffect } from 'react';
import {
  BarChart,
  PieChart,
  LineChart,
  Calendar,
  Download,
  Filter,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { fetchOpportunities } from '../../../services/opportunityService';
import { fetchTasks } from '../../../services/taskService';
import { fetchContacts } from '../../../services/contactService';
import { fetchCompanies } from '../../../services/companyService';
import { Opportunity, Task, Contact } from '../../../utils/types';
import SalesFunnelChart from './charts/SalesFunnelChart';
import SalesPerformanceChart from '../charts/SalesPerformanceChart';
import TaskCompletionChart from './charts/TaskCompletionChart';
import LeadSourceChart from './charts/LeadSourceChart';
import DateRangePicker from './DateRangePicker';

const ReportsDashboard: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{start: Date, end: Date}>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date()
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data
        const [opportunitiesData, tasksData, contactsData] = await Promise.all([
          fetchOpportunities(),
          fetchTasks(),
          fetchContacts()
        ]);
        
        setOpportunities(opportunitiesData);
        setTasks(tasksData);
        setContacts(contactsData);
      } catch (error) {
        console.error('Error loading report data:', error);
        setError('Impossible de charger les données des rapports');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter data based on selected date range
  const filteredOpportunities = opportunities.filter(opp => {
    const date = new Date(opp.created_at || '');
    return date >= dateRange.start && date <= dateRange.end;
  });
  
  const filteredTasks = tasks.filter(task => {
    const date = new Date(task.created_at || '');
    return date >= dateRange.start && date <= dateRange.end;
  });
  
  // Calculate key metrics
  const totalOpportunities = filteredOpportunities.length;
  const wonOpportunities = filteredOpportunities.filter(opp => opp.stage === 'Gagné').length;
  const lostOpportunities = filteredOpportunities.filter(opp => opp.stage === 'Perdu').length;
  const winRate = totalOpportunities ? Math.round((wonOpportunities / totalOpportunities) * 100) : 0;
  
  const totalEstimatedValue = filteredOpportunities.reduce(
    (sum, opp) => sum + (opp.estimated_value || 0),
    0
  );
  
  const wonValue = filteredOpportunities
    .filter(opp => opp.stage === 'Gagné')
    .reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  
  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const totalTasks = filteredTasks.length;
  const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const exportReport = () => {
    const fmt = (v: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);
    const dateStr = (d: Date) => d.toLocaleDateString('fr-FR');
    const esc = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const oppRows = filteredOpportunities.map(opp => `
      <tr>
        <td>${esc(opp.name)}</td>
        <td>${esc(opp.company_name || '-')}</td>
        <td><span class="badge badge-${opp.stage === 'Gagné' ? 'won' : opp.stage === 'Perdu' ? 'lost' : 'default'}">${esc(opp.stage)}</span></td>
        <td class="num">${fmt(opp.estimated_value || 0)}</td>
        <td>${opp.close_date ? new Date(opp.close_date).toLocaleDateString('fr-FR') : '-'}</td>
        <td>${opp.created_at ? new Date(opp.created_at).toLocaleDateString('fr-FR') : '-'}</td>
      </tr>`).join('');

    const taskRows = filteredTasks.map(task => `
      <tr>
        <td>${esc(task.title)}</td>
        <td><span class="badge badge-${task.completed ? 'won' : 'default'}">${task.completed ? 'Terminée' : 'En cours'}</span></td>
        <td>${esc(task.priority || '-')}</td>
        <td>${task.due_date ? new Date(task.due_date).toLocaleDateString('fr-FR') : '-'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<title>Rapport CRM - AInspiration</title>
<style>
  @page { size: A4; margin: 12mm 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; font-size: 11px; line-height: 1.5; }
  .header { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; padding: 24px 28px; border-radius: 0 0 8px 8px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .header p { font-size: 11px; opacity: 0.9; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .kpi { background: #f5f3ff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 14px 16px; }
  .kpi .label { font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .kpi .value { font-size: 18px; font-weight: 700; color: #111827; margin-top: 4px; }
  .summary { color: #6b7280; font-size: 10px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
  h2 { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 10px; padding-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10px; }
  th { background: #4f46e5; color: #fff; text-align: left; padding: 8px 10px; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .badge { padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .badge-won { background: #d1fae5; color: #065f46; }
  .badge-lost { background: #fee2e2; color: #991b1b; }
  .badge-default { background: #e0e7ff; color: #3730a3; }
  .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 8px; color: #9ca3af; padding: 8px; border-top: 1px solid #e5e7eb; }
  @media print { .no-print { display: none; } }
</style></head><body>
<div class="header">
  <h1>AInspiration — Rapport CRM</h1>
  <p>Période : ${dateStr(dateRange.start)} – ${dateStr(dateRange.end)} &nbsp;|&nbsp; Généré le ${dateStr(new Date())}</p>
</div>
<div class="kpis">
  <div class="kpi"><div class="label">Valeur pipeline</div><div class="value">${fmt(totalEstimatedValue)}</div></div>
  <div class="kpi"><div class="label">Valeur gagnée</div><div class="value">${fmt(wonValue)}</div></div>
  <div class="kpi"><div class="label">Taux de conversion</div><div class="value">${winRate}%</div></div>
  <div class="kpi"><div class="label">Productivité</div><div class="value">${taskCompletionRate}%</div></div>
</div>
<div class="summary">${wonOpportunities} gagnées / ${lostOpportunities} perdues / ${totalOpportunities} totales &nbsp;·&nbsp; ${completedTasks} tâches terminées / ${totalTasks} totales</div>
<h2>Opportunités</h2>
<table><thead><tr><th>Nom</th><th>Entreprise</th><th>Étape</th><th class="num">Valeur</th><th>Clôture</th><th>Création</th></tr></thead><tbody>${oppRows}</tbody></table>
<h2>Tâches</h2>
<table><thead><tr><th>Titre</th><th>Statut</th><th>Priorité</th><th>Échéance</th></tr></thead><tbody>${taskRows}</tbody></table>
<div class="footer">AInspiration — Rapport confidentiel</div>
</body></html>`;

    // Use hidden iframe to trigger print — no popup, no about:blank
    let iframe = document.getElementById('report-print-frame') as HTMLIFrameElement | null;
    if (iframe) iframe.remove();
    iframe = document.createElement('iframe');
    iframe.id = 'report-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
      iframe.onload = () => {
        iframe!.contentWindow?.print();
        setTimeout(() => iframe!.remove(), 1000);
      };
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      
      const [opportunitiesData, tasksData, contactsData] = await Promise.all([
        fetchOpportunities(),
        fetchTasks(),
        fetchContacts()
      ]);
      
      setOpportunities(opportunitiesData);
      setTasks(tasksData);
      setContacts(contactsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Impossible de rafraîchir les données');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart className="w-6 h-6 text-indigo-600" />
          Rapports et Analyses
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            startDate={dateRange.start} 
            endDate={dateRange.end} 
            onChange={(start, end) => setDateRange({start, end})}
          />
          
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Rafraîchir</span>
            </button>
            
            <button
              onClick={exportReport}
              className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPIs summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Valeur du pipeline</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalEstimatedValue)}
          </p>
          <div className="mt-2 text-sm">
            <span className="text-green-600 font-medium">
              {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(wonValue)} gagnés
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Taux de conversion</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{winRate}%</p>
          <div className="mt-2 text-sm text-gray-600">
            {wonOpportunities} gagnées / {totalOpportunities} totales
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Valeur moyenne</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {totalOpportunities ? 
              new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                .format(totalEstimatedValue / totalOpportunities) :
              '€0'}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            Par opportunité
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-sm text-gray-500">Productivité</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{taskCompletionRate}%</p>
          <div className="mt-2 text-sm text-gray-600">
            {completedTasks} tâches terminées / {totalTasks} totales
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Pipeline commercial
          </h3>
          <div className="h-64">
            <SalesFunnelChart opportunities={filteredOpportunities} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-indigo-600" />
            Performance des ventes
          </h3>
          <div className="h-64">
            <SalesPerformanceChart opportunities={filteredOpportunities} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-600" />
            Réalisation des tâches
          </h3>
          <div className="h-64">
            <TaskCompletionChart tasks={filteredTasks} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Sources des leads
          </h3>
          <div className="h-64">
            <LeadSourceChart contacts={contacts} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;
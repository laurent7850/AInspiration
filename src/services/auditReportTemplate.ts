/**
 * Template de rapport d'audit IA standardisé — AInspiration
 *
 * Ce template définit la structure du rapport d'audit en 5 sections
 * conformément à la décision du Comité de Direction #1 (16 mars 2026).
 *
 * Utilisé par le workflow n8n pour générer le rapport PDF personnalisé.
 */

export interface AuditReportData {
  // Informations client
  clientName: string;
  companyName: string;
  sector: string;
  email: string;
  date: string;

  // Section 1: Contexte
  companyDescription: string;
  currentTools: string[];
  teamSize: string;
  mainChallenges: string[];

  // Section 2: Diagnostic
  processesAnalyzed: Array<{
    name: string;
    timeSpentWeekly: string;
    automationPotential: 'élevé' | 'moyen' | 'faible';
  }>;

  // Section 3: Opportunités
  opportunities: Array<{
    title: string;
    description: string;
    estimatedTimeSaved: string;
    priority: 'haute' | 'moyenne' | 'basse';
    complexity: 'simple' | 'modérée' | 'complexe';
  }>;

  // Section 4: Recommandations (3 max)
  recommendations: Array<{
    title: string;
    description: string;
    expectedBenefit: string;
    implementationTime: string;
  }>;

  // Section 5: Prochaines étapes
  nextSteps: string[];
  proposedPackage?: {
    name: string;
    price: string;
    deliveryTime: string;
    description: string;
  };
}

/**
 * Structure HTML du rapport d'audit pour génération PDF.
 * Format : 2 pages A4, 5 sections.
 */
export function generateAuditReportHTML(data: AuditReportData): string {
  const today = data.date || new Date().toLocaleDateString('fr-BE');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport d'Audit IA — ${data.companyName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; font-size: 11pt; line-height: 1.5; }
    .page { width: 210mm; min-height: 297mm; padding: 20mm; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 3px solid #4f46e5; }
    .logo { font-size: 20pt; font-weight: bold; color: #4f46e5; }
    .meta { text-align: right; font-size: 9pt; color: #6b7280; }
    h1 { font-size: 18pt; color: #111827; margin-bottom: 8px; }
    h2 { font-size: 13pt; color: #4f46e5; margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
    h3 { font-size: 11pt; color: #374151; margin: 8px 0 4px; }
    p { margin-bottom: 8px; color: #4b5563; }
    ul { margin-left: 16px; margin-bottom: 8px; }
    li { margin-bottom: 4px; color: #4b5563; }
    table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; font-size: 10pt; }
    th { background: #eef2ff; color: #4f46e5; text-align: left; padding: 6px 8px; border: 1px solid #e5e7eb; }
    td { padding: 6px 8px; border: 1px solid #e5e7eb; }
    .highlight { background: #eef2ff; border-radius: 8px; padding: 12px 16px; margin: 12px 0; }
    .priority-haute { color: #dc2626; font-weight: bold; }
    .priority-moyenne { color: #f59e0b; font-weight: bold; }
    .priority-basse { color: #10b981; }
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 8pt; color: #9ca3af; text-align: center; }
    .disclaimer { font-size: 8pt; color: #9ca3af; font-style: italic; margin-top: 16px; padding: 8px; background: #f9fafb; border-radius: 4px; }
  </style>
</head>
<body>

  <!-- PAGE 1 -->
  <div class="page">
    <div class="header">
      <div class="logo">AInspiration</div>
      <div class="meta">
        Rapport d'Audit IA<br>
        ${today}<br>
        Confidentiel
      </div>
    </div>

    <h1>Audit IA — ${data.companyName}</h1>
    <p><strong>Destinataire :</strong> ${data.clientName} · ${data.companyName}</p>
    <p><strong>Secteur :</strong> ${data.sector} · <strong>Équipe :</strong> ${data.teamSize}</p>

    <h2>1. Contexte de l'entreprise</h2>
    <p>${data.companyDescription}</p>
    <h3>Outils actuels</h3>
    <ul>
      ${data.currentTools.map(t => `<li>${t}</li>`).join('\n      ')}
    </ul>
    <h3>Défis principaux</h3>
    <ul>
      ${data.mainChallenges.map(c => `<li>${c}</li>`).join('\n      ')}
    </ul>

    <h2>2. Diagnostic des processus</h2>
    <table>
      <thead>
        <tr>
          <th>Processus</th>
          <th>Temps/semaine</th>
          <th>Potentiel d'automatisation</th>
        </tr>
      </thead>
      <tbody>
        ${data.processesAnalyzed.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.timeSpentWeekly}</td>
          <td class="priority-${p.automationPotential === 'élevé' ? 'haute' : p.automationPotential === 'moyen' ? 'moyenne' : 'basse'}">${p.automationPotential}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <h2>3. Opportunités identifiées</h2>
    <table>
      <thead>
        <tr>
          <th>Opportunité</th>
          <th>Temps gagné</th>
          <th>Priorité</th>
          <th>Complexité</th>
        </tr>
      </thead>
      <tbody>
        ${data.opportunities.map(o => `
        <tr>
          <td><strong>${o.title}</strong><br><span style="font-size:9pt;color:#6b7280">${o.description}</span></td>
          <td>${o.estimatedTimeSaved}</td>
          <td class="priority-${o.priority}">${o.priority}</td>
          <td>${o.complexity}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <div class="footer">
      AInspiration — Division de Distr'Action SRL · Enghien, Belgique · www.ainspiration.eu
    </div>
  </div>

  <!-- PAGE 2 -->
  <div class="page">
    <div class="header">
      <div class="logo">AInspiration</div>
      <div class="meta">Audit IA — ${data.companyName}<br>${today}</div>
    </div>

    <h2>4. Nos recommandations</h2>
    ${data.recommendations.map((r, i) => `
    <div class="highlight">
      <h3>Recommandation ${i + 1} : ${r.title}</h3>
      <p>${r.description}</p>
      <p><strong>Bénéfice attendu :</strong> ${r.expectedBenefit}</p>
      <p><strong>Délai de mise en œuvre :</strong> ${r.implementationTime}</p>
    </div>`).join('')}

    <h2>5. Prochaines étapes</h2>
    <ul>
      ${data.nextSteps.map(s => `<li>${s}</li>`).join('\n      ')}
    </ul>

    ${data.proposedPackage ? `
    <div class="highlight" style="border-left: 4px solid #4f46e5; margin-top: 16px;">
      <h3>${data.proposedPackage.name}</h3>
      <p><strong>${data.proposedPackage.price}</strong> · Livraison : ${data.proposedPackage.deliveryTime}</p>
      <p>${data.proposedPackage.description}</p>
    </div>` : ''}

    <div class="disclaimer">
      Ce rapport est fourni à titre informatif uniquement. Les recommandations qu'il contient
      ne constituent pas un engagement de résultat ni un conseil juridique, fiscal ou financier.
      AInspiration (Distr'Action SRL) ne saurait être tenu responsable des décisions prises
      sur la base de ce rapport. Les données communiquées sont traitées conformément à notre
      politique de confidentialité et au RGPD.
    </div>

    <div class="footer">
      AInspiration — Division de Distr'Action SRL · Enghien, Belgique · www.ainspiration.eu<br>
      Contact : info@ainspiration.eu · +32 477 94 28 65
    </div>
  </div>

</body>
</html>`;
}

/**
 * Données d'exemple pour tester le template
 */
export const sampleAuditData: AuditReportData = {
  clientName: 'Jean Dupont',
  companyName: 'Cabinet Dupont & Associés',
  sector: 'Profession libérale — Comptabilité',
  email: 'jean@dupont-associes.be',
  date: new Date().toLocaleDateString('fr-BE'),
  teamSize: '8 personnes',
  companyDescription: 'Cabinet comptable basé à Bruxelles, spécialisé dans l\'accompagnement de PME belges. Gère environ 120 dossiers clients avec une équipe de 8 collaborateurs.',
  currentTools: ['Excel pour la planification', 'Logiciel comptable Winbooks', 'Gmail pour la communication', 'Classement papier pour l\'archivage'],
  mainChallenges: ['Volume élevé de saisies manuelles', 'Relances clients chronophages', 'Difficultés de planification des échéances fiscales'],
  processesAnalyzed: [
    { name: 'Saisie de factures', timeSpentWeekly: '12h', automationPotential: 'élevé' },
    { name: 'Relances clients', timeSpentWeekly: '5h', automationPotential: 'élevé' },
    { name: 'Planification échéances', timeSpentWeekly: '3h', automationPotential: 'moyen' },
    { name: 'Reporting mensuel', timeSpentWeekly: '4h', automationPotential: 'moyen' }
  ],
  opportunities: [
    { title: 'Automatisation de la saisie de factures', description: 'OCR + extraction automatique des données via IA', estimatedTimeSaved: '10h/semaine', priority: 'haute', complexity: 'modérée' },
    { title: 'Relances automatiques', description: 'Séquence email intelligente basée sur l\'historique client', estimatedTimeSaved: '4h/semaine', priority: 'haute', complexity: 'simple' },
    { title: 'Dashboard de suivi des échéances', description: 'Tableau de bord centralisé avec alertes automatiques', estimatedTimeSaved: '2h/semaine', priority: 'moyenne', complexity: 'simple' }
  ],
  recommendations: [
    { title: 'Automatiser les relances clients', description: 'Mise en place d\'un workflow n8n connecté à votre logiciel comptable qui envoie des relances personnalisées automatiquement selon les délais de paiement.', expectedBenefit: 'Gain de 4h/semaine et amélioration du taux de recouvrement', implementationTime: '5 jours ouvrés' },
    { title: 'Extraction automatique de factures', description: 'Solution OCR avec IA pour extraire automatiquement les données des factures fournisseurs et les intégrer dans Winbooks.', expectedBenefit: 'Gain de 8-10h/semaine et réduction des erreurs de saisie', implementationTime: '2-3 semaines' },
    { title: 'Tableau de bord des échéances', description: 'Dashboard centralisé reprenant toutes les échéances fiscales et sociales avec alertes automatiques par email.', expectedBenefit: 'Zéro oubli d\'échéance, vision globale en temps réel', implementationTime: '1 semaine' }
  ],
  nextSteps: [
    'Planifier un call de 30 minutes pour discuter des recommandations',
    'Démarrer par la Recommandation 1 (relances automatiques) — impact rapide',
    'Évaluer les résultats après 4 semaines avant de passer à la Recommandation 2'
  ],
  proposedPackage: {
    name: 'Pack Automatisation Express',
    price: 'À partir de 1 043 € HTVA (offre lancement) + 290 €/mois',
    deliveryTime: '5 jours ouvrés',
    description: 'Automatisation complète de vos relances clients via un workflow n8n sur mesure, connecté à votre environnement existant. Inclut : développement, tests, mise en production et formation de votre équipe.'
  }
};

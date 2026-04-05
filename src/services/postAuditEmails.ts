/**
 * Emails de conversion post-audit — AInspiration
 *
 * 3 templates d'emails de suivi personnalisés par segment,
 * envoyés après la livraison du rapport d'audit IA gratuit.
 *
 * Objectif : convertir vers le "Pack Automatisation Express" (1490€ HTVA).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SegmentKey =
  | 'profession_liberale'
  | 'pme'
  | 'commerce_local';

export interface PostAuditEmail {
  /** Identifiant du segment cible */
  segment: SegmentKey;
  /** Libellé lisible du segment */
  segmentLabel: string;
  /** Objet de l'email */
  subject: string;
  /** Corps de l'email en HTML (inline-style friendly) */
  body: string;
  /** Balises de merge optionnelles utilisées dans le body */
  mergeTags: string[];
}

// ---------------------------------------------------------------------------
// Données
// ---------------------------------------------------------------------------

export const postAuditEmails: PostAuditEmail[] = [
  // ── 1. Profession libérale ──────────────────────────────────────────────
  {
    segment: 'profession_liberale',
    segmentLabel: 'Profession libérale (avocats, comptables, architectes)',
    subject: '{{prenom}}, votre audit IA est prêt — 2 actions rapides pour gagner du temps',
    mergeTags: ['{{prenom}}', '{{entreprise}}', '{{heures_economisees}}', '{{lien_agenda}}'],
    body: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.7; max-width: 600px; margin: 0 auto; padding: 24px;">

  <p style="font-size: 16px;">Bonjour {{prenom}},</p>

  <p>
    Merci d'avoir pris le temps de réaliser votre audit IA avec AInspiration.
    Votre rapport personnalisé est disponible — et les résultats sont encourageants.
  </p>

  <p>
    En analysant les processus de <strong>{{entreprise}}</strong>, nous avons identifié
    un potentiel d'économie de <strong>{{heures_economisees}} heures par semaine</strong>.
    Voici deux actions concrètes que vous pouvez mettre en place rapidement :
  </p>

  <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px;"><strong>Quick Win #1 — Automatisation de la prise de rendez-vous</strong></p>
    <p style="margin: 0;">
      Fini les allers-retours par email. Un système de réservation en ligne synchronisé
      avec votre agenda libère en moyenne 3 à 5 heures par semaine pour un cabinet.
    </p>
  </div>

  <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px;"><strong>Quick Win #2 — Gestion documentaire intelligente</strong></p>
    <p style="margin: 0;">
      Classification automatique des documents entrants (factures, contrats, courriers) :
      vos collaborateurs retrouvent tout en quelques secondes au lieu de fouiller dans les dossiers.
    </p>
  </div>

  <p>
    Pour mettre tout cela en place sans mobiliser votre équipe, nous proposons le
    <strong>Pack Automatisation Express</strong> :
  </p>

  <div style="background: #1a1a2e; color: #ffffff; padding: 20px 24px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 6px; font-size: 18px; font-weight: 700;">Pack Automatisation Express</p>
    <p style="margin: 0 0 12px; font-size: 14px; opacity: 0.85;">
      Implémentation clé en main de vos 2-3 premières automatisations
    </p>
    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
      <li>Analyse approfondie de vos workflows</li>
      <li>Configuration et tests des automatisations</li>
      <li>Formation de votre équipe (1 h)</li>
      <li>Support prioritaire pendant 30 jours</li>
    </ul>
    <p style="margin: 16px 0 0; font-size: 16px; font-weight: 400; text-decoration: line-through; color: #999;">1 490 € HTVA</p>
    <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700;">1 043 € <span style="font-size: 14px; font-weight: 400;">HTVA (offre lancement)</span></p>
    <p style="margin: 4px 0 0; font-size: 14px; color: #666;">puis 290 €/mois — hébergement, support & monitoring</p>
    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.7;">Livré en 5 jours ouvrés</p>
  </div>

  <p style="text-align: center; margin: 28px 0;">
    <a href="{{lien_agenda}}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Réserver mon appel de 30 min
    </a>
  </p>

  <p>
    Cet appel est sans engagement : on parcourt votre audit ensemble et on identifie
    les actions prioritaires pour votre cabinet.
  </p>

  <p>Belle journée,<br><strong>L'équipe AInspiration</strong></p>

  <p style="font-size: 12px; color: #888; margin-top: 32px;">
    AInspiration — Automatisation IA pour entreprises belges<br>
    <a href="https://ainspiration.eu" style="color: #3b82f6;">ainspiration.eu</a>
  </p>

</body>
</html>`,
  },

  // ── 2. PME (5-50 personnes) ─────────────────────────────────────────────
  {
    segment: 'pme',
    segmentLabel: 'PME (5-50 personnes)',
    subject: '{{prenom}}, les 2 automatisations qui changent tout pour une PME',
    mergeTags: ['{{prenom}}', '{{entreprise}}', '{{heures_economisees}}', '{{lien_agenda}}'],
    body: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.7; max-width: 600px; margin: 0 auto; padding: 24px;">

  <p style="font-size: 16px;">Bonjour {{prenom}},</p>

  <p>
    Votre audit IA est terminé et les conclusions sont claires : <strong>{{entreprise}}</strong>
    peut gagner <strong>{{heures_economisees}} heures par semaine</strong> grâce à quelques
    automatisations ciblées.
  </p>

  <p>Deux chantiers ressortent systématiquement chez les PME de votre taille :</p>

  <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px;"><strong>Quick Win #1 — Onboarding client automatisé</strong></p>
    <p style="margin: 0;">
      Dès qu'un devis est signé, le système crée automatiquement la fiche client,
      envoie le welcome pack et planifie le kick-off. Résultat : zéro oubli, une
      première impression irréprochable et 4 à 6 heures gagnées par semaine.
    </p>
  </div>

  <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px;"><strong>Quick Win #2 — Reporting hebdomadaire auto-généré</strong></p>
    <p style="margin: 0;">
      Chaque lundi matin, un tableau de bord consolidé (ventes, tâches, KPIs) arrive
      dans la boîte mail de votre direction. Plus besoin de compiler manuellement les
      chiffres depuis 3 outils différents.
    </p>
  </div>

  <p>
    Pour implémenter ces automatisations sans perturber votre activité,
    nous avons conçu le <strong>Pack Automatisation Express</strong> :
  </p>

  <div style="background: #1a1a2e; color: #ffffff; padding: 20px 24px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 6px; font-size: 18px; font-weight: 700;">Pack Automatisation Express</p>
    <p style="margin: 0 0 12px; font-size: 14px; opacity: 0.85;">
      Vos 2-3 premières automatisations, opérationnelles en une semaine
    </p>
    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
      <li>Audit technique de vos outils existants</li>
      <li>Développement et intégration des workflows</li>
      <li>Formation de votre équipe (1 h)</li>
      <li>Support prioritaire pendant 30 jours</li>
    </ul>
    <p style="margin: 16px 0 0; font-size: 16px; font-weight: 400; text-decoration: line-through; color: #999;">1 490 € HTVA</p>
    <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700;">1 043 € <span style="font-size: 14px; font-weight: 400;">HTVA (offre lancement)</span></p>
    <p style="margin: 4px 0 0; font-size: 14px; color: #666;">puis 290 €/mois — hébergement, support & monitoring</p>
    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.7;">Livré en 5 jours ouvrés</p>
  </div>

  <p style="text-align: center; margin: 28px 0;">
    <a href="{{lien_agenda}}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Planifier un appel de 30 min
    </a>
  </p>

  <p>
    En 30 minutes, on passe en revue votre rapport, on priorise les actions
    et on vous donne un plan d'exécution concret. Sans engagement.
  </p>

  <p>A bientôt,<br><strong>L'équipe AInspiration</strong></p>

  <p style="font-size: 12px; color: #888; margin-top: 32px;">
    AInspiration — Automatisation IA pour entreprises belges<br>
    <a href="https://ainspiration.eu" style="color: #3b82f6;">ainspiration.eu</a>
  </p>

</body>
</html>`,
  },

  // ── 3. Commerce / Restaurant local ──────────────────────────────────────
  {
    segment: 'commerce_local',
    segmentLabel: 'Commerce / Restaurant local',
    subject: '{{prenom}}, 2 idées pour remplir votre établissement sans effort supplémentaire',
    mergeTags: ['{{prenom}}', '{{entreprise}}', '{{heures_economisees}}', '{{lien_agenda}}'],
    body: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.7; max-width: 600px; margin: 0 auto; padding: 24px;">

  <p style="font-size: 16px;">Bonjour {{prenom}},</p>

  <p>
    Merci pour votre confiance ! Votre audit IA est terminé et le verdict est positif :
    <strong>{{entreprise}}</strong> peut économiser <strong>{{heures_economisees}} heures par semaine</strong>
    tout en améliorant l'expérience de vos clients.
  </p>

  <p>Deux pistes d'action immédiates pour votre secteur :</p>

  <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px;"><strong>Quick Win #1 — Réservations et commandes en pilote automatique</strong></p>
    <p style="margin: 0;">
      Un chatbot intelligent sur votre site et vos réseaux sociaux gère les réservations,
      répond aux questions fréquentes (horaires, menu, allergènes) et envoie des rappels
      automatiques. Moins de no-shows, moins de temps au téléphone.
    </p>
  </div>

  <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px;"><strong>Quick Win #2 — Avis Google et fidélisation automatisés</strong></p>
    <p style="margin: 0;">
      Après chaque visite, un SMS ou email automatique invite vos clients à laisser un avis
      Google. Résultat : votre note grimpe, votre visibilité locale augmente et les clients
      satisfaits reviennent grâce à des offres personnalisées.
    </p>
  </div>

  <p>
    Pour tout mettre en place sans vous détourner de votre activité, découvrez le
    <strong>Pack Automatisation Express</strong> :
  </p>

  <div style="background: #1a1a2e; color: #ffffff; padding: 20px 24px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 0 0 6px; font-size: 18px; font-weight: 700;">Pack Automatisation Express</p>
    <p style="margin: 0 0 12px; font-size: 14px; opacity: 0.85;">
      Automatisations sur mesure pour commerces et restaurants
    </p>
    <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
      <li>Configuration du chatbot ou système de réservation</li>
      <li>Automatisation des demandes d'avis et fidélisation</li>
      <li>Formation pratique (1 h)</li>
      <li>Support prioritaire pendant 30 jours</li>
    </ul>
    <p style="margin: 16px 0 0; font-size: 16px; font-weight: 400; text-decoration: line-through; color: #999;">1 490 € HTVA</p>
    <p style="margin: 4px 0 0; font-size: 22px; font-weight: 700;">1 043 € <span style="font-size: 14px; font-weight: 400;">HTVA (offre lancement)</span></p>
    <p style="margin: 4px 0 0; font-size: 14px; color: #666;">puis 290 €/mois — hébergement, support & monitoring</p>
    <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.7;">Livré en 5 jours ouvrés</p>
  </div>

  <p style="text-align: center; margin: 28px 0;">
    <a href="{{lien_agenda}}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Réserver mon appel de 30 min
    </a>
  </p>

  <p>
    On regarde ensemble votre audit, on choisit les priorités et on vous propose
    un calendrier réaliste. C'est gratuit et sans engagement.
  </p>

  <p>A très vite,<br><strong>L'équipe AInspiration</strong></p>

  <p style="font-size: 12px; color: #888; margin-top: 32px;">
    AInspiration — Automatisation IA pour entreprises belges<br>
    <a href="https://ainspiration.eu" style="color: #3b82f6;">ainspiration.eu</a>
  </p>

</body>
</html>`,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retourne l'email correspondant à un segment donné */
export function getEmailBySegment(segment: SegmentKey): PostAuditEmail | undefined {
  return postAuditEmails.find((e) => e.segment === segment);
}

/** Remplace les merge tags dans le body d'un email */
export function renderEmail(
  email: PostAuditEmail,
  data: Record<string, string>,
): string {
  let rendered = email.body;
  for (const [tag, value] of Object.entries(data)) {
    const key = tag.startsWith('{{') ? tag : `{{${tag}}}`;
    rendered = rendered.split(key).join(value);
  }
  return rendered;
}

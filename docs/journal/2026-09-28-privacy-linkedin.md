---
date: 2026-09-28
projet: AInspiration
ou: Claude Code
type: Avancée
notion: non
prochaine-action: Répondre à l'e-mail de Microsoft Vetting Services sur divers@distr-action.com
---

## Fait

- **Politique de confidentialité mise à jour pour la demande d'accès LinkedIn** (Community
  Management API, application « Distr-action Pages », formulaire à soumettre avant le
  **9 octobre 2026**). LinkedIn vérifie que l'organisation, le site, le domaine e-mail et la
  page désignent la même entité ; la page nommait « AInspiration » sans la société.
- Section 1 : responsable du traitement nommé — « AInspiration est une marque de
  Distr'Action SRL (BCE BE0462122648, siège Chaussée Brunehault 27, 7041 Givry) ».
  Numéro et siège confirmés par Laurent le 28/09.
- Nouvelle section « Publication sur LinkedIn » après les formulaires : commentaires
  conservés **48 h** au plus, informations de profil **24 h** au plus (les plafonds des
  *data storage requirements* de LinkedIn), aucun autre usage, hébergement UE, base légale
  intérêt légitime (art. 6.1.f), droits à info@ainspiration.eu. Texte repris de l'annexe A
  du dossier `CommunityOS/docs/connectors/linkedin-pages-access-request.md`, lu en lecture
  seule sur autorisation explicite de Laurent ; traduit en EN et NL.
- Clés `privacy.s1_controller`, `privacy.linkedin_{title,body,basis}` dans
  `public/locales/{fr,en,nl}/legal.json`, rendues par `src/components/PrivacyPolicy.tsx`.
  Le rendu serveur (`legal#privacy`) les sert sans modification du backend.
- Déployé dans l'ordre : commit, build (214 entrées), manifeste poussé, Netlify,
  **214/214 vérifiées sur le CDN**, `--force-recreate` (« Frontend: 214 files
  downloaded »). Vérifié en production dans les trois langues, HTML brut **et** rendu
  navigateur. 84/84 tests, CI verte, contrôle de santé 27/27.
- Dans la foulée, sur instruction de Laurent : page LinkedIn distr'action SRL complétée
  (présentation, siège de Givry, domaine distr-action.com), e-mail développeur
  `divers@distr-action.com` vérifié, et **formulaire d'accès soumis le 28/09/2026**
  (Direct Advertiser + Page management). Détail dans `ops/journal/2026-09-28.md`.

## Cassé

- Rien.


## Reste

- **Relecture juridique** (base légale, durées) : le texte a été rédigé sans DPO.
- Vérification de **Microsoft Vetting Services** à venir sur divers@distr-action.com, puis
  décision de LinkedIn par e-mail.

# Consigne — archiver le SLA v1.0 (session Paperclip)

**Cadré en session Claude Code AInspiration le 22/09/2026. À exécuter depuis le dépôt
Paperclip, pas depuis celui-ci.**

> Ce fichier n'est pas un chantier AInspiration : c'est une consigne prête à coller dans une
> session ouverte sur `C:\Users\laure\OneDrive\Documents\Claude code\Paperclip`, qui est un
> dépôt git à part entière. Rien de ce qui suit ne doit être exécuté depuis une session
> AInspiration — voir la règle « une session par dépôt » du `CLAUDE.md` global.

## La décision

**Le document SLA est archivé sans successeur.** Arbitrage de Laurent, 22/09/2026.

Ce n'est pas seulement qu'il a vieilli. Un document SLA autonome **est**, par construction,
un engagement qui s'applique par défaut — or la section 11 des CGV a explicitement retiré
cette notion le 18/09 :

> *« Aucun engagement de niveau de service ne s'applique par défaut en dehors de ce qui est
> écrit au devis. »*

Le refaire rouvrirait donc une décision prise quatre jours plus tôt. C'est pourquoi la
prochaine action inscrite jusqu'ici — « refaire le document SLA » — était fautive : elle
demandait de reconstruire ce que la refonte contractuelle venait de démonter.

Si un jour Laurent veut tenir des niveaux chiffrés, ce sera un **document neuf, limité à
O4** (abonnement « Pilote IA ») — seule prestation où une disponibilité veut dire quelque
chose — et la section 11 devra le référencer à nouveau. Pas avant, et pas sans ses chiffres.

## Ce qu'il y a à faire dans Paperclip

### 1. `legal/SLA-AInspiration-v1.0-2026-04-04.md`

Ne pas supprimer le fichier : la trace de ce qui a été rédigé en avril, et la raison de son
retrait, valent mieux qu'un fichier effacé. Poser un bandeau en tête, avant toute autre
ligne :

```markdown
> **⚠️ OBSOLÈTE — archivé le 22/09/2026, sans successeur.**
> Ce document décrit l'offre abandonnée le 16/09/2026 (audit IA gratuit, Pack Automatisation
> Express, 99 % de disponibilité, 24 h de délai). Il contredit la grille O1–O5, seule
> stratégie commerciale de référence depuis le 13/09/2026.
> Il n'est plus opposable : la section 11 des CGV d'AInspiration ne le référence plus depuis
> le 18/09/2026 et pose qu'aucun engagement de niveau de service ne s'applique par défaut.
> **Ne pas s'en servir, ne pas le transmettre à un prospect, ne pas le réactiver** sans
> arbitrage écrit de Laurent.
```

Renommer aussi le fichier en `legal/archive/SLA-AInspiration-v1.0-2026-04-04.md` si le dépôt
a un dossier d'archive, ou en créer un. Un document périmé rangé à côté d'un document en
vigueur finit par être envoyé à un client.

### 2. `legal/DPA-AInspiration-v1.0-2026-04-04.md` — à vérifier, pas à archiver

**Celui-là est toujours en vigueur et toujours référencé**, par la section 12 des CGV :
« *Le DPA est disponible sur demande à info@ainspiration.eu.* » Contrairement au SLA, ce
renvoi n'a **pas** été retiré le 18/09.

Il porte sur l'article 28 du RGPD, pas sur l'offre commerciale — l'abandon du Pack Express
ne le périme donc pas *a priori*. Mais personne ne l'a relu depuis avril, et il est promis
par écrit à quiconque le demande. À lire et à signaler s'il mentionne :

- l'audit IA gratuit, le Pack Express ou un prix de l'ancienne grille ;
- un sous-traitant qui n'est plus utilisé, ou l'absence d'un qui l'est aujourd'hui
  (la liste de référence est dans la baseline sécurité : Anthropic, Supabase, Hostinger,
  Clerk, Stripe, OpenRouter, ElevenLabs, Vercel) ;
- des durées de conservation qui ne correspondent plus au flux réel — les formulaires
  alimentent le CRM depuis le 15/09/2026.

**Ne pas le réécrire seul.** C'est un texte contractuel : relever les écarts, les présenter
à Laurent, attendre son accord.

### 3. `CLAUDE.md` de Paperclip — le plus gênant des trois

Il porte encore la grille « validée Comité #2 » : audit IA gratuit 0 €, Pack Express
lancement 1 043 € HTVA contre témoignage, Pack Express standard 1 490 € HTVA, abonnement IA
managé 290 €/mois — et les objectifs Q2 2026 (3 clients, 5 000 € de CA, NPS > 8, 45 audits).

Ces chiffres nourrissent les **dix agents du comité de direction**. Tant qu'ils y sont, les
agents délibèrent et recommandent sur la foi d'une offre abandonnée depuis le 16/09. C'est
une source d'erreur bien plus active qu'un document dormant dans `legal/`.

À remplacer par la grille O1–O5 (HTVA) :

| Réf. | Offre | Prix |
|---|---|---|
| O1 | Diagnostic IA & automatisation, 2 jours | 2 400 € |
| O2 | Atelier IA, demi-journée / journée | 900 € / 1 500 € |
| O3 | Sprint automatisation, 2–3 semaines | 3 500 – 6 000 € |
| O4 | Abonnement « Pilote IA », mensuel | 590 €/mois |
| O5 | Check AI Act, 1 journée | 990 € |

Tarif fondateur de −20 % pour les trois premiers clients, contre témoignage écrit, **jamais
sur O4**. L'entrée gratuite existe toujours mais ce n'est plus un audit : c'est un
rendez-vous de découverte de trente minutes, sans livrable.

⚠️ Ces chiffres sont la stratégie commerciale **interne**. Ils ne doivent apparaître ni dans
une fiche ni dans une capture du front `paperclip-zjyk.srv767464.hstgr.cloud`.

## Ce qui reste à Laurent, hors dépôt

La **page Notion** *SLA — Accord de Niveau de Service v1.0* (avril 2026) porte le même
contenu et ne se touche depuis aucune session Claude Code de ce dépôt. À archiver dans
Notion avec le même bandeau. Tâche déposée dans le CRM sous le `ref`
`handoff:ainspiration:sla-notion`.

## Vérification avant de rendre la main

1. Le fichier SLA porte le bandeau et n'est plus rangé à côté d'un document en vigueur.
2. Le DPA a été **lu** et les écarts éventuels sont écrits noir sur blanc, sans réécriture.
3. Le `CLAUDE.md` de Paperclip ne contient plus aucune occurrence de « Pack Express »,
   « audit IA gratuit », « 1 490 », « 1 043 », « 290 €/mois ». Recherche **insensible à la
   casse** — c'est la casse qui avait fait passer « audit **IA** gratuit » à travers trois
   passes le 18/09.
4. Note de journal et handoff **dans Paperclip**, pas ici.

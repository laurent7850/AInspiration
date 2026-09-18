# Scripts de surveillance du VPS

Copie de référence des scripts qui tournent sur `srv767464.hstgr.cloud`.

**Ils vivent ici parce que la baseline de sécurité l'exige** : un runbook qui
n'existe que sur le serveur disparaît avec lui. Ces fichiers sont une copie, pas
la source — **le VPS fait foi**. Si tu modifies l'un d'eux, déploie-le *et*
reporte-le ici.

## Ce qui tourne où

| Fichier ici | Chemin sur le VPS | Cron |
|---|---|---|
| `vps-watchdog.sh` | `/opt/vps-watchdog.sh` | `*/15 * * * *` |
| `uptime-check.sh` | `/opt/uptime-check.sh` | `*/5 * * * *` |
| `audityo-health-check.sh` | `/root/audityo/health-check.sh` | `*/5 * * * *` |

Sauvegardes des versions antérieures sur le VPS : suffixe `.bak-20260918`.
Crontab d'avant : `/root/crontab.bak-20260918`.

## Le canal d'alerte

Les trois scripts postent sur le même webhook n8n, workflow
**« Distr'Action — Alerte VPS (générique) »** (`cJP1FcQVkUwrBNht`, actif) :

```
POST https://n8n.srv767464.hstgr.cloud/webhook/vps-alert
{ "email": "...", "subject": "...", "body": "...", "source": "...", "log": "..." }
```

**Ne remets jamais `http://localhost:5678`.** n8n ne publie aucun port sur l'hôte :
rien n'écoute sur 5678, et c'est pour ça qu'`uptime-check.sh` n'a envoyé aucune
alerte pendant des mois. L'appel doit sortir par Traefik.

## Trois règles communes, tirées de l'incident des 17-18/09/2026

1. **Silence quand tout va bien**, sauf un signe de vie hebdomadaire le lundi 7h.
   Un moniteur mort en silence reproduit exactement le défaut qu'il doit détecter.
2. **Fenêtre de silence de 6 h par condition**, et un message de retour à la normale.
   Une sonnette qui hurle en boucle est une sonnette qu'on ignore — donc un retour
   au silence par un autre chemin.
3. **On ne jette jamais le résultat d'un envoi d'alerte.** Pas de `2>/dev/null`,
   pas de `> /dev/null`. Si la sonnette ne sonne pas, ça doit se voir dans le journal.

Et pour les reprises automatiques : **jamais indéfiniment.** Trois tentatives, puis
on arrête et on demande un humain. Une reprise qui ne converge pas aggrave la panne
au lieu de la réparer — c'est littéralement ce qui a bridé le VPS.

Récit complet : [`../../journal/2026-09-18-vps-bride-par-hostinger.md`](../../journal/2026-09-18-vps-bride-par-hostinger.md)

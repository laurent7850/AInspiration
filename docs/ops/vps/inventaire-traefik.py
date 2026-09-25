# -*- coding: utf-8 -*-
# C39 — inventaire avant de poser exposedByDefault=false sur Traefik.
#
# La question a trancher est simple : quels conteneurs seraient DEBRANCHES par
# la bascule ? Ce sont ceux qui declarent un routeur sans declarer
# traefik.enable=true — aujourd'hui ils passent grace au defaut permissif.
#
# Lecture seule. N'affiche aucune valeur d'environnement.
import json, subprocess

def sh(*a):
    return subprocess.run(a, capture_output=True, text=True).stdout

noms = [n for n in sh('docker', 'ps', '--format', '{{.Names}}').split('\n') if n.strip()]

sur, casse, ramasse, explicite = [], [], [], []

for n in noms:
    brut = sh('docker', 'inspect', n, '--format', '{{json .Config.Labels}}').strip()
    try:
        lab = json.loads(brut) or {}
    except Exception:
        lab = {}
    tf = {k: v for k, v in lab.items() if k.startswith('traefik')}
    enable = tf.get('traefik.enable', '').lower()
    routeur = any('.routers.' in k for k in tf)
    service = any('.services.' in k for k in tf)
    projet = lab.get('com.docker.compose.project', '—')

    if enable == 'false':
        explicite.append((n, projet))
    elif routeur and enable == 'true':
        sur.append((n, projet, service))
    elif routeur and enable != 'true':
        casse.append((n, projet, sorted(k for k in tf if '.routers.' in k)[:2]))
    elif not tf:
        ramasse.append((n, projet))
    else:
        casse.append((n, projet, sorted(tf)[:2]))

print('=' * 74)
print('A. DECLARES ET SURS — traefik.enable=true + routeur : la bascule ne les touche pas')
print('=' * 74)
for n, p, s in sorted(sur):
    print('  %-30s projet=%-16s service declare=%s' % (n, p, 'oui' if s else 'non (port deduit)'))
print('   total : %d' % len(sur))

print()
print('=' * 74)
print('B. A CORRIGER AVANT LA BASCULE — routeur declare SANS traefik.enable=true')
print('=' * 74)
if not casse:
    print('  aucun — la bascule est sans risque')
for n, p, k in sorted(casse):
    print('  %-30s projet=%-16s %s' % (n, p, k))
print('   total : %d' % len(casse))

print()
print('=' * 74)
print('C. RAMASSES PAR DEFAUT — aucun label traefik ; la bascule les sortira du champ')
print('=' * 74)
for n, p in sorted(ramasse):
    print('  %-30s projet=%s' % (n, p))
print('   total : %d' % len(ramasse))

print()
print('D. DEJA EXPLICITEMENT HORS CHAMP (traefik.enable=false) : %d' % len(explicite))
for n, p in sorted(explicite):
    print('  %-30s projet=%s' % (n, p))

print()
print('TOTAL conteneurs actifs : %d' % len(noms))

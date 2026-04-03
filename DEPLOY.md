# Déploiement CRM Négociateur - Guide Pas-à-Pas

## Ce qui est déjà fait

- Tables PostgreSQL créées dans Supabase (projet: lesite-io-backoffice)
- Compte admin créé : contact@ibsformation.com / Admin2026!
- Schema Prisma migré vers PostgreSQL
- Config Vercel prête (vercel.json)

## Étape 1 : Récupérer le mot de passe Supabase

1. Va sur https://supabase.com/dashboard/project/cbfypewsudbcuslhpkzx/settings/database
2. Section "Connection string" → copie le **mot de passe** de ta base

## Étape 2 : Pousser sur GitHub

Depuis le dossier `crm-negociateur` dans ton terminal :

```bash
cd crm-negociateur
git init
git add -A
git commit -m "CRM Négociateur v1 - prêt pour production"
git branch -M main
git remote add origin https://github.com/danielnadjar/crm-negociateur.git
git push -u origin main
```

(Crée d'abord le repo sur GitHub : https://github.com/new → nom: `crm-negociateur`, privé)

## Étape 3 : Déployer sur Vercel

1. Va sur https://vercel.com/new
2. Connecte ton compte GitHub
3. Importe le repo `crm-negociateur`
4. **Framework preset** : Next.js (détecté automatiquement)
5. **Root Directory** : laisser vide (le projet est à la racine)

### Variables d'environnement à ajouter dans Vercel :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `postgresql://postgres.cbfypewsudbcuslhpkzx:[MOT-DE-PASSE]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.cbfypewsudbcuslhpkzx:[MOT-DE-PASSE]@aws-0-eu-west-3.pooler.supabase.com:5432/postgres` |
| `NEXTAUTH_SECRET` | `b106f7fc5e78ddc6a11b3f0c5aa807d06d1cf3a55e2e1e70d7ec2ed091647bcc` |
| `NEXTAUTH_URL` | `https://ton-projet.vercel.app` (à mettre à jour après le 1er déploiement) |
| `WEBHOOK_TOKEN` | `crm-nego-webhook-2026` |

Remplace `[MOT-DE-PASSE]` par le mot de passe copié à l'étape 1.

6. Clique **Deploy**

## Étape 4 : Mettre à jour NEXTAUTH_URL

Après le déploiement, Vercel te donne une URL (ex: `crm-negociateur.vercel.app`).
1. Va dans Settings → Environment Variables
2. Mets à jour `NEXTAUTH_URL` avec cette URL
3. Redéploie (Deployments → ... → Redeploy)

## Étape 5 : Connexion

1. Va sur `https://ton-url.vercel.app/login`
2. Email : `contact@ibsformation.com`
3. Mot de passe : `Admin2026!`
4. **CHANGE TON MOT DE PASSE après la première connexion !**

## Domaine personnalisé (optionnel)

Tu peux ajouter un sous-domaine comme `crm.lesite.online` :
1. Vercel → Settings → Domains
2. Ajoute `crm.lesite.online`
3. Ajoute le CNAME dans tes DNS : `crm` → `cname.vercel-dns.com`
4. Mets à jour `NEXTAUTH_URL` avec `https://crm.lesite.online`

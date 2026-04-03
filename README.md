# CRM Négociateur - L'Agence en Ligne

CRM métier spécialisé dans la négociation immobilière pour acquéreurs.

## Stack technique

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma** (ORM)
- **SQLite** (dev) / **PostgreSQL** (prod)
- **NextAuth.js** (authentification)
- **Tailwind CSS** (design)

## Installation rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Générer le client Prisma
npx prisma generate

# 3. Créer la base de données
npx prisma db push

# 4. Injecter les données de test (admin + client test)
npx prisma db seed

# 5. Lancer le serveur
npm run dev
```

Le CRM sera accessible sur **http://localhost:3000**

## Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@lagenceenligne.fr | admin123 |
| Client test | jean.dupont@test.fr | client123 |

**IMPORTANT** : Changer les mots de passe en production.

## Structure du projet

```
src/
├── app/
│   ├── (auth)/login/          → Page de connexion
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── dashboard/     → Tableau de bord admin
│   │   │   └── clients/       → Liste et fiches clients
│   │   │       └── [id]/
│   │   │           └── biens/[bienId]/ → Négociation ping-pong
│   │   └── client/            → Espace client acquéreur
│   │       └── biens/[bienId]/ → Vue simplifiée négociation
│   └── api/
│       ├── auth/              → NextAuth
│       ├── clients/           → CRUD clients
│       ├── biens/[id]/        → Biens, vendeurs, négociation
│       └── webhook/           → Réception leads (Make/Lovable/QCM)
├── components/                → Composants UI
├── lib/                       → Utilitaires, types, auth, Prisma
└── prisma/
    ├── schema.prisma          → Schéma BDD
    └── seed.ts                → Données initiales
```

## Rôles utilisateurs

- **ADMIN** : accès complet, gestion des clients/biens/négociations
- **SOUS_ADMIN** : accès CRM, pas de config système
- **CLIENT** : espace personnel simplifié, vue de ses négociations

## Modèle économique intégré

- **Forfait fixe** : 500€ payable à l'achat
- **Commission** : 10% des économies par tranches de 5 000€
- Les calculs sont automatiques dans le CRM

## API Webhook (pour Make / Lovable / QCM)

```
POST /api/webhook
Header: x-webhook-token: <votre-token>
Body JSON:
{
  "email": "prospect@email.fr",
  "prenom": "Jean",
  "nom": "Dupont",
  "telephone": "06...",
  "lienAnnonce": "https://...",
  "message": "Je veux acheter...",
  "source": "LOVABLE"  // ou "QCM", "AUTRE"
}
```

## Configurer pour la production

1. Changer `DATABASE_URL` vers PostgreSQL
2. Changer `NEXTAUTH_SECRET` par une vraie clé
3. Configurer `WEBHOOK_SECRET`
4. Ajouter `SENDGRID_API_KEY` quand prêt
5. Déployer sur Vercel, Railway, VPS, etc.

## Prochaines étapes (Phase 2+)

- Upload de photos
- Emails automatiques via SendGrid
- Intégration Make complète
- Extraction IA depuis annonces (Claude)
- Amélioration UX

# shopping-list

App Next.js privée pour afficher les produits déjà en base, sélectionner ceux qui t'intéressent et enregistrer une liste de course exploitable plus tard par un agent de remplissage de panier.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase côté serveur

## Variables d'environnement

Copie `.env.example` vers `.env.local` puis renseigne :

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ACCESS_PASSWORD`
- `APP_ACCESS_TOKEN`

## Développement

```bash
npm install
npm run dev
```

## Schéma Supabase

Ce repo contient une migration SQL pour :

- `course.shopping_lists`
- `course.shopping_list_items`
- la fonction `course.save_shopping_list(...)`

## Déploiement Vercel

Le projet est pensé pour être déployé tel quel sur Vercel avec les variables d'environnement ci-dessus.


---
trigger: always_on
description: Règles UI/UX, charte graphique et conventions e-commerce de la boutique Shopify Hydrogen Squishies.
---

# Règles Design & UX — Boutique Squishies

Avant toute création ou modification d'interface dans `app/`, suis strictement [DESIGN.md](../../DESIGN.md) :

1. **Identité & Palette :**
   - Univers **kawaii pastel & pop-gourmand** : fond crème `#FFFDF9`, texte prune `#23192D`, CTA primaire framboise `#E84A7F`, accent Noël vert sapin `#1F5E43`.
   - Ne jamais remplacer le fond par du noir/gris froid ou remettre l'ancien bordeaux `#5d0707` du template par défaut.
   - Laisser respirer les 9 photos studio pastel carrées (`aspect-square`, `rounded-3xl`, pas de crop agressif qui coupe les boîtes).

2. **Typographie :**
   - Titres (`H1`, `H2`, `H3`, wordmark) en **Fredoka** (`--font-heading`).
   - Corps, navigation, boutons et prix en **Plus Jakarta Sans** (`--font-body`), avec `tabular-nums` sur tous les prix et compteurs.

3. **Langue, Devise & Vérité Produit :**
   - Toute l'interface visible (`html lang="fr"`, boutons, aria-labels, métadonnées SEO, filtres, panier, recherche, erreurs) doit être en **français naturel (`fr-FR`)**.
   - Formater tous les prix en `fr-FR` (`€ EUR`) sans jamais modifier ni arrondir les prix retournés par Shopify.
   - **Ne jamais afficher de seuil de livraison offerte fictif** dans le bandeau d'annonce ou le panier tant que l'utilisateur ne l'a pas demandé.
   - Ne jamais décrire les squishies comme des bonbons comestibles : ce sont des **jouets sensoriels / anti-stress non comestibles**.

4. **Mobile-First (90 % du trafic client) :**
   - Concevoir chaque écran en priorité pour `375px–430px` (utilisation à une main, zéro scroll horizontal `overflow-x-clip`, `100dvh` + `safe-area-inset-bottom`).
   - Utiliser des grilles **2 colonnes dès mobile** (`grid-cols-2 gap-3`) pour les produits et collections, et un **sticky Add-to-Cart mobile** en bas de la fiche produit.
   - Toujours garder `font-size >= 16px` sur les `<input>`/`<select>` mobiles (anti-zoom iOS Safari) et des cibles tactiles ≥ 44×44 px.

5. **Hydrogen `2026-10` & Oxygen :**
   - Utiliser exclusivement les APIs Hydrogen `2026-10` (`@shopify/hydrogen`, `@shopify/hydrogen/react`, `gql()`, `formatMoney`).
   - Conserver les cibles tactiles ≥ 44×44 px, les états focus accessibles et le support `prefers-reduced-motion`.
   - Toujours vérifier `npm run typecheck` et `npm run build` après modification du storefront.

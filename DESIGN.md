# DESIGN.md — Squishies Design System & UI/UX Blueprint

Direction artistique et système de design officiel de la boutique e-commerce **Squishies** (Shopify Hydrogen `2026-10` · React Router 7 · Tailwind CSS v4 · Oxygen).

---

## 1. Identité de marque & positionnement

- **Marque :** `Squishies`
- **Catégorie :** Jouets squishies sensoriels, craquants (*crispy / crackle*) et anti-stress kawaii inspirés de la gourmandise et des fruits.
- **Ambiance visuelle :** **Kawaii pastel & pop-gourmand** — chaleureux, joyeux, tactile et soigné (jamais criard, jamais « discount »).
- **Règle d'or visuelle :** Les **9 photos studio carrées (`1254 × 1254`)** ont chacune un fond pastel saturé (vert sapin, rose bonbon, bleu glacé, menthe, lilas, jaune beurre, rouge brique, rose vif, pêche). L'interface doit servir d'**écrin crème doux et aéré** pour laisser respirer et briller ces visuels sans compétition chromatique.
- **Langue & devise :** 100 % **Français (`fr-FR`)**, devise **EUR (€)**, prix exacts du catalogue Shopify (`30,07 €`, `9,45 €`, etc.).
- **Mention sécurité obligatoire :** Jouets sensoriels non comestibles (*Ne pas ingérer · Âge recommandé 3+ ou 6+*). Ne jamais présenter les produits comme des bonbons alimentaires.
- **Message commercial :** Bandeau d'annonce orienté **Nouveautés & Édition Noël** (*Calendrier de l'Avent Mystery Dumpling*). **Aucun seuil de livraison offerte fictif** n'est affiché tant que le client n'a pas fixé sa politique de livraison.

---

## 2. Palette de couleurs (Tokens Tailwind v4 / CSS)

| Rôle | Token | Valeur HEX | Usage |
| :--- | :--- | :--- | :--- |
| **Fond principal** | `--color-surface` | `#FFFDF9` | Fond de page crème vanille très doux (plus chaleureux que `#FFFFFF`) |
| **Surface carte / panneau** | `--color-surface-elevated` | `#FFFFFF` | Cartes blanches, tiroirs, champs de saisie, modals |
| **Surface secondaire** | `--color-surface-secondary` | `#F7EFE7` | Fonds de sections alternées, chips, états neutres |
| **Texte principal** | `--color-on-surface` | `#23192D` | Prune/encre profonde (contraste AAA > 13:1 sur crème, plus doux que `#000`) |
| **Texte secondaire** | `--color-on-surface-secondary` | `#665874` | Sous-titres, métadonnées, fil d'Ariane (contraste AA > 5.5:1) |
| **Bordure douce** | `--color-border` | `#EADFD7` | Séparateurs, contours de cartes et inputs |
| **Couleur primaire (CTA)** | `--color-primary` | `#E84A7F` | Framboise gourmand — boutons principaux, badge panier, focus actif |
| **Hover primaire** | `--color-interactive-hover` | `#D4386D` | Survol des boutons principaux |
| **Active primaire** | `--color-interactive-active` | `#BA2A5C` | Pression tactile des boutons principaux |
| **Accent Noël / Édition** | `--color-festive` | `#1F5E43` | Vert sapin assorti au Calendrier de l'Avent (badge Noël / mise en avant) |
| **Pastels d'accent** | `--pastel-rose` / `--pastel-mint` / `--pastel-sky` / `--pastel-lilac` / `--pastel-peach` | `#FFE4EE` / `#DDF5E8` / `#DFF0FF` / `#EFE4FF` / `#FFE8D9` | Badges sensoriels (*Pailleté*, *Craquant*, *Gourmandise*, *Noël*), fonds de pills, illustrations |
| **Succès / Stock** | `--color-success` | `#0F7A53` | Indicateur « En stock » |
| **Alerte / Stock bas** | `--color-warning` | `#B45309` | Indicateur « Plus que X en stock » |
| **Erreur / Promo** | `--color-critical` / `--color-sale` | `#DC2626` | Erreurs formulaires, prix barrés promo |

---

## 3. Typographie

Chargée proprement via Google Fonts dans `app/root.tsx` (`preconnect` + `display=swap`) avec fallbacks système arrondis :

- **Titres & Branding (`--font-heading`) :** **`Fredoka`** (`500`, `600`, `700`)
  - Ronds, joyeux, évocateurs de la texture douce d'un squishy, tout en restant lisibles.
  - Utilisée pour le wordmark `Squishies`, les `H1` / `H2` / `H3` de sections et les gros chiffres clés.
- **Corps, UI & Prix (`--font-body`) :** **`Plus Jakarta Sans`** (`400`, `500`, `600`, `700`)
  - Ultra-lisible, géométrique et chaleureuse pour les descriptions, boutons, navigation, filtres et prix (`tabular-nums` sur tous les prix et quantités).

### Échelle typographique
- **Display Hero (`H1`) :** `clamp(2.25rem, 4.5vw, 3.75rem)` · `font-weight: 600` · `line-height: 1.08` · `letter-spacing: -0.02em`
- **Section Heading (`H2`) :** `clamp(1.625rem, 2.5vw, 2.25rem)` · `font-weight: 600` · `line-height: 1.15`
- **Card Title (`H3`) :** `1rem` (`16px`) · `font-weight: 600` · `line-height: 1.35`
- **Body :** `1rem` (`16px`) · `line-height: 1.65`
- **Overline / Pill :** `0.75rem` (`12px`) · `font-weight: 600` · `letter-spacing: 0.06em` · `uppercase`

---

## 4. Formes, Rayons, Ombres & Micro-interactions (« Squishy Feel »)

- **Rayons généreux & cohérents :**
  - Boutons & badges : `9999px` (`rounded-full` — forme pilule tactile)
  - Cartes produits & collections : `1.5rem` (`24px`, `--radius-card`)
  - Panneaux / encarts / hero : `2rem` (`32px`)
  - Inputs & sélecteurs quantité : `1rem` (`16px`)
- **Ombres douces teintées (jamais de gris sale) :**
  - `--shadow-soft`: `0 8px 24px -8px rgb(35 25 45 / 0.08), 0 2px 6px -2px rgb(35 25 45 / 0.04)`
  - `--shadow-card-hover`: `0 18px 36px -12px rgb(232 74 127 / 0.16), 0 4px 12px -4px rgb(35 25 45 / 0.06)`
- **Physique « Squishy » (respectant `prefers-reduced-motion`) :**
  - Hover carte : légère élévation (`-translate-y-1`) + zoom photo doux (`scale-[1.04]`, `duration-300`).
  - Clic bouton CTA : compression élastique (`active:scale-[0.95]`) avec courbe rebondissante `cubic-bezier(0.34, 1.56, 0.64, 1)`.
  - Badges sensoriels sur les cartes dérivés des tags Shopify (`Noël` → vert sapin, `Crispy` → menthe, `Mystery Dumpling` → lilas/bleu, `Gourmandise` → rose/pêche).

---

## 5. Architecture UX par écran (Mobile-First — 90 % du trafic)

> **Priorité absolue Mobile (`375px – 430px`) :** 90 % des clients naviguent sur smartphone. Chaque écran est conçu d'abord pour une utilisation à une main (*thumb zone*), sans aucun débordement horizontal (`overflow-x-clip`), avec des champs `font-size >= 16px` (zéro zoom intempestif sur iOS Safari) et `100dvh` + `env(safe-area-inset-bottom)` sur les tiroirs et barres fixes.

### Règles Mobile-First obligatoires
- **Grille produits 2 colonnes dès mobile** (`grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6`) pour voir 4 squishies sans scroller excessivement tout en gardant des photos carrées nettes.
- **Barre de raccourcis Collections en pilules scrollables horizontalement** sur mobile (`snap-x scrollbar-none`) juste sous le Hero.
- **Sticky Add-to-Cart en bas d'écran sur mobile** sur la fiche produit (`/products/:handle`) : affiche le prix + CTA primaire framboise pleine largeur dans la zone du pouce, avec `env(safe-area-inset-bottom)`.
- **Header mobile compact (`h-14`)** + bandeau d'annonce 1 ligne lisible + tiroirs (`CartDrawer`, `SearchDrawer`, `MobileNav`) plein écran fluide (`w-full sm:w-[440px] h-[100dvh]`).
- **Inputs ≥ 16px (`text-base`) sur mobile** pour empêcher le zoom automatique Safari iOS, et cibles tactiles ≥ `44×44 px` partout.

### A. Chrome global (Announcement Bar · Header · Footer)
1. **Barre d'annonce** : fond prune `#23192D` ou framboise doux, message court cliquable :
   *« Édition Noël disponible · Découvrez le Calendrier de l'Avent Mystery Dumpling 24 surprises → »* (lien vers `/products/calendrier-avent-mystery-dumpling`).
2. **Header sticky translucide** (`bg-surface/90 backdrop-blur-md`) :
   - Gauche : logo typographique **`Squishies`** (Fredoka Bold avec petit accent pastel).
   - Centre (desktop) : liens directs vers les 4 collections réelles (**Mystery Dumplings**, **Crispy & Craquants**, **Gourmandises & Fruits**, **Noël & Cadeaux**) + **Tout voir** (`/collections`).
   - Droite : Recherche (ouvre `SearchDrawer`), Compte (`/account`), Panier avec compteur framboise (ouvre `CartDrawer`).
   - Mobile : bouton menu hamburger ouvrant `MobileNav` avec les mêmes 4 collections.
3. **Footer chaleureux** :
   - Présentation courte de **Squishies** + rappel sécurité jouet (*Jouets sensoriels non comestibles*).
   - Colonne **Collections** (4 liens directs).
   - Colonne **Boutique** (Rechercher, Mon compte, Panier).
   - Moyens de paiement Shopify dynamiques (`PaymentMethodIcon`).

### B. Page d'accueil (`app/routes/home.tsx`)
Conçue pour convertir dès le premier écran avec **9 produits** mis en valeur :
1. **Hero Split Éditorial (au-dessus de la ligne de flottaison)** :
   - Fond crème rosé très léger encadré (`rounded-[2rem]`) avec formes pastel subtiles en arrière-plan.
   - **Gauche :** Pill `Édition Noël · Nouveautés`, titre impactant en Fredoka (*« Des squishies trop mignons à presser sans modération »*), sous-titre clair sur les textures craquantes & pailletées, 2 CTA : bouton primaire **« Découvrir les squishies »** (`#catalogue`) + bouton secondaire **« Calendrier de l'Avent »** (`/products/calendrier-avent-mystery-dumpling`).
   - **Droite :** Composition visuelle dynamique tirée des vraies photos produits Shopify (grande carte du *Calendrier de l'Avent Mystery Dumpling* ou produit vedette + 2 cartes satellites flottantes comme le *Donut à vermicelles* et le *Mystery Dumpling bleu pailleté* avec leurs vrais prix en badge!).
2. **Bandeau de promesses sensorielles (4 piliers)** :
   - *Textures variées* (moelleux, pailletés, craquants crispy)
   - *Prêts à offrir* (livrés dans leurs boîtes & paniers vapeur)
   - *Paiement 100 % sécurisé* (Checkout officiel Shopify)
   - *Jouets certifiés CE* (non comestibles, dès 3+ / 6+ ans)
3. **Catalogue complet — « Tous nos Squishies » (les 9 produits)** :
   - Comme le catalogue compte 9 références, la requête charge **`products(first: 12)`** (pas 8 !) afin que **les 9 squishies soient tous visibles dès la page d'accueil** en grille équilibrée `grid-cols-2 lg:grid-cols-3` (3×3 parfait sur desktop !).
   - Chaque `ProductCard` affiche : photo carrée `aspect-square` aux coins arrondis (`rounded-3xl`), badge sensoriel discret en haut à gauche (dérivé des tags Shopify : *Édition Noël*, *Craquant*, *Pailleté*, *Kawaii*), titre en 2 lignes max, prix formaté `fr-FR` (`tabular-nums`), et flèche/indicateur discret.
4. **Vitrine des 4 Collections — « Explorer par univers »** :
   - Charge les **4 collections** (`collections(first: 4)`) en grille `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` avec photo de couverture, dégradé lisible en bas, titre Fredoka et compteur de produits en français (`3 produits`, `6 produits`…).
5. **Bloc Mise en avant « Édition Noël — Calendrier de l'Avent Mystery Dumpling »** :
   - Section dédiée sur fond vert sapin profond `#1F5E43` avec texte crème et CTA framboise, mettant en lumière le produit phare à `30,07 €` (24 cases numérotées, 24 figurines surprises).

### C. Pages Collections, Fiche Produit, Panier & Recherche
- **Collections (`/collections`, `/collections/:handle`)** : fil d'Ariane en français, filtres & tri en français (*En vedette*, *Meilleures ventes*, *Prix croissant*, *Prix décroissant*…), puces de filtres actifs en pilules arrondies.
- **Fiche Produit (`/products/:handle`)** :
  - Galerie carrée aux coins arrondis (`rounded-3xl`), prix mis en valeur en grand (`tabular-nums`), badge stock vert (*En stock — prêt à expédier*), sélecteur quantité tactile, bouton primaire **« Ajouter au panier »** + **Shop Pay**, encart discret **Sécurité & âge recommandé** (*Jouet sensoriel non comestible — ne pas ingérer*), accordéon description enrichie, et grille *« Vous aimerez aussi »*.
- **Tiroir Panier (`CartDrawer`) & Page `/cart`** :
  - 100 % français (*Votre panier*, *Total estimé*, *Taxes et livraison calculées au passage en caisse*, *Passer commande*), sans faux seuil de livraison offerte, contrôles quantité `44×44px` minimum (accessibilité AA).
- **Tiroir Recherche (`SearchDrawer`) & Page `/search`** :
  - Recherche prédictive en français (*Rechercher un squishy, donut, dumpling…*).

---

## 6. Règles techniques & qualité non négociables

- **Hydrogen `2026-10` strict :** uniquement les exports `@shopify/hydrogen` / `@shopify/hydrogen/react` `2026.10.x` (jamais d'imports legacy `CartForm`, `Image`, `Money` de `2026-04`).
- **Storefront API & prix :** formater tous les montants via `formatPrice(money)` avec locale **`fr-FR`**.
- **Accessibilité (WCAG AA) :** contrastes ≥ 4.5:1, cibles tactiles ≥ 44×44 px, focus visibles `outline-2`, attributs `aria-*` en français, `prefers-reduced-motion` respecté.
- **Performance & Oxygen :** zéro dépendance Node.js dans le runtime Worker, images Shopify CDN propres, `npm run typecheck` et `npm run build` doivent passer à 0 erreur avant tout push sur `main`.

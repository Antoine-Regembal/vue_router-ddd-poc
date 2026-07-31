# poc-vuerouter-hexagonal

POC standalone pour explorer une architecture frontend Vue 3 alternative, et répondre à plusieurs questions concrètes :

1. une structuration du front par **modules métier** (hexagonal / package-by-feature), isolés les uns des autres ;
2. si **vue-router peut générer le routing automatiquement depuis le filesystem**, y compris quand les pages sont réparties dans plusieurs dossiers de modules ;
3. s'il existe un **outil pour faire respecter l'isolation des modules** (empêcher un import qui contourne l'API publique d'un module) ;
4. si **Pinia Colada et le `defineColadaLoader` natif de vue-router** (data loading piloté par la navigation, avec cache) fonctionnent avec cette stack ;
5. comment agencer un **module métier sans page propre** (`consultations`, consommé uniquement depuis les pages d'un autre module) et les **nested routes** de vue-router pour ce cas (`beneficiary/:id/consultations/...`).

Il n'y a **aucun vrai backend** ici : `devices` et `consultations` font un `fetch` réel, intercepté par [MSW](https://mswjs.io/) qui renvoie de la fake data générée avec [`@faker-js/faker`](https://fakerjs.dev/).

## Lancer le projet

```bash
pnpm install
pnpm dev              # http://localhost:5173 — le worker MSW s'active automatiquement en dev
pnpm run typecheck    # vue-tsc -b
pnpm run check:boundaries  # dependency-cruiser — isolation des modules
pnpm run build
```

Routes disponibles : `/dashboard`, `/devices`, `/devices/:id`, `/devices/settings`, `/beneficiary`, `/beneficiary/:id`, `/beneficiary/:id/consultations`, `/beneficiary/:id/consultations/new`, `/beneficiary/:id/consultations/:consultationId`.

## Réponse 1 — modules métier isolés (hexagonal)

Trois modules sous `src/modules/`, avec des niveaux de complétude et des rôles volontairement différents :

- **`devices`** : module complet, avec pages — `domain/` (entité `Device`, port `DeviceRepository`), `application/` (`ListDevices`, `GetDeviceDetail` use-cases), `infrastructure/` (`HttpDeviceRepository` qui fait un vrai `fetch`, + les mocks MSW/faker), `ui/` (composables, composant, pages). N'expose que `Device`, `useDevice`, `useDeviceList` via son `index.ts`.
- **`beneficiary`** : module volontairement léger et **imaginaire** — 3 bénéficiaires fixes en mémoire (pas de réseau), mais avec de vraies pages liste/détail et des nested routes (cf. Réponse 5).
- **`consultations`** : module complet **sans aucune page** — mêmes couches que `devices` (domain/application/infrastructure avec `fetch` + MSW), mais aucun `ui/pages/`. Consommé exclusivement depuis les pages de `beneficiary` (cf. Réponse 5). Détail sur son API publique dans cette même réponse.

`src/pages/dashboard.vue` (page composite, hors de tout module) consomme `devices` et `beneficiary` **uniquement via leur `index.ts`** — jamais un `domain/`, `application/`, `infrastructure/` ou `ui/` interne d'un autre module.

## Réponse 2 — routing filesystem natif (vue-router v5)

**`unplugin-vue-router` a été archivé par son mainteneur le 24/02/2026** ("read-only") : sa fonctionnalité de file-based routing a été **absorbée nativement dans vue-router v5** (dernière version stable : `5.2.0`). **Ne plus l'installer** — cette dépendance est deprecated.

Configuration native, dans `vite.config.ts` :

```ts
import VueRouter from 'vue-router/vite'; // plugin natif, plus besoin d'unplugin-vue-router

VueRouter({
  routesFolder: [
    { src: 'src/pages' },
    { src: 'src/modules/devices/ui/pages', path: 'devices/' },
    { src: 'src/modules/beneficiary/ui/pages', path: 'beneficiary/' },
  ],
});
```

Vérifié en conditions réelles (navigation dans un vrai navigateur, pas seulement lu dans la doc) :

- plusieurs dossiers de pages, répartis dans des modules distincts, sont fusionnés en un seul routing — `src/modules/devices/ui/pages/index.vue` → `/devices`, `src/modules/beneficiary/ui/pages/index.vue` → `/beneficiary` ;
- les routes dynamiques fonctionnent : `[id].vue` → `/devices/:id` ;
- les **route groups** fonctionnent : `src/modules/devices/ui/pages/(admin)/settings.vue` résout bien en `/devices/settings`, pas `/devices/admin/settings` — le nom entre parenthèses est ignoré pour le matching d'URL mais reste dans le nom de route généré (`/devices/(admin)/settings`) ;
- les routes sont typées (`typed-router.d.ts`, généré au premier `pnpm dev`, gitignored) — utiliser `useRoute<'/devices/[id]'>()` pour que `route.params.id` soit correctement typé (sans le générique, `route.params` reste une union peu utile).

## Réponse 3 — isolation des modules avec `dependency-cruiser`

[`dependency-cruiser`](https://github.com/sverweij/dependency-cruiser) permet d'exprimer exactement "un module ne se consomme que via son API publique" grâce au *group matching* dans ses règles `forbidden` (capturer le nom du module dans `from.path`, le réutiliser dans `to.path`/`to.pathNot` via `$1`). Config : [`.dependency-cruiser.cjs`](./.dependency-cruiser.cjs), deux règles :

- `no-deep-cross-module-imports` : un fichier d'un module ne peut pas importer les internals d'un **autre** module (seuls `index.ts` et `mocks.ts` sont autorisés — cf. la section Mocking pour `mocks.ts`).
- `no-deep-external-module-imports` : un fichier **hors** de `src/modules/` (page composite, router, `main.ts`…) ne peut pas non plus importer les internals d'un module.

Vérifié : `pnpm run check:boundaries` passe à 0 violation sur le code du POC (55 modules, 89 dépendances analysées, `.vue` compris — dependency-cruiser sait parser les SFC nativement — et l'alias `@modules` de `vite.config.ts`/`tsconfig.app.json` est bien résolu vers les vrais chemins `src/modules/...` pour le matching des règles). Testé aussi qu'un import fautif est bien détecté (via l'alias comme en relatif) : ajouter temporairement `import type { Consultation } from '@modules/consultations/domain/entities/Consultation'` dans `dashboard.vue` fait échouer la commande avec `error no-deep-external-module-imports: src/pages/dashboard.vue → src/modules/consultations/domain/entities/Consultation.ts`.

Bonus : `pnpm run graph:modules` (nécessite Graphviz en local) génère un graphe visuel des dépendances entre modules — utile pour présenter le résultat à une équipe.

Alternative notée pour comparaison : `eslint-plugin-boundaries`, pour rester dans l'écosystème ESLint plutôt qu'un outil séparé.

## Réponse 4 — Pinia Colada + `defineColadaLoader` natif

Oui, ça fonctionne, **mais avec un piège de versions bien réel** à connaître.

### Setup

Le mécanisme de data loaders d'`unplugin-vue-router` a lui aussi été absorbé nativement dans vue-router v5, sous `vue-router/experimental`. L'intégration Pinia Colada spécifique est en plus : `vue-router/experimental/pinia-colada`.

`src/main.ts` :

```ts
import { createPinia } from 'pinia';
import { PiniaColada } from '@pinia/colada';
import { DataLoaderPlugin } from 'vue-router/experimental';

app.use(createPinia());
app.use(PiniaColada);
app.use(DataLoaderPlugin, { router }); // doit être enregistré avant app.use(router)
app.use(router);
```

Le loader est un **export nommé de la page elle-même** (convention scannée automatiquement par le routing filesystem) — d'où le `<script>` non-`setup` séparé dans `ui/pages/index.vue` et `ui/pages/[id].vue` :

```ts
// src/modules/devices/ui/pages/index.vue — <script> (pas <script setup>)
import { defineColadaLoader } from 'vue-router/experimental/pinia-colada';
import { listDevices } from '../composables/useDevice'; // réutilise le use-case existant

export const useDevicesLoader = defineColadaLoader('/devices/', {
  key: () => ['devices'],
  query: () => listDevices.execute(),
});
```

```ts
// <script setup> de la même page
const { data: devices, isLoading, error } = useDevicesLoader();
```

Le `query()` appelle le **même use-case `application/`** que la version composable classique (`useDeviceList`/`useDevice`, toujours utilisée par `pages/dashboard.vue`) — le loader est juste un adaptateur de plus vers le même domaine, pas une nouvelle logique métier.

### Le piège : `pinia@4.x` casse l'intégration

Avec les toutes dernières versions (`pinia@4.0.2` + `@pinia/colada@1.4.2`, celles que `pnpm add` installe par défaut), le premier chargement d'une page avec un loader Colada **plante systématiquement** à froid (arrivée directe sur `/devices`, pas en navigation SPA depuis une autre page déjà montée) :

```
[Vue warn]: injection "Symbol(router)" not found.
Uncaught TypeError: Cannot read properties of undefined (reading 'Symbol(loaderEntries)')
```

Root cause : `defineColadaLoader` appelle en interne `useRouter()` au moment où Pinia Colada crée sa query pour la première fois. Sur ce tout premier appel (déclenché depuis un navigation guard, pas depuis un `setup()` de composant), le contexte d'injection Vue est perdu — un problème classique quand un store Pinia est instancié hors du cycle de vie normal d'un composant.

`vue-router@5.2.0` déclare dans son propre `package.json` un `peerDependencies` large (`pinia: "^3.0.4 || ^4.0.2"`, `@pinia/colada: ">=0.21.2"`) mais ses propres `devDependencies` — ce qu'il teste réellement — pointent vers `pinia@^3.0.4` et `@pinia/colada@^1.3.1`. Testé en A/B (mêmes fichiers, seule la version des deps change, cache Vite reconstruit à chaque fois) :

| Versions | Cold-start sur `/devices` ou `/devices/:id` |
|---|---|
| `pinia@4.0.2` + `@pinia/colada@1.4.2` (dernières) | ❌ plante systématiquement |
| `pinia@3.0.4` + `@pinia/colada@1.3.1` (celles testées par vue-router) | ✅ fonctionne, y compris en rechargement direct sur une route paramétrée |

**Ce POC est donc pinné sur `pinia@3.0.4` + `@pinia/colada@1.3.1`**, volontairement en retrait par rapport au "latest" — l'exception à la règle habituelle "toujours vérifier/prendre la version la plus récente", précisément parce qu'elle a été vérifiée et que la plus récente est cassée pour cet usage précis. Vérifié après coup : `pinia@4.x` réintroduit le crash de façon reproductible, `pinia@3.0.4` le corrige de façon tout aussi reproductible (plusieurs cold-starts de suite, liste et détail).

**À refaire avant d'envisager ce pattern ailleurs** : réessayer avec une version de `pinia@4.x` plus récente que `4.0.2` / de `@pinia/colada` plus récente que `1.4.2` — c'est une intégration marquée **expérimentale** (`[VUE_ROUTER_R1008] Data Loader is experimental and subject to breaking changes`), donc probablement amenée à évoluer vite.

### Second piège observé, spécifique aux nested routes — non confirmé de façon fiable

En ajoutant un loader Colada sur une route **imbriquée** (`beneficiary/:id/consultations`, sous le layout `beneficiary/:id`), le même type de crash (`injection "Symbol(router)" not found` → `Cannot read properties of undefined (reading 'Symbol(loaderEntries)')`) est apparu à plusieurs reprises, dans des conditions apparemment précises : pas au premier chargement direct de l'URL, mais **la toute première fois qu'un utilisateur navigue en SPA (clic) vers un loader imbriqué qui n'a encore jamais été résolu dans la session**, alors qu'aucun autre loader Colada n'a encore été utilisé.

Un premier test A/B (même code, seul le parcours de navigation change) avait semblé isoler la cause :

| Parcours | Résultat observé sur le moment |
|---|---|
| Reload direct sur `/beneficiary/:id/consultations` (1ᵉʳ loader de la session, imbriqué, mais via la navigation *initiale* du router) | ✅ fonctionne |
| `/beneficiary` → clic bénéficiaire → clic "Consultations" (1ᵉʳ loader de la session, imbriqué, via une navigation SPA *ultérieure*) | ❌ plante |
| `/devices` (réchauffe `useDevicesLoader`, route non-imbriquée) → clic "Beneficiary" → bénéficiaire → "Consultations" (loader imbriqué, mais **un autre** loader Colada a déjà tourné dans la session) | ✅ fonctionne |
| `/dashboard` (aucun loader) → clic "Devices" (1ᵉʳ loader de la session, **non-imbriqué**, via SPA) | ✅ fonctionne |

**Mais en essayant de construire une repro minimale pour ouvrir une issue upstream, le bug a cessé de se reproduire** — ni dans un projet neuf reconstruit fidèlement (mêmes versions, vrai routing filesystem, vrai `fetch` MSW, même profondeur de dossiers), ni en réduisant une copie de ce POC qui avait pourtant planté de façon fiable un peu plus tôt dans la même session, ni en retentant la séquence exacte de la toute première reproduction avec un serveur redémarré à froid. Conclusion révisée : ceci ressemble à une **race condition intermittente**, sensible à un facteur de timing/environnement non identifié (charge machine, ordre exact d'évaluation des modules, etc.) plutôt qu'à un bug déclenché de façon déterministe par la structure de code observée dans le tableau ci-dessus — ce tableau reflète donc des corrélations observées **une fois**, pas une cause confirmée.

Pas de correctif appliqué dans ce POC (pas de hack de "pré-chauffage" ajouté à `main.ts`). Pas d'issue GitHub ouverte non plus pour ce point précis, faute de repro fiable à fournir. Le crash est réel (vu plusieurs fois, stack trace complète à l'appui) mais imprévisible en l'état ; si le pattern nested routes + `defineColadaLoader` est adopté un jour ailleurs, prévoir de la marge pour re-investiguer si un comportement similaire apparaît, plutôt que de considérer le sujet clos.

## Réponse 5 — module sans page + nested routes

### `consultations`, un module complet sans `ui/pages/`

`consultations` suit exactement les mêmes couches que `devices` (`domain`/`application`/`infrastructure` avec `HttpConsultationRepository` + mocks MSW/faker) mais n'a pas de dossier `ui/pages/` — il n'est donc **pas** ajouté à `routesFolder` dans `vite.config.ts`. Il n'empêche : c'est un module tout aussi "complet" que `devices`, juste sans routing propre.

Son `index.ts` expose : le type `Consultation`, les use-cases instanciés (`listConsultationsForBeneficiary`, `getConsultationDetail`) et `useCreateConsultation` (mutation), plus deux composants de présentation pure (`ConsultationCard`, `ConsultationForm`). Ce sont les pages de **`beneficiary`** qui consomment cette API publique pour construire les routes `/beneficiary/:id/consultations/*` — le `defineColadaLoader(...)` lui-même est déclaré **dans la page de `beneficiary`** (contrainte du mécanisme : le loader doit être un export nommé du fichier de page scanné par le routing filesystem), mais sa fonction `query()` appelle un use-case exporté par `consultations`. Deux modules, deux responsabilités : `consultations` porte la logique et la donnée, `beneficiary` porte le routing et l'orchestration.

C'est un test grandeur nature de l'isolation : `dependency-cruiser` autorise `beneficiary` à importer `@modules/consultations` (son `index.ts`), mais bloquerait un import direct dans `@modules/consultations/domain/...` ou `.../infrastructure/...`.

### Nested routes vs route groups — deux mécanismes différents

Le POC utilise maintenant les deux conventions de dossier du file-based routing de vue-router v5, avec un comportement bien distinct :

| | Route group `(admin)/settings.vue` | Nested route `[id].vue` + `[id]/` |
|---|---|---|
| Où | `devices/ui/pages/(admin)/settings.vue` | `beneficiary/ui/pages/[id].vue` + `beneficiary/ui/pages/[id]/*.vue` |
| Effet | Le nom du dossier est **ignoré** dans l'URL (`/devices/settings`, pas `/devices/admin/settings`) | Le fichier devient un **layout parent** avec `<RouterView/>`, le dossier du même nom contient les **routes enfants** |
| Layout partagé | Non | Oui — obligatoire (`<RouterView/>` dans `[id].vue`) |
| URL du dossier | Absente de l'URL | Fait partie de l'URL (`:id`) |

Structure mise en place :

```text
beneficiary/ui/pages/
├── index.vue                    → /beneficiary
├── [id].vue                     → /beneficiary/:id (layout : header + nav + <RouterView/>)
└── [id]/
    ├── index.vue                → /beneficiary/:id (enfant par défaut : overview)
    └── consultations/
        ├── index.vue            → /beneficiary/:id/consultations
        ├── new.vue              → /beneficiary/:id/consultations/new
        └── [consultationId].vue → /beneficiary/:id/consultations/:consultationId
```

Vérifié dans `typed-router.d.ts` généré : `'/beneficiary/[id]'` liste bien ses 4 routes enfants (`'/beneficiary/[id]/'`, `.../consultations/'`, `.../consultations/[consultationId]'`, `.../consultations/new'`) — confirmation au niveau du typage, pas seulement du comportement observé. Vérifié aussi en navigateur : le header + la nav de `[id].vue` restent affichés sans se re-rendre pendant que seul le `<RouterView/>` change de contenu en passant d'un onglet à l'autre.

Aucune config Vite supplémentaire nécessaire : le scan de `routesFolder` est récursif, la structure imbriquée est détectée automatiquement sous l'entrée `beneficiary/` déjà déclarée.

### Alias `@modules`

Les pages de `beneficiary/ui/pages/[id]/consultations/*.vue` doivent importer `@modules/consultations` : en relatif, ça aurait été `../../../../../consultations`. Ajout d'un alias simple (`vite.config.ts` → `resolve.alias`, `tsconfig.app.json` → `paths`) qui devient quasi nécessaire dès que la profondeur de nesting augmente.

## Mocking (pas de vrai backend)

- `infrastructure/HttpDeviceRepository.ts` / `HttpConsultationRepository.ts` font un `fetch` réel — un adapter hexagonal normal, sans client HTTP maison.
- `infrastructure/mocks/*.factory.ts` génèrent de la fake data avec `@faker-js/faker`. Pour `consultations`, le jeu de données est généré **paresseusement par `beneficiaryId`** (une `Map`) — le module ne connaît pas la liste des bénéficiaires existants, il reste autonome. Les **ids sont fixes** (`${beneficiaryId}-consultation-1/2/3`, pas des UUID aléatoires) précisément pour qu'une URL de détail copiée-collée reste valide après un rechargement complet — seuls les autres champs (reason, notes, status, date) sont regénérés à chaque reload. `devices`, lui, garde des ids aléatoires (`faker.string.uuid()`) : un id copié avant un reload n'y survit pas, comportement volontairement laissé tel quel et documenté dans la vérification du POC.
- `infrastructure/mocks/*.handlers.ts` (MSW `http.get`/`http.post`). **Point corrigé en cours de route** : l'endpoint détail était initialement `GET /api/consultations/:id` (recherche à travers *toutes* les listes déjà générées) — un accès direct au détail sans être jamais passé par la liste dans la session renvoyait donc systématiquement 404, même pour un id par ailleurs valide. Corrigé en le nestant sous le bénéficiaire (`GET /api/beneficiaries/:beneficiaryId/consultations/:id`) : l'endpoint génère les données à la demande si besoin, exactement comme la liste, au lieu de dépendre de son passage préalable.
- **Composition en un seul worker** : `src/mocks/browser.ts` (top-level, hors de `src/modules/`) fait `setupWorker(...devicesMockHandlers, ...consultationsMockHandlers)` — un seul `setupWorker()`/service worker pour toute l'app, chaque module ne possède que ses handlers. `main.ts` importe ce fichier dynamiquement, uniquement en dev.
- **Chaque module expose ses handlers via un `mocks.ts` dédié, pas via son `index.ts`** (ex. `modules/devices/mocks.ts`) — `.dependency-cruiser.cjs` autorise explicitement ce 2ᵉ point d'entrée public en plus de `index.ts`. Vérifié : dans `pnpm run build`, ce chunk (MSW + faker) est totalement éliminé du bundle de prod — `import.meta.env.DEV` est inliné à `false`, l'appel devient du code mort et Rollup l'élague.

### Finding : ne jamais réexporter les mocks depuis l'`index.ts` "réel" d'un module

Première tentative de ce refactor : `devicesMockHandlers` était réexporté directement depuis `modules/devices/index.ts` (le même fichier que `useDeviceList`/`Device`, consommés par de vraies pages comme `dashboard.vue`). Résultat en `pnpm run build` : **`@faker-js/faker` (738 Ko) se retrouvait importé statiquement dans le chunk de `dashboard.vue`**, alors que `dashboard.vue` n'utilise ni MSW ni faker — Rollup ne sépare pas toujours proprement les usages "réels" et "mock-only" d'un même fichier barrel, même quand le seul point d'entrée vers le code mock est un `import()` dynamique par ailleurs correctement mort-en-prod.

Correctif appliqué : sortir les exports de handlers dans un fichier séparé (`modules/<x>/mocks.ts`), jamais réexporté par `index.ts`. Une fois séparés, `dashboard.vue` et `src/mocks/browser.ts` n'ont plus aucun module partagé, et le chunk `faker` disparaît entièrement du build (vérifié avant/après). À vérifier systématiquement dès que des handlers MSW sont exposés via un barrel de module — le même piège s'y appliquerait.

## Limites et points d'attention pour une adoption réelle

- Ne pas installer `unplugin-vue-router` : deprecated/archivé, remplacé par le support natif de `vue-router/vite` depuis la v5.
- Le module `beneficiary` de ce POC est entièrement inventé — il ne préfigure aucun module réel.
- Ne pas copier `pinia@3.0.4` / `@pinia/colada@1.3.1` comme des pins définitifs : ce sont les versions vérifiées compatibles avec `defineColadaLoader` **au 2026-07-31** (l'intégration est expérimentale) — revérifier les dernières versions au moment d'adopter ce pattern, y compris pour le second piège (nested routes) documenté en Réponse 4.

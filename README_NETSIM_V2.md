# NetSim v2 - Network Simulator Modernization

## Vue d'ensemble

NetSim v2 est une modernisation complète du simulateur réseau éducatif, migrant de JavaScript vanilla vers Vue 3 avec une interface utilisateur moderne et des fonctionnalités avancées.

## Nouvelle structure de projet

```
netsimv2/
├── README_NETSIM_V2.md           # Ce fichier
├── package.json                  # Configuration npm avec Vue 3
├── vite.config.js                # Configuration Vite
├── index.html                    # Point d'entrée principal
├── public/                       # Assets statiques
│   ├── favicon.ico
│   └── img/                      # Images et icônes (migrées)
│       ├── 64/
│       └── ...
├── src/                          # Code source Vue 3
│   ├── main.js                   # Point d'entrée Vue
│   ├── App.vue                   # Composant racine
│   ├── style.css                 # Styles globaux modernes
│   ├── components/               # Composants Vue
│   │   ├── ui/                   # Composants UI génériques
│   │   │   ├── ToolbarV2.vue
│   │   │   ├── ModernMenu.vue
│   │   │   ├── PropertyPanel.vue
│   │   │   ├── DeviceLibrary.vue
│   │   │   └── StatusBar.vue
│   │   ├── network/              # Composants réseau
│   │   │   ├── NetworkCanvas.vue
│   │   │   ├── NetworkDevice.vue
│   │   │   ├── NetworkLink.vue
│   │   │   └── SimulationControls.vue
│   │   └── dialogs/              # Fenêtres de dialogue
│   │       ├── DeviceConfig.vue
│   │       ├── DHCPServerConfig.vue
│   │       ├── DNSServerConfig.vue
│   │       ├── HTTPServerConfig.vue
│   │       └── NetworkDiagnostics.vue
│   ├── stores/                   # Pinia stores (state management)
│   │   ├── network.js            # État du réseau
│   │   ├── ui.js                 # État de l'interface
│   │   ├── simulation.js         # État de la simulation
│   │   └── devices.js            # État des équipements
│   ├── services/                 # Services métier (logique réseau migrée)
│   │   ├── network/
│   │   │   ├── NetworkEngine.js
│   │   │   ├── DeviceManager.js
│   │   │   └── LinkManager.js
│   │   ├── protocols/
│   │   │   ├── DHCPService.js
│   │   │   ├── DNSService.js
│   │   │   ├── HTTPService.js
│   │   │   └── ICMPService.js
│   │   ├── rendering/
│   │   │   ├── CanvasRenderer.js
│   │   │   └── SVGRenderer.js
│   │   └── utils/
│   │       ├── FileManager.js
│   │       ├── NetworkValidator.js
│   │       └── ConfigExporter.js
│   ├── composables/              # Composables Vue 3
│   │   ├── useNetwork.js
│   │   ├── useCanvas.js
│   │   ├── useDragDrop.js
│   │   └── useKeyboard.js
│   ├── types/                    # TypeScript types (optionnel)
│   │   ├── network.ts
│   │   ├── devices.ts
│   │   └── ui.ts
│   └── assets/                   # Assets sources
│       ├── icons/
│       ├── images/
│       └── styles/
│           ├── variables.css
│           ├── components.css
│           └── animations.css
├── legacy/                       # Code original (référence)
│   ├── js/                       # JavaScript original
│   ├── dist/                     # Build original
│   └── examples/
├── tests/                        # Tests unitaires et e2e
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/                         # Documentation
    ├── api.md
    ├── migration.md
    └── components.md
```

## Technologies utilisées

### Core Stack
- **Vue 3** - Framework JavaScript moderne
- **Vite** - Build tool ultra-rapide
- **Pinia** - State management pour Vue 3
- **Vue Router** - Routage (si nécessaire)

### Styling & UI
- **Tailwind CSS** - Framework CSS utility-first
- **Headless UI** - Composants accessibles
- **Heroicons** - Icônes modernes
- **CSS Variables** - Thèmes dynamiques

### Rendering & Canvas
- **Konva.js** - Bibliothèque 2D haute performance
- **D3.js** - Manipulation de données et visualisations
- **Canvas API** - Rendu personnalisé

### Development Tools
- **TypeScript** (optionnel) - Type safety
- **ESLint** - Linting
- **Prettier** - Formatage de code
- **Vitest** - Tests unitaires
- **Playwright** - Tests e2e

## Nouveaux packages ajoutés

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "pinia": "^2.1.7",
    "vue-router": "^4.2.5",
    "konva": "^9.2.0",
    "d3": "^7.8.5",
    "@headlessui/vue": "^1.7.16",
    "@heroicons/vue": "^2.0.18"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.2",
    "playwright": "^1.40.0"
  }
}
```

## Fonctionnalités nouvelles/améliorées

### Interface utilisateur
- **Design moderne** avec Tailwind CSS
- **Mode sombre/clair** 
- **Interface responsive**
- **Animations fluides**
- **Performance optimisée**

### Expérience utilisateur
- **Drag & Drop avancé**
- **Raccourcis clavier**
- **Undo/Redo**
- **Zoom/Pan fluide**
- **Sauvegarde automatique**

### Fonctionnalités réseau
- **Simulation temps réel améliorée**
- **Monitoring avancé**
- **Configuration simplifiée**
- **Graphiques de performance**
- **Diagnostic réseau étendu**

### Export/Import
- **Export SVG/PNG**
- **Export configuration**
- **Import/Export JSON amélioré**
- **Partage de topologies**

## Migration du code legacy

### Correspondances des fichiers
```
legacy/js/simulator.js        → src/services/network/NetworkEngine.js
legacy/js/UIManager.js        → src/stores/ui.js + composables/useCanvas.js
legacy/js/Network.js          → src/stores/network.js
legacy/js/Host.js             → src/services/network/DeviceManager.js
legacy/js/UIWindow.js         → src/components/ui/ModernDialog.vue
legacy/js/UIMenu.js           → src/components/ui/ModernMenu.vue
```

### État de la migration
- [ ] **Phase 1**: Setup Vue 3 + Vite
- [ ] **Phase 2**: Migration des composants UI
- [ ] **Phase 3**: Migration de la logique réseau
- [ ] **Phase 4**: Nouveaux composants modernes
- [ ] **Phase 5**: Tests et optimisation

## Getting Started

```bash
# Installation des dépendances
npm install

# Développement
npm run dev

# Build de production
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## Documentation

- [Guide de migration](docs/migration.md)
- [API Reference](docs/api.md)
- [Guide des composants](docs/components.md)


**NetSim v2** - Une expérience de simulation réseau moderne et intuitive 


```python
    # 1. Installer les dépendances
    cp package-v2.json package.json
    npm install

    # 2. Installer Tailwind CSS
    npm install -D @tailwindcss/forms @tailwindcss/typography

    # 3. Démarrer le serveur de développement
    npm run dev

    # 4. Ouvrir http://localhost:3000
```
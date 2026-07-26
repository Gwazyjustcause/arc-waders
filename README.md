# ARC Companion

ARC Companion is a lightweight, desktop-inspired progress workspace for
**ARC Raiders**. It is built with semantic HTML, modular CSS, and vanilla
JavaScript, and is ready to publish as a static GitHub Pages site.

## Application structure

```text
.
├── css/
│   ├── layout.css       # Design tokens, shell, responsive layout
│   ├── components.css   # Navigation, cards, buttons, controls
│   └── pages.css        # Page-specific composition
├── js/
│   └── app.js           # Data, storage, navigation, and views
└── index.html           # Accessible application shell
```

## Included modules

- Dashboard command overview
- Workshop material tracker
- Quest log with search and filters
- Skill build planner
- Loot Planner placeholder for a future phase
- Settings and local data controls

Progress is stored locally in the browser. Existing workshop, quest, and skill
tracking behavior remains available without a backend or framework.

## Run locally

Open `index.html` directly, or serve the directory with any static file server.
No build step is required.

## Deploy

Publish the repository root with GitHub Pages or another static host.

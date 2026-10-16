# KURO 黒 — 35°40'N | Luxury Brand Landing Page & Spatial Twin

> A high-density (1.25M+ volumetric micro-points) WebGL digital twin and luxury brand landing page for **KURO (黒)** — a contemporary Japanese single-cultivar matcha sanctuary and roastery. Features seamless scroll-driven Catmull-Rom spline camera cinematography, dark aesthetic with crisp white typography and ceremonial green brand accents, an editorial Brand Manifesto slide, and an end footer.

---

## 🗂️ Project Structure

```text
scroll camera/
├── index.html                    # Luxury brand landing page entry point
├── kissa_midori_3d_cozy_matcha_bar.html  # Mirrored entry point
├── package.json                  # Dev server scripts (npm run dev / npm run serve)
├── css/
│   └── styles.css                # Minimalist dark scrollbar, luxury glassmorphism cards, brand glow
└── js/
    ├── config.js                 # Shared state, 6 waypoint stations, spatial hotspots, baked lights
    ├── shaders.js                # Custom Three.js GLSL micro-splat vertex & fragment shaders
    ├── pointCollector.js         # MicroPointCollector engine (edge-biased sampling, procedural materials)
    ├── samplers.js               # Procedural 2D canvas bitmap typography samplers (chalkboard menu, signage)
    ├── scene/
    │   ├── architecture.js       # Mosaic tile floor, plaster walls, ribbed HVAC ducts, window bar, shelving
    │   ├── counters.js           # Pastry case, sliding tray, stone mill, chasen whisk, hero layered latte
    │   └── people.js             # Articulated point-cloud barista and patrons
    ├── interactions.js           # Raycast hover rings, story section triggers, scroll progress management
    └── main.js                   # Application bootstrap, spline camera interpolation, animation loop
```

---

## 🚀 Running Locally

```bash
# Start dev server
npm run dev

# Or with Python
npm run serve
```

Visit the local server URL (e.g. `http://localhost:3000` or `http://localhost:8088`) in your browser.

---

## 🍵 Story Sections & Brand Experience

1. **Hero**: Monumental brand title `KURO 黒`, live status badge, and subtle invitation to scroll into the sanctuary.
2. **01 / The Space**: Wabi-sabi silence, hand-cut bistro diamond mosaic floor, Cognac leather banquettes.
3. **02 / The Viennoiserie**: Laminated pastries, matcha canelés, burnt Basque cheesecake, with interactive pastry tray slider.
4. **03 / Extraction & Milling**: Uji granite *ishiusu* rotating at 60 RPM, with live RPM boost interaction.
5. **04 / The Ritual**: Hand-whisked ceremonial usucha in Kuro Raku chawan bowl, Takayama bamboo chasen.
6. **05 / The Signature**: Layered iced Kuro matcha latte with live 3D variant switcher (*Kuro Dirty*, *Uji Oat*, *Pure Usucha*).
7. **Brand KURO Manifesto**: Monumental brand statement ("TEA BEYOND SPEED. A TEMPORAL PAUSE.") and 3-pillar craft cards.
8. **Luxury End Footer**: Coordinates (`35°40'12"N · 139°42'04"E`), service hours, menu archive highlights, and first-harvest allocation list subscription.

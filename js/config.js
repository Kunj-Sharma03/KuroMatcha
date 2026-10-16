/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Configuration, State & Waypoint Station Data
 * ============================================================================
 */

export const state = {
    scrollProgress: 0,
    smoothScroll: 0,
    activeStation: 0,
    isDragging: false,
    pointerDownPos: { x: 0, y: 0 },
    dragStartX: 0,
    dragStartY: 0,
    yawOffset: 0,
    pitchOffset: 0,
    targetYaw: 0,
    targetPitch: 0,
    // Micro-pixel shader settings
    pointSizeScale: 1.15,
    pointDensityRatio: 1.0,
    colorMode: 0, // 0: Warm RGB, 1: LiDAR Depth, 2: Kuro Emerald
    scanWaveTime: -10.0,
    showPeople: true,
    // Interactive Counter Process States
    pastryDoorOpen: false,
    millRPM: 1.0,
    whiskSpeed: 1.0,
    whiskBoostTimer: 0,
    drinkVariant: 'dirty' // 'dirty' | 'oat' | 'ceremonial'
};

// --- 6 WAYPOINT STATIONS ---
export const STATIONS = [
    {
        id: 1,
        shortName: 'Exterior Window',
        title: '1 · Exterior Storefront Window',
        sub: 'Street Scan',
        detail: 'Backward "KURO" frosted decal · Warm interior glow & window bar patrons',
        markerPos: new THREE.Vector3(0.95, 1.45, 4.42),
        camPos: new THREE.Vector3(0.35, 1.68, 7.15),
        lookAt: new THREE.Vector3(0.20, 1.46, 0.85),
        actionIds: ['enter', 'pulse']
    },
    {
        id: 2,
        shortName: 'Mosaic Hall',
        title: '2 · Mosaic Hall & Banquettes',
        sub: 'Interior Wide',
        detail: 'Bistro mosaic tile floor · Cognac leather banquette & menu chalkboards',
        markerPos: new THREE.Vector3(0.45, 0.55, 1.75),
        camPos: new THREE.Vector3(0.82, 1.68, 3.15),
        lookAt: new THREE.Vector3(-0.35, 1.36, -1.85),
        actionIds: ['patrons', 'toBakery']
    },
    {
        id: 3,
        shortName: 'Bakery Case',
        title: '3 · Illuminated Bakery & Pastry Case',
        sub: 'Counter I · Bakery',
        detail: 'Flaky croissants · Matcha canelés · Burnt Basque cheesecakes & tags',
        markerPos: new THREE.Vector3(-1.25, 1.12, -0.62),
        camPos: new THREE.Vector3(-0.42, 1.44, 0.52),
        lookAt: new THREE.Vector3(-1.28, 1.02, -0.72),
        actionIds: ['slideTray', 'toMill']
    },
    {
        id: 4,
        shortName: 'Stone Mill',
        title: '4 · Uji Granite Stone Mill (Ishiusu)',
        sub: 'Counter II · Grind',
        detail: 'Grooved Mikage granite wheel grinding vibrant green tencha micro-powder',
        markerPos: new THREE.Vector3(-0.18, 1.22, -1.56),
        camPos: new THREE.Vector3(-0.18, 1.44, -0.65),
        lookAt: new THREE.Vector3(-0.18, 1.15, -1.62),
        actionIds: ['boostMill', 'toWhisk']
    },
    {
        id: 5,
        shortName: 'Whisking Bar',
        title: '5 · Matcha Whisking & Espresso Bar',
        sub: 'Counter III · Whisk',
        detail: 'Dual-boiler chrome espresso machine · Kuro chawan bowl & bamboo chasen',
        markerPos: new THREE.Vector3(0.48, 1.22, -1.62),
        camPos: new THREE.Vector3(0.35, 1.46, -0.62),
        lookAt: new THREE.Vector3(0.45, 1.16, -1.75),
        actionIds: ['rapidWhisk', 'toDrink']
    },
    {
        id: 6,
        shortName: 'Iced Kuro Latte',
        title: '6 · Window Bar & Iced Kuro Matcha Latte',
        sub: 'Counter IV · Product',
        detail: 'Layered ceremonial matcha, oat milk & ice micro-points on walnut bar',
        markerPos: new THREE.Vector3(0.42, 1.12, 3.92),
        camPos: new THREE.Vector3(0.42, 1.32, 3.05),
        lookAt: new THREE.Vector3(0.42, 1.08, 4.02),
        actionIds: ['drinkDirty', 'drinkOat', 'drinkCeremonial']
    }
];

// --- INTERACTIVE 3D SPATIAL HOTSPOTS (FOR HOVER HIGHLIGHT RING & CLICK) ---
export const SPATIAL_TARGETS = [
    { pos: new THREE.Vector3(1.15, 2.02, 4.45), radius: 0.65, label: 'KURO — Stencil Window Sign (35°40\'N)', station: 0 },
    { pos: new THREE.Vector3(-1.58, 1.85, 1.75), radius: 0.55, label: 'KURO Chalkboard Menu — Single Cultivar', station: 1 },
    { pos: new THREE.Vector3(-1.25, 1.02, -0.65), radius: 0.58, label: 'Illuminated Pastry Case (Click to Slide Tray)', actionType: 'togglePastryTray' },
    { pos: new THREE.Vector3(-0.18, 1.18, -1.56), radius: 0.28, label: 'Uji Granite Ishiusu Mill (Click to Boost Grind)', actionType: 'boostStoneMill' },
    { pos: new THREE.Vector3(0.26, 1.15, -1.52), radius: 0.25, label: 'Kuro Raku Chawan & Bamboo Chasen (Click to Whisk)', actionType: 'boostWhisking' },
    { pos: new THREE.Vector3(0.88, 1.28, -1.80), radius: 0.38, label: 'La Marzocco Dual-Boiler Espresso & Steam Bar', station: 4 },
    { pos: new THREE.Vector3(0.0, 2.25, -4.15), radius: 0.75, label: 'KURO 黒 — Backlit Cultivar Archive Wall', station: 4 },
    { pos: new THREE.Vector3(0.42, 1.11, 3.92), radius: 0.24, label: 'Iced Kuro Matcha Latte (Click to Cycle Layers)', actionType: 'cycleDrinkVariant' }
];

// --- MULTI-LIGHT RAYTRACED-STYLE ILLUMINATION SOURCES ---
export const BAKED_LIGHTS = [
    // 4 Warm Industrial Pendant Lamps over the L-Counter
    { pos: new THREE.Vector3(-1.45, 2.52, -0.68), color: new THREE.Color(1.0, 0.87, 0.64), radius: 3.8, intensity: 1.32 },
    { pos: new THREE.Vector3(-0.52, 2.52, -1.08), color: new THREE.Color(1.0, 0.87, 0.64), radius: 3.8, intensity: 1.28 },
    { pos: new THREE.Vector3(0.42, 2.52, -1.48), color: new THREE.Color(1.0, 0.87, 0.64), radius: 3.8, intensity: 1.30 },
    { pos: new THREE.Vector3(1.32, 2.52, -1.88), color: new THREE.Color(1.0, 0.87, 0.64), radius: 3.8, intensity: 1.22 },
    // Golden Backlit Roastery Shelving on Back Wall
    { pos: new THREE.Vector3(-0.95, 2.30, -4.05), color: new THREE.Color(1.0, 0.70, 0.26), radius: 4.0, intensity: 1.50 },
    { pos: new THREE.Vector3(0.95, 2.30, -4.05), color: new THREE.Color(1.0, 0.70, 0.26), radius: 4.0, intensity: 1.50 },
    // Warm Interior Pastry Case Glow
    { pos: new THREE.Vector3(-1.25, 1.05, -0.62), color: new THREE.Color(1.0, 0.84, 0.48), radius: 2.3, intensity: 1.42 },
    // Subtle Emerald LED Underglow beneath the Matcha Bar Counter
    { pos: new THREE.Vector3(0.25, 0.55, -1.15), color: new THREE.Color(0.32, 0.88, 0.36), radius: 2.1, intensity: 0.55 },
    // Warm Right-Wall Banquette Ambient Spill
    { pos: new THREE.Vector3(2.25, 1.75, 0.85), color: new THREE.Color(0.96, 0.80, 0.60), radius: 4.4, intensity: 0.72 },
    // Cool Streetlight / Dusk Spill through Front Storefront Window
    { pos: new THREE.Vector3(0.65, 2.25, 5.35), color: new THREE.Color(0.72, 0.86, 0.84), radius: 4.8, intensity: 0.68 }
];

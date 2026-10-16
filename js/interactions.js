/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Interactions, Raycasting, Story Action Triggers & Scroll Management
 * ============================================================================
 */

import { state, STATIONS, SPATIAL_TARGETS } from './config.js';

let onDrinkVariantChange = null;
let onTriggerScanWave = null;
let getPeopleCloud = null;
let getArchitectureCloud = null;
let getLidarMaterial = null;

export function initInteractions({
    drinkVariantCallback,
    scanWaveCallback,
    peopleCloudGetter,
    architectureCloudGetter,
    lidarMaterialGetter
}) {
    onDrinkVariantChange = drinkVariantCallback;
    onTriggerScanWave = scanWaveCallback;
    getPeopleCloud = peopleCloudGetter;
    getArchitectureCloud = architectureCloudGetter;
    getLidarMaterial = lidarMaterialGetter;

    setupBrandDOMListeners();
    setupKeyboardShortcuts();
    updateBrandProgressUI(0, 0);
}

export function updateBrandProgressUI(progress, stationIndex) {
    const sideProgress = document.getElementById('side-progress-bar');
    if (sideProgress) {
        sideProgress.style.height = `${Math.min(100, Math.max(8, progress * 100))}%`;
    }

    const sideStation = document.getElementById('side-station-num');
    if (sideStation) {
        const num = Math.min(6, Math.max(1, stationIndex + 1));
        sideStation.textContent = `0${num} / 06`;
    }
}

export function triggerLidarScanWave(customOrigin) {
    if (onTriggerScanWave) {
        const origin = customOrigin || STATIONS[Math.min(STATIONS.length - 1, state.activeStation)].markerPos;
        onTriggerScanWave(origin);
    }
}

export function togglePastryTray() {
    state.pastryDoorOpen = !state.pastryDoorOpen;
    triggerLidarScanWave(new THREE.Vector3(-1.25, 1.02, -0.65));
}

export function boostStoneMill() {
    state.millRPM = 5.5;
    triggerLidarScanWave(new THREE.Vector3(-0.18, 1.18, -1.56));
}

export function boostWhisking() {
    state.whiskBoostTimer = 3.6;
    triggerLidarScanWave(new THREE.Vector3(0.26, 1.15, -1.52));
}

export function setDrinkVariant(variant) {
    state.drinkVariant = variant;
    if (onDrinkVariantChange) onDrinkVariantChange(variant);
    triggerLidarScanWave(new THREE.Vector3(0.42, 1.11, 3.92));

    // Update variant button styles
    const variants = ['dirty', 'oat', 'ceremonial'];
    variants.forEach(v => {
        const btn = document.getElementById(`btn-variant-${v}`);
        if (!btn) return;
        if (v === variant) {
            btn.className = 'px-3 py-1.5 rounded bg-[#7CE354] text-black font-mono text-xs font-semibold transition-all';
        } else {
            btn.className = 'px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-all';
        }
    });
}

export function cycleDrinkVariant() {
    const order = ['dirty', 'oat', 'ceremonial'];
    const next = order[(order.indexOf(state.drinkVariant) + 1) % order.length];
    setDrinkVariant(next);
}

export function togglePeopleVisibility() {
    state.showPeople = !state.showPeople;
    const cloud = getPeopleCloud ? getPeopleCloud() : null;
    if (cloud) cloud.visible = state.showPeople;
}

export function checkSpatialTargetHover(clientX, clientY, camera, raycaster, mouse, lidarMaterial, canvas, microTag, microTagText) {
    raycaster.setFromCamera(mouse, camera);
    const ray = raycaster.ray;

    let bestTarget = null;
    let bestDist = Infinity;

    for (let i = 0; i < SPATIAL_TARGETS.length; i++) {
        const t = SPATIAL_TARGETS[i];
        const dRay = ray.distanceToPoint(t.pos);
        const dCam = camera.position.distanceTo(t.pos);
        if (dRay < t.radius && dCam < 7.8 && dCam < bestDist) {
            bestDist = dCam;
            bestTarget = t;
        }
    }

    if (bestTarget) {
        canvas.style.cursor = 'pointer';
        lidarMaterial.uniforms.uHoverPos.value.copy(bestTarget.pos);
        lidarMaterial.uniforms.uHoverRadius.value = bestTarget.radius;
        microTagText.textContent = bestTarget.label;
        microTag.style.left = `${clientX}px`;
        microTag.style.top = `${clientY}px`;
        microTag.style.opacity = '1';
    } else {
        canvas.style.cursor = state.isDragging ? 'grabbing' : 'grab';
        lidarMaterial.uniforms.uHoverRadius.value = 0.0;
        microTag.style.opacity = '0';
    }
}

export function handleSpatialClick(e, camera, raycaster, mouse) {
    if (e.target.id !== 'lidar-canvas') return;
    raycaster.setFromCamera(mouse, camera);
    const ray = raycaster.ray;

    for (let i = 0; i < SPATIAL_TARGETS.length; i++) {
        const t = SPATIAL_TARGETS[i];
        if (ray.distanceToPoint(t.pos) < t.radius && camera.position.distanceTo(t.pos) < 8.0) {
            if (t.actionType === 'togglePastryTray') togglePastryTray();
            else if (t.actionType === 'boostStoneMill') boostStoneMill();
            else if (t.actionType === 'boostWhisking') boostWhisking();
            else if (t.actionType === 'cycleDrinkVariant') cycleDrinkVariant();
            else if (typeof t.station === 'number') {
                const targetEl = document.getElementById(getSectionIdByStation(t.station));
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }
    }
}

function getSectionIdByStation(idx) {
    const map = [
        'story-hero',
        'story-atmosphere',
        'story-bakery',
        'story-mill',
        'story-whisk',
        'story-latte'
    ];
    return map[idx] || 'story-hero';
}

function setupBrandDOMListeners() {
    // Header pulse wave button
    document.getElementById('header-pulse-btn')?.addEventListener('click', () => triggerLidarScanWave());

    // Story Section Interactive Buttons
    document.getElementById('btn-trigger-pastry')?.addEventListener('click', togglePastryTray);
    document.getElementById('btn-trigger-mill')?.addEventListener('click', boostStoneMill);
    document.getElementById('btn-trigger-whisk')?.addEventListener('click', boostWhisking);

    // Drink variant selectors
    document.getElementById('btn-variant-dirty')?.addEventListener('click', () => setDrinkVariant('dirty'));
    document.getElementById('btn-variant-oat')?.addEventListener('click', () => setDrinkVariant('oat'));
    document.getElementById('btn-variant-ceremonial')?.addEventListener('click', () => setDrinkVariant('ceremonial'));
}

function setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space') {
            e.preventDefault();
            triggerLidarScanWave();
        } else if (e.key >= '1' && e.key <= '6') {
            const idx = parseInt(e.key, 10) - 1;
            const targetEl = document.getElementById(getSectionIdByStation(idx));
            if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        } else if (e.key.toLowerCase() === 'p') {
            togglePeopleVisibility();
        }
    });
}

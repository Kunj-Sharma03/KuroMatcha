/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Main Application Bootstrap & WebGL Render Loop
 * ============================================================================
 */

import { state, STATIONS } from './config.js';
import { createMicroPixelShaderMaterial } from './shaders.js';
import { buildMicroPointCafe } from './scene/architecture.js';
import { buildInteractiveCounterClouds, createHeroDrinkCloud } from './scene/counters.js';
import { buildPeoplePointClouds } from './scene/people.js';
import {
    initInteractions,
    checkSpatialTargetHover,
    handleSpatialClick,
    updateBrandProgressUI
} from './interactions.js';

let scene, camera, renderer, clock, raycaster, mouse;
let cameraPosSpline, cameraLookSpline;
let staticArchitectureCloud, peopleCloud, counterClouds;
let lidarMaterial;
let totalGeneratedPoints = 0;

function init() {
    const canvas = document.getElementById('lidar-canvas');
    if (!canvas) return;

    // 1. Scene, Camera & WebGL Renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040504);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.08, 55);
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 2. Camera Splines (Catmull-Rom Curves across 6 Waypoints)
    cameraPosSpline = new THREE.CatmullRomCurve3(STATIONS.map(s => s.camPos));
    cameraLookSpline = new THREE.CatmullRomCurve3(STATIONS.map(s => s.lookAt));

    // 3. Material & Volumetric Point Cloud Synthesis (~1.25M Points)
    lidarMaterial = createMicroPixelShaderMaterial();

    const archResult = buildMicroPointCafe(scene, lidarMaterial);
    staticArchitectureCloud = archResult.staticArchitectureCloud;
    totalGeneratedPoints += archResult.pointCount;

    counterClouds = buildInteractiveCounterClouds(scene, lidarMaterial, state);
    totalGeneratedPoints += counterClouds.pointCount;

    const peopleResult = buildPeoplePointClouds(scene, lidarMaterial);
    peopleCloud = peopleResult.peopleCloud;
    totalGeneratedPoints += peopleResult.pointCount;

    // 4. Initialize Interactions & Story Action Handlers
    initInteractions({
        drinkVariantCallback: (variant) => {
            createHeroDrinkCloud(scene, lidarMaterial, variant);
        },
        scanWaveCallback: (origin) => {
            state.scanWaveTime = clock.getElapsedTime();
            lidarMaterial.uniforms.uScanOrigin.value.copy(origin);
            lidarMaterial.uniforms.uScanWaveTime.value = state.scanWaveTime;
        },
        peopleCloudGetter: () => peopleCloud,
        architectureCloudGetter: () => staticArchitectureCloud,
        lidarMaterialGetter: () => lidarMaterial
    });

    // 5. Setup Window & Pointer Events
    setupEvents(canvas);

    // Initial positioning
    onWindowScroll();

    // Start render loop
    animate();
}

function setupEvents(canvas) {
    const microTag = document.getElementById('object-micro-tag');
    const microTagText = document.getElementById('micro-tag-text');

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    canvas.addEventListener('pointerdown', (e) => {
        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        if (!state.isDragging) {
            checkSpatialTargetHover(e.clientX, e.clientY, camera, raycaster, mouse, lidarMaterial, canvas, microTag, microTagText);
            return;
        }

        const dx = (e.clientX - state.dragStartX) / window.innerWidth;
        const dy = (e.clientY - state.dragStartY) / window.innerHeight;
        state.targetYaw = Math.max(-1.35, Math.min(1.35, state.targetYaw - dx * 2.7));
        state.targetPitch = Math.max(-0.68, Math.min(0.68, state.targetPitch - dy * 1.8));
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
        const moveDist = Math.hypot(e.clientX - state.pointerDownPos.x, e.clientY - state.pointerDownPos.y);
        state.isDragging = false;
        if (moveDist < 6) {
            handleSpatialClick(e, camera, raycaster, mouse);
        }
    });
}

function onWindowScroll() {
    const latteSection = document.getElementById('story-latte');
    let maxScrollyHeight = 1;
    if (latteSection) {
        maxScrollyHeight = Math.max(1, latteSection.offsetTop);
    } else {
        maxScrollyHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }

    const currentY = window.scrollY;
    state.scrollProgress = Math.min(1.0, Math.max(0, currentY / maxScrollyHeight));

    const currentStation = Math.min(STATIONS.length - 1, Math.round(state.scrollProgress * (STATIONS.length - 1)));
    if (currentStation !== state.activeStation) {
        state.activeStation = currentStation;
        state.targetYaw *= 0.25;
        state.targetPitch *= 0.25;
    }

    updateBrandProgressUI(state.scrollProgress, state.activeStation);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (lidarMaterial) {
        lidarMaterial.uniforms.uViewportHeight.value = window.innerHeight * Math.min(window.devicePixelRatio, 2);
    }
}

function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.1);
    const elapsed = clock.getElapsedTime();
    if (lidarMaterial) {
        lidarMaterial.uniforms.uTime.value = elapsed;
    }

    // 1. Smoothly Interpolate Camera along Spline
    state.smoothScroll += (state.scrollProgress - state.smoothScroll) * 0.08;
    const camPos = cameraPosSpline.getPointAt(state.smoothScroll);
    const lookPos = cameraLookSpline.getPointAt(state.smoothScroll);

    state.yawOffset += (state.targetYaw - state.yawOffset) * 0.1;
    state.pitchOffset += (state.targetPitch - state.pitchOffset) * 0.1;

    camera.position.copy(camPos);

    const lookDir = lookPos.clone().sub(camPos);
    const cosY = Math.cos(state.yawOffset);
    const sinY = Math.sin(state.yawOffset);
    const rx = lookDir.x * cosY - lookDir.z * sinY;
    const rz = lookDir.x * sinY + lookDir.z * cosY;
    lookDir.x = rx;
    lookDir.z = rz;
    lookDir.y += state.pitchOffset * lookDir.length() * 0.65;

    camera.lookAt(camPos.clone().add(lookDir));

    // 2. Animate Sliding Pastry Display Drawer
    if (counterClouds && counterClouds.pastryDrawerCloud) {
        const targetZ = state.pastryDoorOpen ? -0.35 : -0.65;
        counterClouds.pastryDrawerCloud.position.z += (targetZ - counterClouds.pastryDrawerCloud.position.z) * 0.1;
    }

    // 3. Animate Granite Stone Mill & Falling Green Tencha Micro-Powder
    state.millRPM += (1.0 - state.millRPM) * 0.03;
    if (counterClouds && counterClouds.millWheelCloud) {
        counterClouds.millWheelCloud.rotation.y -= dt * 0.95 * state.millRPM;
    }
    if (counterClouds && counterClouds.tenchaPowderCloud) {
        counterClouds.tenchaPowderCloud.rotation.y -= dt * 0.65 * state.millRPM;
        const pPos = counterClouds.tenchaPowderCloud.geometry.attributes.position;
        for (let i = 0; i < pPos.count; i++) {
            let py = pPos.getY(i) - dt * 0.035 * state.millRPM;
            if (py < -0.035) py = 0.025;
            pPos.setY(i, py);
        }
        pPos.needsUpdate = true;
    }

    // 4. Animate Bamboo Chasen Rapid W-Whisking
    if (state.whiskBoostTimer > 0) state.whiskBoostTimer -= dt;
    const wFreq = state.whiskBoostTimer > 0 ? 22.0 : 6.0;
    if (counterClouds && counterClouds.chasenWhiskCloud) {
        counterClouds.chasenWhiskCloud.position.x = 0.26 + Math.sin(elapsed * wFreq) * 0.028;
        counterClouds.chasenWhiskCloud.position.z = -1.52 + Math.cos(elapsed * wFreq * 2.0) * 0.022;
    }

    // 5. Animate Rising Steam Micro-Points
    if (counterClouds && counterClouds.steamCloud) {
        const sPos = counterClouds.steamCloud.geometry.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
            let sy = sPos.getY(i) + dt * 0.14;
            if (sy > 1.68) sy = 1.22;
            sPos.setY(i, sy);
        }
        sPos.needsUpdate = true;
    }

    // 6. Subtle Rotation on Hero Iced Kuro Matcha Latte
    if (counterClouds && counterClouds.getHeroDrinkCloud()) {
        const hero = counterClouds.getHeroDrinkCloud();
        hero.rotation.y = elapsed * 0.35;
    }

    renderer.render(scene, camera);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

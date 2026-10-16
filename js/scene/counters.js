/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Interactive Counter Point Clouds (Pastry Case, Stone Mill, Whisk, Hero Drink)
 * ============================================================================
 */

import { MicroPointCollector, walnutGrainFn } from '../pointCollector.js';

let heroDrinkCloud = null;

export function buildInteractiveCounterClouds(scene, lidarMaterial, state) {
    let pointCount = 0;

    // 1. SLIDING PASTRY TRAY CLOUD
    const trayPC = new MicroPointCollector(52000);
    trayPC.addBox(0, 0, 0, 1.42, 0.02, 0.68, walnutGrainFn, 2800, 0.86);
    trayPC.addBox(0, 0.20, 0, 1.42, 0.015, 0.62, () => [0.82, 0.88, 0.85], 2400, 0.82, true);

    for (let row = 0; row < 2; row++) {
        const py = row * 0.20 + 0.045;
        const pz = row === 0 ? 0.08 : -0.04;
        for (let i = -2; i <= 2; i++) {
            const px = i * 0.26;
            if (row === 0 && i % 2 === 0) {
                // Crescent Flaky Golden Butter Croissant
                for (let p = 0; p < 2200; p++) {
                    const s = (Math.random() - 0.5) * 2.2;
                    const rTube = 0.036 * (1.0 - 0.55 * s * s);
                    const theta = Math.random() * Math.PI * 2;
                    const cx = px + s * 0.048;
                    const cy = py + Math.sin(theta) * rTube;
                    const cz = pz + Math.cos(theta) * rTube + s * s * 0.022;
                    const flake = 0.06 * Math.sin(s * 18.0);
                    trayPC.addPoint(cx, cy, cz, 0.88 + flake, 0.58 + flake, 0.24, 0.80, true, 0.0012);
                }
            } else if ((i + row) % 2 === 0) {
                // Fluted Matcha Glazed Canelé de Bordeaux
                trayPC.addCylinder(px, py, pz, 0.038, 0.046, 0.068, (t, ang) => {
                    const flute = 0.04 * Math.sin(ang * 12.0);
                    return t > 0.72
                        ? [0.36 + flute, 0.78 + flute, 0.22] // Emerald Matcha glaze crown
                        : [0.26 + flute, 0.16 + flute, 0.10]; // Caramelized dark crust
                }, 2200, 'y', 0.80, true, true);
            } else {
                // Burnt Basque Matcha Cheesecake Wheel
                trayPC.addCylinder(px, py, pz, 0.062, 0.058, 0.052, (t) => {
                    return t > 0.82 ? [0.34, 0.18, 0.09] : [0.58, 0.84, 0.42];
                }, 2200, 'y', 0.80, true, true);
            }
            // Tiny Price Tag
            trayPC.addBox(px, py - 0.02, pz + 0.11, 0.055, 0.028, 0.004, (u, v) => {
                return (v > 0.35 && v < 0.65 && u > 0.15 && u < 0.85) ? [0.95, 0.95, 0.95] : [0.12, 0.12, 0.12];
            }, 9500, 0.75, true);
        }
    }
    const pastryDrawerCloud = trayPC.toThreePoints(lidarMaterial);
    pastryDrawerCloud.position.set(-1.25, 0.88, -0.65);
    scene.add(pastryDrawerCloud);
    pointCount += trayPC.count;

    // 2. ROTATING UPPER GRANITE STONE MILL WHEEL
    const millPC = new MicroPointCollector(12000);
    millPC.addCylinder(0, 0, 0, 0.125, 0.125, 0.068, (t, ang, x, y, z, r) => {
        if (t > 0.92 && r < 0.038) return [0.22, 0.58, 0.16]; // Green tencha leaves inside hopper
        const groove = Math.sin(ang * 16.0) * 0.04;
        return [0.50 + groove, 0.52 + groove, 0.51 + groove];
    }, 6800, 'y', 0.82, false, true);
    millPC.addCylinder(0.095, 0.055, 0, 0.014, 0.014, 0.085, walnutGrainFn, 1400, 'y', 0.82, false, true);
    const millWheelCloud = millPC.toThreePoints(lidarMaterial);
    millWheelCloud.position.set(-0.18, 1.21, -1.56);
    scene.add(millWheelCloud);
    pointCount += millPC.count;

    // Dynamic Falling Emerald Tencha Powder
    const powderPC = new MicroPointCollector(4500);
    for (let i = 0; i < 4200; i++) {
        const ang = Math.random() * Math.PI * 2;
        const rad = 0.124 + Math.random() * 0.022;
        const py = (Math.random() - 0.5) * 0.055;
        powderPC.addPoint(Math.cos(ang) * rad, py, Math.sin(ang) * rad, 0.44, 0.94, 0.26, 0.82, true, 0.001);
    }
    const tenchaPowderCloud = powderPC.toThreePoints(lidarMaterial);
    tenchaPowderCloud.position.set(-0.18, 1.16, -1.56);
    scene.add(tenchaPowderCloud);
    pointCount += powderPC.count;

    // 3. BAMBOO CHASEN WHISK MICRO-CLOUD
    const chasenPC = new MicroPointCollector(8500);
    chasenPC.addCylinder(0, 0.045, 0, 0.015, 0.018, 0.055, () => [0.84, 0.72, 0.46], 1800, 'y', 0.78, true);
    for (let t = 0; t < 48; t++) {
        const ang = (t / 48) * Math.PI * 2;
        for (let s = 0; s < 75; s++) {
            const u = s / 75;
            const rad = 0.016 + Math.sin(u * Math.PI) * 0.022;
            const tx = Math.cos(ang) * rad;
            const ty = 0.018 - u * 0.062;
            const tz = Math.sin(ang) * rad;
            chasenPC.addPoint(tx, ty, tz, 0.86, 0.75, 0.50, 0.72, true, 0.0005);
        }
    }
    const chasenWhiskCloud = chasenPC.toThreePoints(lidarMaterial);
    chasenWhiskCloud.position.set(0.26, 1.22, -1.52);
    scene.add(chasenWhiskCloud);
    pointCount += chasenPC.count;

    // Rising Micro-Steam Cloud
    const steamPC = new MicroPointCollector(2800);
    for (let i = 0; i < 2400; i++) {
        steamPC.addPoint(
            0.36 + (Math.random() - 0.5) * 0.34,
            1.22 + Math.random() * 0.45,
            -1.53 + (Math.random() - 0.5) * 0.18,
            0.86, 0.94, 0.88, 0.75, true, 0.004
        );
    }
    const steamCloud = steamPC.toThreePoints(lidarMaterial);
    scene.add(steamCloud);
    pointCount += steamPC.count;

    // 4. HERO DRINK CLOUD
    const drinkResult = createHeroDrinkCloud(scene, lidarMaterial, state.drinkVariant);
    pointCount += drinkResult.pointCount;

    return {
        pastryDrawerCloud,
        millWheelCloud,
        tenchaPowderCloud,
        chasenWhiskCloud,
        steamCloud,
        getHeroDrinkCloud: () => heroDrinkCloud,
        pointCount
    };
}

export function createHeroDrinkCloud(scene, lidarMaterial, variant) {
    if (heroDrinkCloud) {
        scene.remove(heroDrinkCloud);
        if (heroDrinkCloud.geometry) heroDrinkCloud.geometry.dispose();
    }
    const cupPC = new MicroPointCollector(32000);

    // Walnut Coaster
    cupPC.addCylinder(0, 0.008, 0, 0.082, 0.082, 0.014, walnutGrainFn, 2200, 'y', 0.82, false, true);

    // 3 Volumetric Liquid Layers + Ice Cubes + KURO Band
    for (let i = 0; i < 24000; i++) {
        const t = Math.random();
        const y = 0.018 + t * 0.21;
        const maxR = 0.054 + t * 0.018;
        const isShell = Math.random() < 0.65;
        const r = isShell ? maxR : maxR * Math.sqrt(Math.random());
        const ang = Math.random() * Math.PI * 2;
        const x = Math.cos(ang) * r;
        const z = Math.sin(ang) * r;

        // Matte-Black "KURO" Band around glass center
        if (isShell && t > 0.44 && t < 0.58) {
            const bandText = Math.sin(ang * 12.0) > 0.3 && t > 0.48 && t < 0.54;
            cupPC.addPoint(x, y, z, bandText ? 0.92 : 0.10, bandText ? 0.95 : 0.11, bandText ? 0.92 : 0.10, 0.80, true, 0.0008);
            continue;
        }

        let cr = 0.92, cg = 0.90, cb = 0.85;
        if (variant === 'dirty') {
            if (t < 0.28) { cr = 0.22; cg = 0.13; cb = 0.08; }
            else if (t < 0.68) { cr = 0.94; cg = 0.91; cb = 0.85; }
            else { cr = 0.34; cg = 0.86; cb = 0.22; }
        } else if (variant === 'oat') {
            if (t < 0.52) { cr = 0.95; cg = 0.92; cb = 0.86; }
            else if (t < 0.88) { cr = 0.36; cg = 0.88; cb = 0.24; }
            else { cr = 0.98; cg = 0.98; cb = 0.96; }
        } else {
            cr = 0.24 + t * 0.18;
            cg = 0.68 + t * 0.24;
            cb = 0.16 + t * 0.08;
        }

        // Crystalline Ice Cubes in upper portion
        if (!isShell && t > 0.55 && t < 0.88 && ((Math.floor(x * 45) + Math.floor(z * 45)) % 2 === 0)) {
            cr = Math.min(1.0, cr + 0.22);
            cg = Math.min(1.0, cg + 0.22);
            cb = Math.min(1.0, cb + 0.25);
        }

        cupPC.addPoint(x, y, z, cr, cg, cb, 0.78, true, 0.0009);
    }

    // Borosilicate Glass Straw
    cupPC.addCylinder(0.024, 0.16, 0, 0.007, 0.007, 0.26, () => [0.85, 0.95, 0.90], 1800, 'y', 0.76, true);

    heroDrinkCloud = cupPC.toThreePoints(lidarMaterial);
    heroDrinkCloud.position.set(0.42, 1.01, 3.92);
    scene.add(heroDrinkCloud);

    return { heroDrinkCloud, pointCount: cupPC.count };
}

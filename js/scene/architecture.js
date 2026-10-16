/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Cafe Architecture & Fixtures Point Cloud Builder (~1.1M Points)
 * ============================================================================
 */

import {
    MicroPointCollector,
    walnutGrainFn,
    darkWalnutFn,
    carraraMarbleFn,
    plasterWallFn,
    smoothstep
} from '../pointCollector.js';

import {
    windowSignSampler,
    featureWallSignSampler,
    menuChalkboardSampler
} from '../samplers.js';

export function addMicroPlant(pc, x, y, z, scale = 0.25) {
    pc.addCylinder(x, y + scale * 0.36, z, scale * 0.42, scale * 0.30, scale * 0.72, () => [0.58, 0.34, 0.22], 1400, 'y', 0.86);
    for (let b = 0; b < 8; b++) {
        const ang = (b / 8) * Math.PI * 2;
        const fx = x + Math.cos(ang) * scale * 0.46;
        const fy = y + scale * (0.82 + (b % 3) * 0.22);
        const fz = z + Math.sin(ang) * scale * 0.46;
        pc.addEllipsoid(fx, fy, fz, scale * 0.42, scale * 0.28, scale * 0.42, () => [0.30, 0.66, 0.26], 900, 0.86);
    }
}

export function buildMicroPointCafe(scene, lidarMaterial) {
    const pc = new MicroPointCollector(1160000);

    // 1. GEOMETRIC BISTRO MOSAIC TILE FLOOR & EXTERIOR SIDEWALK (245,000 pts)
    for (let i = 0; i < 245000; i++) {
        const x = (Math.random() - 0.5) * 7.12;
        const z = -4.45 + Math.random() * 10.9;
        if (z > 4.48) {
            // Exterior dark slate sidewalk tiles with wet evening street sheen
            const gx = Math.abs((x + 4.0) % 0.65);
            const gz = Math.abs(z % 0.65);
            const grout = (gx < 0.018 || gz < 0.018) ? 0.10 : 0.19;
            pc.addPoint(x, 0.0, z, grout, grout + 0.01, grout + 0.02, 0.95, false, 0.002);
        } else {
            // Classic European Cafe Geometric Diamond Mosaic Tile Floor (matches SiteScape reference)
            const tileU = ((x + 4.0) * 4.5) % 1.0;
            const tileV = ((z + 5.0) * 4.5) % 1.0;
            const tx = Math.floor((x + 4.0) * 4.5);
            const tz = Math.floor((z + 5.0) * 4.5);
            const manhattan = Math.abs(tileU - 0.5) + Math.abs(tileV - 0.5);

            let r = 0.78, g = 0.73, b = 0.66; // Warm limestone base
            if ((tx + tz) % 2 === 0) {
                if (manhattan < 0.24) {
                    r = 0.64; g = 0.43; b = 0.31; // Terracotta core diamond
                } else if (manhattan < 0.39) {
                    r = 0.24; g = 0.26; b = 0.27; // Charcoal slate border diamond
                }
            } else if (manhattan < 0.11) {
                r = 0.28; g = 0.30; b = 0.31; // Corner rosette accent
            }

            // Authentic SiteScape LiDAR scanner tripod shadow circle on the floor
            const dTripod = Math.hypot(x - (-0.82), z - 0.68);
            if (dTripod < 0.34) {
                const shade = smoothstep(0.06, 0.34, dTripod);
                r *= shade; g *= shade; b *= shade;
            }
            pc.addPoint(x, 0.0, z, r, g, b, 0.92, false, 0.0018);
        }
    }

    // 2. WALLS, CEILING & INDUSTRIAL GALVANIZED HVAC DUCTS (260,000 pts)
    pc.addBox(3.54, 1.95, 0.0, 0.02, 3.9, 8.95, plasterWallFn, 2850, 0.95, false, '-x');
    pc.addBox(-3.54, 1.95, -0.45, 0.02, 3.9, 8.05, plasterWallFn, 2600, 0.95, false, '+x');
    pc.addBox(0.0, 1.95, -4.44, 7.08, 3.9, 0.02, () => [0.64, 0.60, 0.55], 2700, 0.95, false, '+z');
    pc.addBox(0.0, 3.88, -0.1, 7.08, 0.02, 8.85, () => [0.56, 0.54, 0.51], 2100, 1.0, false, '-y');

    // Exposed Spiral Galvanized HVAC Ceiling Ducts with Ribbed Seams
    const hvacColor = (t, ang, x, y, z) => {
        const rib = Math.sin(z * 28.0 + x * 28.0) > 0.88 ? 0.68 : 0.54;
        const spec = Math.pow(Math.max(0, Math.sin(ang)), 4.0) * 0.16;
        return [rib + spec, rib + spec, rib + spec + 0.02];
    };
    pc.addCylinder(2.15, 3.48, 0.2, 0.23, 0.23, 8.2, hvacColor, 16500, 'z', 0.92);
    pc.addCylinder(-2.25, 3.48, -0.4, 0.21, 0.21, 6.8, hvacColor, 14000, 'z', 0.92);
    pc.addCylinder(0.0, 3.48, -3.2, 0.19, 0.19, 4.4, hvacColor, 9500, 'x', 0.92);

    // Split AC Unit + Framed Wall Art on Right Wall
    pc.addBox(3.40, 3.08, 2.35, 0.24, 0.28, 0.92, () => [0.90, 0.90, 0.88], 2400, 0.9);
    // Botanical Frame 1
    pc.addBox(3.49, 2.02, 1.55, 0.03, 0.72, 0.54, (u, v) => {
        if (u < 0.08 || u > 0.92 || v < 0.08 || v > 0.92) return [0.38, 0.24, 0.14];
        const d = Math.hypot(u - 0.5, v - 0.5);
        return d < 0.26 ? [0.28, 0.58, 0.30] : [0.90, 0.87, 0.80];
    }, 3400, 0.88, false, '-x');
    // Botanical Frame 2 (Chalk Sketch)
    pc.addBox(3.49, 2.08, 0.52, 0.03, 0.82, 0.62, (u, v) => {
        if (u < 0.06 || u > 0.94 || v < 0.06 || v > 0.94) return [0.18, 0.18, 0.18];
        const wave = Math.abs(Math.sin(u * 12.0 + v * 8.0)) < 0.15 ? 0.72 : 0.22;
        return [wave, wave, wave];
    }, 3400, 0.88, false, '-x');

    // 3. LEFT FOREGROUND PARTITION, CHALKBOARD MENU & CONSOLE (68,000 pts)
    pc.addBox(-2.55, 1.38, 1.75, 1.90, 2.76, 1.70, plasterWallFn, 2400, 0.94);
    // High-Clarity Bitmap-Sampled Chalkboard Menu on Partition Wall
    pc.addBox(-1.58, 1.85, 1.75, 0.02, 1.18, 0.92, (u, v) => menuChalkboardSampler(u, v), 18500, 0.78, true, '+x', false);
    // Left Walnut Console Table + Glowing Turquoise Glass Carafe
    pc.addBox(-2.55, 0.88, 2.72, 1.52, 0.06, 0.50, walnutGrainFn, 3200, 0.9);
    pc.addCylinder(-2.15, 1.02, 2.72, 0.055, 0.075, 0.24, () => [0.18, 0.86, 0.84], 2400, 'y', 0.85, true);

    // 4. FRONT STOREFRONT WINDOW, STENCIL "KURO 黒" SIGN & WINDOW BAR (76,000 pts)
    const matteBlackMetal = () => [0.13, 0.14, 0.14];
    pc.addBox(0.5, 3.45, 4.45, 6.2, 0.85, 0.18, matteBlackMetal, 1800, 0.92);
    pc.addBox(1.35, 0.48, 4.45, 4.5, 0.96, 0.22, matteBlackMetal, 2000, 0.92);
    pc.addBox(-3.2, 1.95, 4.45, 0.7, 3.9, 0.20, matteBlackMetal, 1800, 0.92);
    pc.addBox(-0.95, 1.95, 4.45, 0.16, 3.9, 0.20, matteBlackMetal, 2200, 0.92);

    // Stencil Point-Cloud Sign on Window Glass ("KURO 黒")
    for (let i = 0; i < 16000; i++) {
        const u = Math.random();
        const v = Math.random();
        const rgba = windowSignSampler(u, v);
        if (rgba[3] > 0.15) {
            const sx = 1.15 + (u - 0.5) * 1.65;
            const sy = 2.02 + (v - 0.5) * 0.68;
            pc.addPoint(sx, sy, 4.45, rgba[0], rgba[1], rgba[2], 0.82, true, 0.0012);
        } else if (Math.random() < 0.08) {
            // Subtle glass reflection micro-dots across window pane
            const gx = -0.8 + Math.random() * 4.2;
            const gy = 0.98 + Math.random() * 2.1;
            pc.addPoint(gx, gy, 4.45, 0.35, 0.42, 0.40, 0.75, true, 0.003);
        }
    }

    // Walnut Window Bar Counter + 3 Industrial Stools + Potted Plants on Sill
    pc.addBox(1.35, 0.98, 3.95, 3.90, 0.065, 0.54, walnutGrainFn, 3800, 0.90);
    [0.15, 1.25, 2.35].forEach(sx => {
        pc.addCylinder(sx, 0.66, 3.62, 0.17, 0.17, 0.04, matteBlackMetal, 1200, 'y', 0.88, false, true);
        pc.addCylinder(sx, 0.33, 3.62, 0.035, 0.11, 0.64, matteBlackMetal, 900, 'y', 0.88);
    });
    addMicroPlant(pc, -0.38, 1.02, 4.06, 0.25);
    addMicroPlant(pc, 1.68, 1.02, 4.08, 0.22);
    addMicroPlant(pc, 2.92, 1.02, 4.05, 0.27);
    addMicroPlant(pc, -2.75, 0.91, 2.72, 0.22);

    // 5. RIGHT WALL COGNAC LEATHER BANQUETTES & WALNUT BISTRO TABLES (64,000 pts)
    const cognacLeather = (u, v, x, y, z) => {
        const tuft = Math.sin(z * 16.0) * 0.03;
        return [0.58 + tuft, 0.34 + tuft * 0.7, 0.18 + tuft * 0.5];
    };
    pc.addBox(3.12, 0.24, 0.95, 0.72, 0.46, 3.85, cognacLeather, 2600, 0.92);
    pc.addBox(3.42, 0.72, 0.95, 0.18, 0.46, 3.85, cognacLeather, 2600, 0.92);

    [-0.12, 1.75].forEach(tz => {
        pc.addBox(2.25, 0.73, tz, 0.80, 0.05, 0.70, walnutGrainFn, 3600, 0.90);
        pc.addCylinder(2.25, 0.36, tz, 0.04, 0.18, 0.70, matteBlackMetal, 1400, 'y', 0.88);
        // Ceramic Matcha Cup & Saucer on Bistro Table
        pc.addCylinder(2.18, 0.79, tz + 0.08, 0.045, 0.035, 0.065, () => [0.92, 0.90, 0.86], 650, 'y', 0.80, false, true);
        pc.addCylinder(2.18, 0.822, tz + 0.08, 0.041, 0.041, 0.005, () => [0.38, 0.82, 0.24], 300, 'y', 0.80, true, true);
    });

    // 6. STATION 3: ILLUMINATED GLASS PASTRY DISPLAY CASE BASE & MARBLE BLOCK (82,000 pts)
    pc.addBox(-1.25, 0.38, -0.65, 1.56, 0.76, 0.90, darkWalnutFn, 2800, 0.92);
    // Crisp Glass Framing & Golden LED Light Bar
    pc.addBox(-1.25, 1.27, -0.65, 1.54, 0.025, 0.88, () => [0.95, 0.92, 0.82], 2400, 0.85, true);
    pc.addBox(-1.25, 1.25, -0.23, 1.50, 0.03, 0.03, () => [1.0, 0.92, 0.68], 2600, 0.95, true);
    // Subtle Glass Front & Side Panes with specular scan streaks
    pc.addBox(-1.25, 1.02, -0.65, 1.54, 0.50, 0.88, (u, v) => {
        const border = (u < 0.025 || u > 0.975 || v < 0.04 || v > 0.96);
        return border ? [0.85, 0.82, 0.75] : (Math.random() < 0.18 ? [0.65, 0.68, 0.65] : [0, 0, 0, 0]);
    }, 3200, 0.82, true);

    // White Carrara Marble Center Block + Two Tucked Bar Stools
    pc.addBox(-0.35, 0.58, -0.65, 0.68, 1.16, 0.92, carraraMarbleFn, 3600, 0.90);
    [-0.48, -0.14].forEach(sx => {
        pc.addCylinder(sx, 0.40, -0.06, 0.17, 0.15, 0.78, () => [0.16, 0.16, 0.17], 2400, 'y', 0.90, false, true);
    });

    // 7. STATION 4 & 5: WALNUT & MARBLE WHISKING BAR, ISHIUSU MILL & ESPRESSO MACHINE (115,000 pts)
    pc.addBox(0.85, 0.52, -1.65, 2.26, 1.04, 0.96, walnutGrainFn, 3100, 0.92);
    pc.addBox(0.85, 1.06, -1.65, 2.30, 0.06, 1.00, carraraMarbleFn, 4200, 0.90);
    // Subtle Emerald LED Underglow Strip along Bar Toe-Kick
    pc.addBox(0.85, 0.06, -1.16, 2.20, 0.025, 0.02, () => [0.42, 0.95, 0.35], 1800, 0.90, true);

    // Station 4: Grooved Mikage Granite Stone Mill Base (Ishiusu) + Bamboo Collection Tray
    pc.addCylinder(-0.18, 1.11, -1.56, 0.16, 0.16, 0.03, darkWalnutFn, 1800, 'y', 0.85, false, true);
    pc.addCylinder(-0.18, 1.145, -1.56, 0.125, 0.125, 0.06, (t, ang) => {
        const speckle = Math.sin(ang * 24.0) * 0.05;
        return [0.44 + speckle, 0.46 + speckle, 0.45 + speckle];
    }, 3400, 'y', 0.84, false, true);
    // Vibrant Ceremonial Matcha Powder Ring accumulating around the Stone Mill Seam
    pc.addCylinder(-0.18, 1.175, -1.56, 0.132, 0.126, 0.014, () => [0.42, 0.92, 0.24], 2800, 'y', 0.82, true);

    // Station 5: Handcrafted Matte-Black Kuro Raku Chawan Bowl + Jade Micro-Foam
    pc.addCylinder(0.26, 1.14, -1.52, 0.105, 0.075, 0.105, (t, ang) => {
        const glaze = 0.12 + 0.03 * Math.sin(ang * 8.0 + t * 12.0);
        return [glaze, glaze + 0.01, glaze];
    }, 4800, 'y', 0.80);
    // Dense Emerald Micro-Foam Crown inside the Chawan
    pc.addCylinder(0.26, 1.182, -1.52, 0.098, 0.0, 0.006, (t, ang, x, y, z, r) => {
        const swirl = 0.08 * Math.sin(r * 90.0 + ang * 3.0);
        return [0.34 + swirl, 0.86 + swirl, 0.22];
    }, 3600, 'y', 0.78, true, true);

    // Matte-Black Pour-Over Kettle & High-Precision Scale
    pc.addCylinder(0.50, 1.16, -1.54, 0.055, 0.072, 0.14, matteBlackMetal, 2200, 'y', 0.82, false, true);
    pc.addBox(0.26, 1.095, -1.52, 0.24, 0.015, 0.24, matteBlackMetal, 1200, 0.80);

    // Chrome Dual-Boiler La Marzocco Espresso Machine
    const brushedChrome = (u, v, x, y, z) => {
        const spec = 0.72 + 0.18 * Math.sin(x * 30.0 + y * 20.0);
        return [spec, spec + 0.01, spec + 0.02];
    };
    pc.addBox(0.88, 1.26, -1.80, 0.54, 0.34, 0.42, brushedChrome, 6500, 0.84);
    // Groupheads, Portafilter Handles & Cup Warming Rail
    [-0.12, 0.12].forEach(gx => {
        pc.addCylinder(0.88 + gx, 1.22, -1.56, 0.045, 0.042, 0.06, matteBlackMetal, 900, 'y', 0.80);
        pc.addCylinder(0.88 + gx, 1.20, -1.48, 0.014, 0.018, 0.14, darkWalnutFn, 600, 'z', 0.80);
    });
    // Stacked Ceramic Cups on Espresso Machine Warmer
    for (let cx = 0.70; cx <= 1.06; cx += 0.12) {
        pc.addCylinder(cx, 1.46, -1.80, 0.042, 0.032, 0.07, () => [0.92, 0.92, 0.90], 700, 'y', 0.78, false, true);
    }

    // 8. FOUR GLOWING INDUSTRIAL PENDANT LAMPS ABOVE THE COUNTER (18,000 pts)
    [
        [-1.45, 2.52, -0.68],
        [-0.52, 2.52, -1.08],
        [0.42, 2.52, -1.48],
        [1.32, 2.52, -1.88]
    ].forEach(([lx, ly, lz]) => {
        pc.addCylinder(lx, 3.20, lz, 0.007, 0.007, 1.32, matteBlackMetal, 550, 'y', 0.80);
        pc.addCylinder(lx, ly + 0.05, lz, 0.11, 0.24, 0.09, () => [1.0, 0.96, 0.86], 2800, 'y', 0.95, true, true);
        pc.addEllipsoid(lx, ly, lz, 0.14, 0.05, 0.14, () => [1.0, 0.98, 0.92], 900, 1.05, true);
    });

    // 9. BACKLIT ROASTERY CREDENZA, OAK SHELVES, KURO TINS & WALL SIGN (112,000 pts)
    pc.addBox(0.0, 0.52, -4.05, 4.65, 1.04, 0.66, walnutGrainFn, 2800, 0.92);

    // Backlit Stencil Feature Sign above Top Shelf ("KURO 黒")
    for (let i = 0; i < 14000; i++) {
        const u = Math.random();
        const v = Math.random();
        const rgba = featureWallSignSampler(u, v);
        if (rgba[3] > 0.2) {
            const wx = (u - 0.5) * 2.15;
            const wy = 3.16 + (v - 0.5) * 0.48;
            pc.addPoint(wx, wy, -4.38, rgba[0], rgba[1], rgba[2], 0.84, true, 0.0012);
        }
    }

    // 3 Tiers of Warm Amber Backlit Oak Shelves with Matte-Black KURO Matcha Tins
    [1.62, 2.12, 2.62].forEach((sy, sIdx) => {
        pc.addBox(0.0, sy + 0.17, -4.38, 4.25, 0.30, 0.02, () => [1.0, 0.72, 0.26], 3600, 0.96, true, '+z', false);
        pc.addBox(0.0, sy, -4.15, 4.35, 0.045, 0.38, walnutGrainFn, 2600, 0.90);

        for (let tx = -1.85; tx <= 1.85; tx += 0.34) {
            const isEmerald = Math.abs(Math.round(tx * 3 + sIdx)) % 2 === 0;
            pc.addCylinder(tx, sy + 0.10, -4.12, 0.058, 0.058, 0.16, (t, ang) => {
                if (t > 0.35 && t < 0.68) {
                    return isEmerald ? [0.38, 0.86, 0.28] : [0.92, 0.74, 0.28];
                }
                return [0.12, 0.13, 0.12];
            }, 950, 'y', 0.82, false, true);
        }
    });

    const staticArchitectureCloud = pc.toThreePoints(lidarMaterial);
    scene.add(staticArchitectureCloud);
    return { staticArchitectureCloud, pointCount: pc.count };
}

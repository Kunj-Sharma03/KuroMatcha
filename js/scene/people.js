/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Articulated Point-Cloud Patrons & Barista Builder (92,000 Points)
 * ============================================================================
 */

import { MicroPointCollector } from '../pointCollector.js';

export function buildPeoplePointClouds(scene, lidarMaterial) {
    const pc = new MicroPointCollector(95000);

    function addArticulatedPerson(px, py, pz, seated, facingAngle, jacketRGB, pantsRGB, hairRGB) {
        const cosA = Math.cos(facingAngle);
        const sinA = Math.sin(facingAngle);
        const rot = (lx, ly, lz) => [
            px + lx * cosA - lz * sinA,
            py + ly,
            pz + lx * sinA + lz * cosA
        ];

        const hipY = seated ? 0.52 : 0.90;
        const shoulderY = seated ? 1.02 : 1.38;
        const headY = seated ? 1.24 : 1.62;

        // Head & Hair Silhouette
        const [hx, hy, hz] = rot(0, headY, 0);
        pc.addEllipsoid(hx, hy, hz, 0.095, 0.118, 0.102, (u, v) => (v < 0.52 ? hairRGB : [0.84, 0.71, 0.62]), 3400, 0.84);

        // Neck & Torso
        const [tx, ty, tz] = rot(0, (hipY + shoulderY) * 0.5, 0);
        pc.addEllipsoid(tx, ty, tz, 0.185, 0.26, 0.12, () => jacketRGB, 7200, 0.85);

        // Arms reaching forward
        [-0.19, 0.19].forEach(side => {
            const [ax, ay, az] = rot(side, shoulderY - 0.14, 0.10);
            pc.addEllipsoid(ax, ay, az, 0.055, 0.16, 0.12, () => jacketRGB, 1800, 0.84);
        });

        // Legs
        [-0.09, 0.09].forEach(side => {
            if (seated) {
                const [kx, ky, kz] = rot(side, hipY, 0.16);
                pc.addEllipsoid(kx, ky, kz, 0.065, 0.065, 0.18, () => pantsRGB, 1600, 0.84);
                const [sx, sy, sz] = rot(side, hipY - 0.24, 0.28);
                pc.addCylinder(sx, sy, sz, 0.052, 0.042, 0.42, () => pantsRGB, 1600, 'y', 0.84);
            } else {
                const [lx, ly, lz] = rot(side, hipY * 0.5, 0);
                pc.addCylinder(lx, ly, lz, 0.068, 0.050, 0.86, () => pantsRGB, 2400, 'y', 0.84);
            }
        });
    }

    // 1. KURO Barista behind Whisking & Espresso Counter (Dark Olive Apron)
    addArticulatedPerson(0.32, 0.0, -2.22, false, 0.12, [0.18, 0.28, 0.20], [0.14, 0.15, 0.16], [0.12, 0.11, 0.10]);

    // 2. Window Bar Patron working on Laptop
    addArticulatedPerson(1.25, 0.0, 3.52, true, 0.0, [0.68, 0.64, 0.58], [0.22, 0.24, 0.28], [0.22, 0.16, 0.12]);
    // Aluminum Laptop
    pc.addBox(1.25, 1.02, 3.90, 0.32, 0.012, 0.22, () => [0.76, 0.78, 0.80], 2400, 0.80, true);
    pc.addBox(1.25, 1.12, 4.00, 0.32, 0.20, 0.010, (u, v) => (u > 0.06 && u < 0.94 && v > 0.08 && v < 0.92 ? [0.62, 0.82, 0.95] : [0.20, 0.22, 0.24]), 3200, 0.80, true);

    // 3. Two Patrons at Right-Wall Leather Banquette
    addArticulatedPerson(2.92, 0.0, 1.68, true, -Math.PI / 2, [0.34, 0.46, 0.32], [0.18, 0.18, 0.20], [0.15, 0.13, 0.11]);
    addArticulatedPerson(2.25, 0.0, 2.32, true, Math.PI, [0.58, 0.40, 0.28], [0.24, 0.22, 0.20], [0.28, 0.20, 0.14]);

    const peopleCloud = pc.toThreePoints(lidarMaterial);
    scene.add(peopleCloud);
    return { peopleCloud, pointCount: pc.count };
}

/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Micro-Point Collector & Procedural Material Functions
 * ============================================================================
 */

import { BAKED_LIGHTS } from './config.js';

export function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

// Procedural Material Noise Functions
export const walnutGrainFn = (u, v, x, y, z) => {
    const grain = Math.sin((x * 14.0 + y * 6.0 + z * 14.0) + Math.sin(x * 35.0) * 0.4) * 0.045;
    return [0.46 + grain, 0.28 + grain * 0.7, 0.15 + grain * 0.4];
};

export const darkWalnutFn = (u, v, x, y, z) => {
    const grain = Math.sin((x * 18.0 + z * 18.0)) * 0.03;
    return [0.24 + grain, 0.16 + grain, 0.11 + grain];
};

export const carraraMarbleFn = (u, v, x, y, z) => {
    const vein = Math.pow(0.5 + 0.5 * Math.sin(x * 9.5 + z * 11.0 + Math.sin(y * 18.0) * 1.4), 6.0) * 0.16;
    return [0.91 - vein, 0.90 - vein, 0.88 - vein];
};

export const plasterWallFn = (u, v, x, y, z) => {
    const tex = (Math.sin(x * 24.0) * Math.cos(y * 24.0)) * 0.02;
    return [0.78 + tex, 0.75 + tex, 0.70 + tex];
};

export class MicroPointCollector {
    constructor(maxPoints = 1260000) {
        this.positions = new Float32Array(maxPoints * 3);
        this.colors = new Float32Array(maxPoints * 3);
        this.sizes = new Float32Array(maxPoints);
        this.count = 0;
        this.maxPoints = maxPoints;
    }

    addPoint(x, y, z, r, g, b, size = 1.0, unlit = false, jitter = 0.0022) {
        if (this.count >= this.maxPoints) return;

        const px = x + (Math.random() - 0.5) * jitter;
        const py = y + (Math.random() - 0.5) * jitter;
        const pz = z + (Math.random() - 0.5) * jitter;

        // Subtle iPhone LiDAR sensor raster micro-grain
        const sensorGrain = 0.96 + 0.04 * Math.sin(px * 65.0 + py * 48.0 + pz * 55.0);
        let fr = r * sensorGrain;
        let fg = g * sensorGrain;
        let fb = b * sensorGrain;

        if (!unlit) {
            // Ambient occlusion in room corners & under counters
            let ao = 1.0;
            if (py < 0.18) ao *= (0.55 + (py / 0.18) * 0.45);
            if (py > 3.45) ao *= Math.max(0.32, 1.0 - (py - 3.45) * 0.95);

            let lightR = 0.30, lightG = 0.30, lightB = 0.31;
            for (let i = 0; i < BAKED_LIGHTS.length; i++) {
                const L = BAKED_LIGHTS[i];
                const dx = px - L.pos.x;
                const dy = py - L.pos.y;
                const dz = pz - L.pos.z;
                const d2 = dx * dx + dy * dy + dz * dz;
                const r2 = L.radius * L.radius;
                if (d2 < r2) {
                    const dist = Math.sqrt(d2);
                    const atten = Math.pow(1.0 - dist / L.radius, 1.75) * L.intensity;
                    lightR += L.color.r * atten;
                    lightG += L.color.g * atten;
                    lightB += L.color.b * atten;
                }
            }
            fr = Math.min(1.0, fr * lightR * ao);
            fg = Math.min(1.0, fg * lightG * ao);
            fb = Math.min(1.0, fb * lightB * ao);
        }

        const microNoise = (Math.random() - 0.5) * 0.022;
        const idx = this.count * 3;
        this.positions[idx] = px;
        this.positions[idx + 1] = py;
        this.positions[idx + 2] = pz;

        this.colors[idx] = Math.max(0, Math.min(1, fr + microNoise));
        this.colors[idx + 1] = Math.max(0, Math.min(1, fg + microNoise));
        this.colors[idx + 2] = Math.max(0, Math.min(1, fb + microNoise));

        this.sizes[this.count] = size * (0.9 + Math.random() * 0.2);
        this.count++;
    }

    // Edge-weighted Box Sampler: Concentrates extra points along the 12 structural edges so silhouettes are razor-sharp
    addBox(cx, cy, cz, w, h, d, colorFn, density = 1400, size = 0.95, unlit = false, faces = 'all', edgeBoost = true) {
        const areaXY = w * h;
        const areaXZ = w * d;
        const areaYZ = h * d;

        // Edge-biased random helper (pushes 22% of samples toward crisp edges)
        const sampleCoord = () => {
            if (edgeBoost && Math.random() < 0.22) {
                return Math.random() < 0.5 ? -0.5 + Math.random() * 0.04 : 0.5 - Math.random() * 0.04;
            }
            return Math.random() - 0.5;
        };

        if (faces === 'all' || faces.includes('z')) {
            const nXY = Math.max(12, Math.floor(areaXY * density));
            for (let i = 0; i < nXY; i++) {
                const u = sampleCoord();
                const v = sampleCoord();
                const x = cx + u * w;
                const y = cy + v * h;
                if (faces === 'all' || faces.includes('+z') || faces === 'z') {
                    const c1 = colorFn(u + 0.5, v + 0.5, x, y, cz + d / 2);
                    if (!c1 || c1[3] !== 0) this.addPoint(x, y, cz + d / 2, c1[0], c1[1], c1[2], size, unlit);
                }
                if (faces === 'all' || faces.includes('-z') || faces === 'z') {
                    const c2 = colorFn(u + 0.5, v + 0.5, x, y, cz - d / 2);
                    if (!c2 || c2[3] !== 0) this.addPoint(x, y, cz - d / 2, c2[0], c2[1], c2[2], size, unlit);
                }
            }
        }
        if (faces === 'all' || faces.includes('y')) {
            const nXZ = Math.max(12, Math.floor(areaXZ * density));
            for (let i = 0; i < nXZ; i++) {
                const u = sampleCoord();
                const v = sampleCoord();
                const x = cx + u * w;
                const z = cz + v * d;
                const c1 = colorFn(u + 0.5, v + 0.5, x, cy + h / 2, z);
                if (!c1 || c1[3] !== 0) this.addPoint(x, cy + h / 2, z, c1[0], c1[1], c1[2], size, unlit);
                if (faces === 'all' || faces.includes('-y')) {
                    const c2 = colorFn(u + 0.5, v + 0.5, x, cy - h / 2, z);
                    if (!c2 || c2[3] !== 0) this.addPoint(x, cy - h / 2, z, c2[0], c2[1], c2[2], size, unlit);
                }
            }
        }
        if (faces === 'all' || faces.includes('x')) {
            const nYZ = Math.max(12, Math.floor(areaYZ * density));
            for (let i = 0; i < nYZ; i++) {
                const u = sampleCoord();
                const v = sampleCoord();
                const y = cy + u * h;
                const z = cz + v * d;
                if (faces === 'all' || faces.includes('+x') || faces === 'x') {
                    const c1 = colorFn(v + 0.5, u + 0.5, cx + w / 2, y, z);
                    if (!c1 || c1[3] !== 0) this.addPoint(cx + w / 2, y, z, c1[0], c1[1], c1[2], size, unlit);
                }
                if (faces === 'all' || faces.includes('-x') || faces === 'x') {
                    const c2 = colorFn(v + 0.5, u + 0.5, cx - w / 2, y, z);
                    if (!c2 || c2[3] !== 0) this.addPoint(cx - w / 2, y, z, c2[0], c2[1], c2[2], size, unlit);
                }
            }
        }
    }

    // Rim-sharpened Cylinder Sampler (with optional top/bottom disc caps)
    addCylinder(cx, cy, cz, rTop, rBot, h, colorFn, numPts = 1800, axis = 'y', size = 0.92, unlit = false, capTop = false) {
        for (let i = 0; i < numPts; i++) {
            // Bias 18% of points to top & bottom rims for razor-sharp cylindrical edges
            let t = Math.random();
            if (Math.random() < 0.18) t = Math.random() < 0.5 ? Math.random() * 0.04 : 0.96 + Math.random() * 0.04;
            const angle = Math.random() * Math.PI * 2;
            let r = rBot + (rTop - rBot) * t;
            let offset = (t - 0.5) * h;

            if (capTop && Math.random() < 0.28) {
                t = 1.0;
                offset = 0.5 * h;
                r = rTop * Math.sqrt(Math.random());
            }

            let x = cx, y = cy, z = cz;
            if (axis === 'y') {
                x += Math.cos(angle) * r; y += offset; z += Math.sin(angle) * r;
            } else if (axis === 'z') {
                x += Math.cos(angle) * r; y += Math.sin(angle) * r; z += offset;
            } else {
                x += offset; y += Math.cos(angle) * r; z += Math.sin(angle) * r;
            }
            const c = colorFn(t, angle, x, y, z, r);
            this.addPoint(x, y, z, c[0], c[1], c[2], size, unlit, 0.0018);
        }
    }

    addEllipsoid(cx, cy, cz, rx, ry, rz, colorFn, numPts = 1200, size = 0.92, unlit = false) {
        for (let i = 0; i < numPts; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            const x = cx + rx * Math.sin(phi) * Math.cos(theta);
            const y = cy + ry * Math.cos(phi);
            const z = cz + rz * Math.sin(phi) * Math.sin(theta);
            const c = colorFn(u, v, x, y, z);
            this.addPoint(x, y, z, c[0], c[1], c[2], size, unlit, 0.0018);
        }
    }

    toThreePoints(material) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(this.positions.subarray(0, this.count * 3), 3));
        geo.setAttribute('color', new THREE.BufferAttribute(this.colors.subarray(0, this.count * 3), 3));
        geo.setAttribute('aSize', new THREE.BufferAttribute(this.sizes.subarray(0, this.count), 1));
        geo.setDrawRange(0, this.count);
        return new THREE.Points(geo, material);
    }
}

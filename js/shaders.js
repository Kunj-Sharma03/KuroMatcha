/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Custom Micro-Splat GLSL Shaders
 * ============================================================================
 */

export function createMicroPixelShaderMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPointSizeScale: { value: 1.15 },
            uViewportHeight: { value: window.innerHeight * Math.min(window.devicePixelRatio, 2) },
            uColorMode: { value: 0 },
            uScanWaveTime: { value: -10.0 },
            uScanOrigin: { value: new THREE.Vector3(0, 1.2, -0.5) },
            uHoverPos: { value: new THREE.Vector3(0, -99, 0) },
            uHoverRadius: { value: 0.0 }
        },
        vertexShader: `
            attribute float aSize;
            varying vec3 vColor;
            varying vec3 vWorldPos;
            varying float vDist;
            uniform float uPointSizeScale;
            uniform float uViewportHeight;

            void main() {
                vColor = color;
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPos = worldPosition.xyz;
                vec4 mvPosition = viewMatrix * worldPosition;
                gl_Position = projectionMatrix * mvPosition;

                vDist = max(0.38, -mvPosition.z);
                // Calibrated micro-pixel attenuation: close objects stay tight & crisp, far objects form solid pixel grain
                float projScale = (uViewportHeight * 0.0046 * aSize * uPointSizeScale) / pow(vDist, 0.86);
                gl_PointSize = clamp(projScale, 1.15, 5.2);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying vec3 vWorldPos;
            varying float vDist;
            uniform float uTime;
            uniform int uColorMode;
            uniform float uScanWaveTime;
            uniform vec3 uScanOrigin;
            uniform vec3 uHoverPos;
            uniform float uHoverRadius;

            void main() {
                vec2 cxy = 2.0 * gl_PointCoord - 1.0;
                float r2 = dot(cxy, cxy);
                if (r2 > 1.0) discard;

                // Slight Gaussian core boost so micro-splats read as crisp high-contrast volumetric pixels
                vec3 finalColor = vColor * (1.06 - r2 * 0.16);

                // Spectrum Modes
                if (uColorMode == 1) {
                    float h = clamp((vWorldPos.y + 0.1) / 3.7, 0.0, 1.0);
                    vec3 cold = vec3(0.10, 0.58, 0.96);
                    vec3 mid  = vec3(0.32, 0.92, 0.48);
                    vec3 warm = vec3(1.00, 0.64, 0.16);
                    vec3 heat = mix(cold, mid, smoothstep(0.0, 0.5, h));
                    heat = mix(heat, warm, smoothstep(0.5, 1.0, h));
                    float lum = dot(vColor, vec3(0.299, 0.587, 0.114));
                    finalColor = mix(heat * (0.42 + lum * 0.78), vColor, 0.22);
                } else if (uColorMode == 2) {
                    float lum = dot(vColor, vec3(0.299, 0.587, 0.114));
                    float greenSignal = vColor.g - max(vColor.r * 0.85, vColor.b);
                    if (greenSignal > 0.04) {
                        finalColor = vec3(0.45, 0.94, 0.32) * (0.58 + lum * 0.65);
                    } else {
                        finalColor = vec3(lum * 0.68, lum * 0.71, lum * 0.68);
                    }
                }

                // Interactive 3D Hover Highlight Ring directly inside the Point Cloud
                if (uHoverRadius > 0.01) {
                    float dHover = length(vWorldPos - uHoverPos);
                    if (dHover < uHoverRadius) {
                        float ringEdge = abs(dHover - uHoverRadius * 0.78);
                        float ringGlow = smoothstep(0.06, 0.0, ringEdge);
                        float innerTint = (1.0 - dHover / uHoverRadius) * 0.22;
                        finalColor = mix(finalColor, vec3(0.52, 0.96, 0.36), clamp(ringGlow * 0.85 + innerTint, 0.0, 1.0));
                    }
                }

                // Expanding LiDAR Spatial Pulse Wave
                float waveAge = uTime - uScanWaveTime;
                if (waveAge >= 0.0 && waveAge < 4.0) {
                    float distToOrigin = length(vWorldPos - uScanOrigin);
                    float waveRadius = waveAge * 3.9;
                    float ring = abs(distToOrigin - waveRadius);
                    if (ring < 0.22) {
                        float pulse = (1.0 - ring / 0.22) * (1.0 - waveAge / 4.0);
                        finalColor = mix(finalColor, vec3(0.48, 0.96, 0.34), pulse * 0.92);
                    }
                }

                // Subtle Depth-of-Field atmospheric falloff
                float fogFactor = exp(-0.0028 * vDist * vDist);
                finalColor = mix(vec3(0.016, 0.02, 0.016), finalColor, fogFactor);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        transparent: false,
        depthTest: true,
        depthWrite: true,
        vertexColors: true
    });
}

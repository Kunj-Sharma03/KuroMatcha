/**
 * ============================================================================
 * KURO — 35°40'N | Micro-Point Spatial Twin
 * Procedural 2D Bitmap Samplers for Point-Cloud Typography & Signage
 * ============================================================================
 */

export function createTextBitmapSampler(width, height, drawCallback) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    drawCallback(ctx, width, height);
    const imgData = ctx.getImageData(0, 0, width, height).data;
    return (u, v) => {
        const px = Math.min(width - 1, Math.max(0, Math.floor(u * width)));
        const py = Math.min(height - 1, Math.max(0, Math.floor((1.0 - v) * height)));
        const idx = (py * width + px) * 4;
        return [imgData[idx] / 255, imgData[idx + 1] / 255, imgData[idx + 2] / 255, imgData[idx + 3] / 255];
    };
}

// 1. Front Window Frosted Stencil Sign ("KURO 黒 — MATCHA & BAKERY")
export const windowSignSampler = createTextBitmapSampler(512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(235, 248, 240, 0.92)';
    ctx.lineWidth = 5;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = 'rgba(124, 227, 84, 0.65)';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, w - 60, h - 60);

    ctx.fillStyle = '#F4FAF6';
    ctx.font = '600 64px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('K U R O', w / 2 - 22, 128);

    ctx.fillStyle = '#7CE354';
    ctx.font = '400 44px sans-serif';
    ctx.fillText('黒', w / 2 + 148, 124);

    ctx.fillStyle = 'rgba(215, 232, 220, 0.88)';
    ctx.font = '400 18px Space Mono, monospace';
    ctx.fillText('UJI MATCHA · ARTISAN BAKERY · 35°40\'N', w / 2, 182);
});

// 2. Interior Feature Wall Minimalist Branding ("KURO // 黒")
export const featureWallSignSampler = createTextBitmapSampler(512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 58px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('K U R O   黒', w / 2, 88);
    ctx.fillStyle = '#7CE354';
    ctx.font = '400 16px Space Mono, monospace';
    ctx.fillText('FIRST HARVEST · STONE MILLED', w / 2, 128);
});

// 3. Left Partition Menu Chalkboard Sampler
export const menuChalkboardSampler = createTextBitmapSampler(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#141615';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#583922';
    ctx.lineWidth = 20;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    ctx.fillStyle = '#F3F4F6';
    ctx.font = '700 32px Inter, sans-serif';
    ctx.fillText('K U R O   M E N U', 48, 82);

    ctx.fillStyle = '#7CE354';
    ctx.font = '400 15px Space Mono, monospace';
    ctx.fillText('SINGLE-CULTIVAR UJI & VIENNOISERIE', 48, 115);

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(48, 136); ctx.lineTo(w - 48, 136); ctx.stroke();

    const lines = [
        ['01  KURO DIRTY MATCHA', '6.5'],
        ['02  ICED OAT CLOUD LATTE', '6.0'],
        ['03  SAMIDORI USUCHA BOWL', '7.5'],
        ['04  HOJICHA CORTADO', '5.5'],
        ['05  MATCHA CANELÉ DE BORDEAUX', '4.8'],
        ['06  BURNT BASQUE CHEESECAKE', '6.8'],
        ['07  LAMINATED BUTTER CROISSANT', '4.5'],
        ['08  BLACK SESAME KOUIGN', '5.4']
    ];
    ctx.font = '700 19px Space Mono, monospace';
    lines.forEach(([item, price], idx) => {
        const y = 188 + idx * 52;
        ctx.fillStyle = idx < 3 ? '#9AE66E' : '#E5E7EB';
        ctx.fillText(item, 48, y);
        ctx.fillStyle = '#9CA3AF';
        ctx.fillText(price, 412, y);
    });
});

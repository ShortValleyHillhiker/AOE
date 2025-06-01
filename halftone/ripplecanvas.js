import { drawDotGrid, resizeCanvasAndGrid } from '/halftone/grid-utils.js';
import { CONFIG } from '/halftone/config.js';

const {
    spacing, baseRadius, rippleWidth, rippleSpeed,
    dragCooldown, maxRipples, fadeFactor, frameRate
} = CONFIG;

const frameInterval = 1000 / frameRate;

function setupRippleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const isTouch = canvas.classList.contains('touch');
    const isAuto = canvas.classList.contains('automatic');
    const isLoop = canvas.classList.contains('loop');

    let grid = resizeCanvasAndGrid(canvas, spacing);
    let ripples = [];
    let lastFrame = 0;
    let dragging = false;
    let lastDrag = 0;
    let animating = false;
    let inView = true;

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDotGrid(ctx, grid, ({ x, y }) => {
            let scale = 1;
            for (const r of ripples) {
                if (r.alpha < 0.01) continue;
                const dx = x - r.x, dy = y - r.y;
                if (Math.abs(dx) > r.radius + rippleWidth || Math.abs(dy) > r.radius + rippleWidth) continue;
                const d2 = dx * dx + dy * dy;
                const min = r.radius - rippleWidth, max = r.radius + rippleWidth;
                if (d2 < min * min || d2 > max * max) continue;
                const d = Math.sqrt(d2), diff = Math.abs(d - r.radius);
                scale += (1 - diff / rippleWidth) * r.alpha * 2;
            }
            return Math.round(baseRadius * scale);
        });
    };

    const animate = (ts) => {
        if (ts - lastFrame >= frameInterval) {
            lastFrame = ts;
            draw();
            ripples = ripples.map(r => ({
                ...r,
                radius: r.radius + rippleSpeed,
                alpha: r.alpha * fadeFactor
            })).filter(r => r.alpha > 0.01);
            if (isAuto && Math.random() < 0.1) addRipple(Math.random() * canvas.width, Math.random() * canvas.height);
            if (isLoop && ripples.length === 0) addRipple(canvas.width / 2, canvas.height / 2);
        }

        const needsAnim = inView && (ripples.length || isAuto || isLoop || (isTouch && dragging));
        if (needsAnim) requestAnimationFrame(animate);
        else animating = false;
    };

    const addRipple = (x, y) => {
        if (!inView) return;
        if (ripples.length >= maxRipples) ripples.shift();
        ripples.push({ x, y, radius: 0, alpha: 1 });
        if (!animating) {
            animating = true;
            requestAnimationFrame(animate);
        }
    };

    if (isTouch) {
        canvas.addEventListener('pointerdown', e => {
            dragging = true;
            const r = canvas.getBoundingClientRect();
            addRipple(e.clientX - r.left, e.clientY - r.top);
            lastDrag = Date.now();
        });
        canvas.addEventListener('pointerup', () => dragging = false);
        canvas.addEventListener('pointermove', e => {
            if (!dragging || Date.now() - lastDrag < dragCooldown) return;
            const r = canvas.getBoundingClientRect();
            addRipple(e.clientX - r.left, e.clientY - r.top);
            lastDrag = Date.now();
        });
    }

    window.addEventListener('resize', () => {
        clearTimeout(canvas._resizeTimeout);
        canvas._resizeTimeout = setTimeout(() => {
            grid = resizeCanvasAndGrid(canvas, spacing);
            draw();
        }, 250);
    });

    new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView && !animating) {
            animating = true;
            requestAnimationFrame(animate);
        }
    }, { threshold: 0.1 }).observe(canvas);

    draw();
    if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas:not(.halftone)').forEach(setupRippleCanvas);
});
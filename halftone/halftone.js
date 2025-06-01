import { drawDotGrid, resizeCanvasAndGrid } from '/halftone/grid-utils.js';
import { CONFIG } from '/halftone/config.js';
import { getBrightnessAt } from '/halftone/image-utils.js';

const { spacing, baseRadius } = CONFIG;
const frameInterval = 1000 / 12;
const totalSteps = 10;

function setupHalftoneCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;
    const source = wrapper.querySelector('img');
    if (!source) return;

    const hidden = document.createElement('canvas');
    const hctx = hidden.getContext('2d', { willReadFrequently: true });

    let grid = [], imageData = null;
    let progress = 0;
    let animating = false, hasAnimated = false;
    let lastFrame = 0;

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDotGrid(ctx, grid, ({ x, y }) => {
            const b = getBrightnessAt(imageData, x, y, canvas.width);
            const scale = 1 + (1 - b - 1) * progress;
            return Math.round(baseRadius * scale * 2);
        });
    };

    const renderImage = () => {
        hctx.drawImage(source, 0, 0, canvas.width, canvas.height);
        imageData = hctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    const resize = () => {
        grid = resizeCanvasAndGrid(canvas, spacing);
        hidden.width = canvas.width;
        hidden.height = canvas.height;
        if (source.complete && source.naturalWidth) renderImage();
    };

    const animate = ts => {
        if (ts - lastFrame >= frameInterval) {
            lastFrame = ts;
            progress = Math.min(progress + 1 / totalSteps, 1);
            draw();
            if (progress >= 1) {
                animating = false;
                hasAnimated = true;
                return;
            }
        }
        if (animating) requestAnimationFrame(animate);
    };

    const start = () => {
        if (animating || hasAnimated) return;
        animating = true;
        progress = 0;
        requestAnimationFrame(animate);
    };

    source.onload = () => {
        resize();
        draw();
    };

    if (source.complete && source.naturalWidth) {
        resize();
        draw();
    }

    window.addEventListener('resize', () => {
        resize();
        draw();
    });

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
            setTimeout(start, 350);
        }
    }, { threshold: 0.1 }).observe(canvas);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas.halftone').forEach(setupHalftoneCanvas);
});
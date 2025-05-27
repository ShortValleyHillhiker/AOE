import { drawDotGrid, resizeCanvasAndGrid } from './grid-utils.js';
import { CONFIG } from './config.js';
import { getBrightnessAt } from './image-utils.js';

function setupHalftoneCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const spacing = CONFIG.spacing;
    const baseRadius = CONFIG.baseRadius;
    const wrapper = canvas.parentElement;
    const sourceImage = wrapper.querySelector('img');
    if (!sourceImage) return;

    const hiddenCanvas = document.createElement('canvas');
    const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });

    let imageData = null;
    let grid = [];
    let progress = 0; // 0 = uniform, 1 = full halftone
    let animating = false;
    let hasAnimated = false; // Track if animation ran once
    let lastFrameTime = 0;
    const frameInterval = 1000 / 12; // 12 FPS
    const totalSteps = 10; // animation steps
    let currentStep = 0;

function resizeCanvas() {
    // Match wrapper height to image aspect ratio
    if (sourceImage.naturalWidth > 0 && sourceImage.naturalHeight > 0) {
        const aspectRatio = sourceImage.naturalWidth / sourceImage.naturalHeight;
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapperWidth / aspectRatio;

        wrapper.style.height = `${wrapperHeight}px`;
    }

    grid = resizeCanvasAndGrid(canvas, spacing);

    hiddenCanvas.width = canvas.width;
    hiddenCanvas.height = canvas.height;

    if (sourceImage.complete && sourceImage.naturalWidth > 0) {
        drawImageToHiddenCanvas();
    }
}
    function drawImageToHiddenCanvas() {
        hiddenCtx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        imageData = hiddenCtx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function drawGrid() {
        drawDotGrid(ctx, grid, (dot) => {
            const brightness = getBrightnessAt(imageData, dot.x, dot.y, canvas.width);
            const halftoneScale = 1 - brightness;
            const scale = 1 + (halftoneScale - 1) * progress;
            return Math.round(baseRadius * scale * 2);
        });
    }

    function drawOnce() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
    }

    function animate(timestamp) {
        if (!lastFrameTime) lastFrameTime = timestamp;
        const elapsed = timestamp - lastFrameTime;

        if (elapsed >= frameInterval) {
            lastFrameTime = timestamp;

            currentStep++;
            progress = Math.min(currentStep / totalSteps, 1);
            drawOnce();

            if (progress >= 1) {
                animating = false;
                hasAnimated = true;
                return;
            }
        }

        if (animating) {
            requestAnimationFrame(animate);
        }
    }

    function startAnimation() {
        if (animating || hasAnimated) return;
        animating = true;
        currentStep = 0;
        progress = 0;
        requestAnimationFrame(animate);
    }

    function init() {
    function finalizeSetup() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resizeCanvas();
                drawOnce();
            });
        });
    }

    if (sourceImage.complete && sourceImage.naturalWidth > 0) {
        finalizeSetup();
    } else {
        sourceImage.onload = finalizeSetup;
    }
}

    window.addEventListener('resize', () => {
        resizeCanvas();
        drawOnce();
    });

    // IntersectionObserver triggers animation once per canvas
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting && !hasAnimated) {
                setTimeout(startAnimation, 350); // delay before start anim
            }
        }
    }, { threshold: 0.1 });

    observer.observe(canvas);

    init();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas.halftone').forEach(setupHalftoneCanvas);
});
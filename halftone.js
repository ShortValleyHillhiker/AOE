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
    let progress = 0; // transition: 0 = uniform, 1 = halftone
    let targetProgress = 0;
    let animating = false;
    let scaleTimeout = null;

    function resizeCanvas() {
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

            // Transition from scale = 1 to scale = halftoneScale
            const scale = 1 + (halftoneScale - 1) * progress;

            return Math.round(baseRadius * scale * 2);
        });
    }

    function drawOnce() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
    }

    function animate() {
        if (Math.abs(progress - targetProgress) < 0.01) {
            progress = targetProgress;
            drawOnce();
            animating = false;
            return;
        }

        progress += (targetProgress - progress) * 0.1;
        drawOnce();
        requestAnimationFrame(animate);
    }

    function setTargetProgress(value, delay = 0) {
        if (scaleTimeout) clearTimeout(scaleTimeout);

        if (delay > 0) {
            scaleTimeout = setTimeout(() => {
                targetProgress = value;
                if (!animating) {
                    animating = true;
                    requestAnimationFrame(animate);
                }
            }, delay);
        } else {
            targetProgress = value;
            if (!animating) {
                animating = true;
                requestAnimationFrame(animate);
            }
        }
    }

    function init() {
        if (sourceImage.complete && sourceImage.naturalWidth > 0) {
            resizeCanvas();
            drawOnce();
        } else {
            sourceImage.onload = () => {
                resizeCanvas();
                drawOnce();
            };
        }
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        drawOnce();
    });

    // Trigger with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                setTargetProgress(1, 150); // 150ms delay when entering
            } else {
                setTargetProgress(0); // immediate when leaving
            }
        }
    }, { threshold: 0.1 });

    observer.observe(canvas);

    init();
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas.halftone').forEach(setupHalftoneCanvas);
});

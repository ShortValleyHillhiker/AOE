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

            const scale = 1 - brightness;
            return Math.round(baseRadius * scale * 2);
        });
    }
    function drawOnce() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
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

    init(); // call the init you just defined
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas.halftone').forEach(setupHalftoneCanvas);
});
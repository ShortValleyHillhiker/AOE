import { createGrid, drawDotGrid, resizeCanvasAndGrid } from './grid-utils.js';
import { CONFIG } from './config.js';

function setupRippleCanvas(canvas) {
    const {
        spacing,
        baseRadius,
        rippleWidth,
        rippleSpeed,
        dragCooldown,
        maxRipples,
        fadeFactor,
        frameRate
    } = CONFIG;

    const ctx = canvas.getContext('2d');
    const isTouch = canvas.classList.contains('touch');
    const isAutomatic = canvas.classList.contains('automatic');
    const isLoop = canvas.classList.contains('loop');

    let grid = [];
    let ripples = [];
    let isDragging = false;
    let lastDragTime = 0;
    let animating = false;

    function resizeCanvas() {
        grid = resizeCanvasAndGrid(canvas, spacing);
    }

    function addRipple(x, y) {
        if (ripples.length >= maxRipples) ripples.shift();
        ripples.push({ x, y, radius: 0, alpha: 1 });
        if (!animating) {
            animating = true;
            requestAnimationFrame(animate);
        }
    }

    function drawGrid() {
        drawDotGrid(ctx, grid, (dot) => {
            let scale = 1;

            for (const ripple of ripples) {
                if (ripple.alpha < 0.01) continue;

                // Quick bounding box check first
                const maxInfluence = ripple.radius + rippleWidth;
                const dx = dot.x - ripple.x;
                if (Math.abs(dx) > maxInfluence) continue;

                const dy = dot.y - ripple.y;
                if (Math.abs(dy) > maxInfluence) continue;

                // Avoid sqrt when outside max influence (optional for extra speed)
                const distSq = dx * dx + dy * dy;
                const min = ripple.radius - rippleWidth;
                const max = ripple.radius + rippleWidth;
                if (distSq < min * min || distSq > max * max) continue;

                const dist = Math.sqrt(distSq);
                const diff = Math.abs(dist - ripple.radius);
                const strength = (1 - diff / rippleWidth) * ripple.alpha;
                scale += strength * 2;
            }

            return Math.round(baseRadius * scale);
        });
    }

    let lastFrameTime = 0;
    const frameInterval = 1000 / frameRate;

    function animate(timestamp) {
        if (timestamp - lastFrameTime >= frameInterval) {
            lastFrameTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();

            for (const ripple of ripples) {
                ripple.radius += rippleSpeed;
                ripple.alpha *= fadeFactor;
            }

            ripples = ripples.filter(r => r.alpha > 0.01);

            if (isAutomatic && Math.random() < 0.1) {
                addRipple(Math.random() * canvas.width, Math.random() * canvas.height);
            }

            if (isLoop && ripples.length === 0) {
                addRipple(canvas.width / 2, canvas.height / 2);
            }
        }

        if (ripples.length > 0 || isAutomatic || isLoop || isTouch) {
            requestAnimationFrame(animate);
        } else {
            animating = false;
        }
    }


    if (isTouch) {
        canvas.addEventListener('pointerdown', (e) => {
            isDragging = true;
            const rect = canvas.getBoundingClientRect();
            addRipple(e.clientX - rect.left, e.clientY - rect.top);
            lastDragTime = Date.now();
        });

        canvas.addEventListener('pointerup', () => isDragging = false);

        canvas.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            const now = Date.now();
            if (now - lastDragTime > dragCooldown) {
                const rect = canvas.getBoundingClientRect();
                addRipple(e.clientX - rect.left, e.clientY - rect.top);
                lastDragTime = now;
            }
        });
    }

    resizeCanvas();
let resizeTimeout = null;
let lastCanvasWidth = canvas.width;
let lastCanvasHeight = canvas.height;

window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        const newWidth = canvas.parentElement.clientWidth;
        const newHeight = canvas.parentElement.clientHeight;

        const widthChanged = Math.abs(newWidth - lastCanvasWidth) > 2;
        const heightChanged = Math.abs(newHeight - lastCanvasHeight) > 2;

        if (widthChanged || heightChanged) {
            lastCanvasWidth = newWidth;
            lastCanvasHeight = newHeight;
            resizeCanvas();
        }
    }, 250); // longer delay helps avoid flicker on scroll
});

    if (!animating) {
        animating = true;
        requestAnimationFrame(animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas:not(.halftone)').forEach(setupRippleCanvas);
});
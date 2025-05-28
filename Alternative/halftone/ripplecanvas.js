import { createGrid, drawDotGrid, resizeCanvasAndGrid } from '/Alternative/halftone/grid-utils.js';
import { CONFIG } from '/Alternative/halftone/config.js';

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

let nextRippleShape = 'triangle';
const rippleSequence = ['triangle', 'circle', 'square'];

function addRipple(x, y) {
    if (ripples.length >= maxRipples) ripples.shift();

    ripples.push({
        x,
        y,
        radius: 0,
        alpha: 1,
        shape: nextRippleShape
    });

    const index = rippleSequence.indexOf(nextRippleShape);
    nextRippleShape = rippleSequence[(index + 1) % rippleSequence.length];

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
                let distanceToEdge;

switch (ripple.shape) {
    case 'circle': {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > ripple.radius + rippleWidth) continue;
        distanceToEdge = Math.abs(dist - ripple.radius);
        break;
    }

    case 'square': {
        const maxAxis = Math.max(Math.abs(dx), Math.abs(dy));
        if (maxAxis > ripple.radius + rippleWidth) continue;
        distanceToEdge = Math.abs(maxAxis - ripple.radius);
        break;
    }

case 'triangle': {
    const dist = distanceToCenteredTriangle(dx, dy, ripple.radius);
    if (dist > rippleWidth) continue;
    distanceToEdge = dist;
    break;
}

}

if (distanceToEdge > rippleWidth) continue;

const edgeFalloff = 1 - distanceToEdge / rippleWidth;
const strength = edgeFalloff * ripple.alpha;
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















function distanceToCenteredTriangle(x, y, radius) {
    // Equilateral triangle centered at (0, 0)
    // Points are rotated 90° so one corner faces upward
    const points = [
        [0, -radius],
        [radius * Math.sin(Math.PI / 3), radius * 0.5],
        [-radius * Math.sin(Math.PI / 3), radius * 0.5]
    ];

    // Compute min distance from point (x, y) to triangle edge
    let minDist = Infinity;
    for (let i = 0; i < 3; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % 3];
        const dist = pointToLineDistance(x, y, x1, y1, x2, y2);
        minDist = Math.min(minDist, dist);
    }

    // Also skip points outside triangle using barycentric test
    if (!isPointInTriangle([x, y], points[0], points[1], points[2])) return Infinity;

    return minDist;
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const t = Math.max(0, Math.min(1, dot / lenSq));

    const closestX = x1 + t * C;
    const closestY = y1 + t * D;

    const dx = px - closestX;
    const dy = py - closestY;

    return Math.sqrt(dx * dx + dy * dy);
}

function isPointInTriangle(p, a, b, c) {
    const [px, py] = p;
    const [ax, ay] = a;
    const [bx, by] = b;
    const [cx, cy] = c;

    const v0x = cx - ax, v0y = cy - ay;
    const v1x = bx - ax, v1y = by - ay;
    const v2x = px - ax, v2y = py - ay;

    const dot00 = v0x * v0x + v0y * v0y;
    const dot01 = v0x * v1x + v0y * v1y;
    const dot02 = v0x * v2x + v0y * v2y;
    const dot11 = v1x * v1x + v1y * v1y;
    const dot12 = v1x * v2x + v1y * v2y;

    const denom = dot00 * dot11 - dot01 * dot01;
    if (denom === 0) return false;

    const u = (dot11 * dot02 - dot01 * dot12) / denom;
    const v = (dot00 * dot12 - dot01 * dot02) / denom;

    return u >= 0 && v >= 0 && u + v <= 1;
}


























}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas:not(.halftone)').forEach(setupRippleCanvas);
});
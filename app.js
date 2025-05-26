function setupRippleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const spacing = 8;
    const baseRadius = 2.5;
    const rippleWidth = 12;
    const rippleSpeed = 10;
    const dragCooldown = 150;
    const maxRipples = 15;
    const fadeFactor = 0.9;

    const isTouch = canvas.classList.contains('touch');
    const isAutomatic = canvas.classList.contains('automatic');
    const isLoop = canvas.classList.contains('loop');
    const isHalftone = canvas.classList.contains('halftone');

    let grid = [];
    let ripples = [];
    let isDragging = false;
    let lastDragTime = 0;
    let imageData = null;

    const hiddenCanvas = document.createElement('canvas');
    const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
    const sourceImage = document.getElementById('source-img');

    function resizeCanvas() {
        const wrapper = canvas.parentElement;
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
        hiddenCanvas.width = canvas.width;
        hiddenCanvas.height = canvas.height;
        createGrid();

        if (isHalftone && sourceImage.complete) {
            drawImageToHiddenCanvas();
        }
    }

    function createGrid() {
        grid = [];
        const cols = Math.floor(canvas.width / spacing);
        const rows = Math.floor(canvas.height / spacing);
        const gridOffsetX = (canvas.width - cols * spacing) / 2;
        const gridOffsetY = (canvas.height - rows * spacing) / 2;

        for (let y = 0; y <= rows; y++) {
            for (let x = 0; x <= cols; x++) {
                const offsetX = (y % 2 === 0) ? 0 : spacing / 2;
                grid.push({
                    x: gridOffsetX + x * spacing + offsetX,
                    y: gridOffsetY + y * spacing
                });
            }
        }
    }

    function drawImageToHiddenCanvas() {
        hiddenCtx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        imageData = hiddenCtx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function getBrightnessAt(x, y) {
        if (!imageData) return 1;
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const idx = (iy * canvas.width + ix) * 4;
        const [r, g, b] = imageData.data.slice(idx, idx + 3);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    function addRipple(x, y) {
        if (ripples.length >= maxRipples) ripples.shift();
        ripples.push({ x, y, radius: 0, alpha: 1 });
    }

    if (isTouch) {
        canvas.addEventListener('pointerdown', (e) => {
            isDragging = true;
            const rect = canvas.getBoundingClientRect();
            addRipple(e.clientX - rect.left, e.clientY - rect.top);
            lastDragTime = Date.now();
        });

        canvas.addEventListener('pointerup', () => {
            isDragging = false;
        });

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

    function drawGrid() {
        for (const dot of grid) {
            let scale = 1;

            if (isHalftone && imageData) {
                const brightness = getBrightnessAt(dot.x, dot.y);
                scale = 1 - brightness;
            } else {
                for (const ripple of ripples) {
                    if (ripple.alpha < 0.01) continue;

                    const dx = dot.x - ripple.x;
                    const dy = dot.y - ripple.y;
                    if (Math.abs(dx) > ripple.radius + rippleWidth) continue;
                    if (Math.abs(dy) > ripple.radius + rippleWidth) continue;

                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const diff = Math.abs(dist - ripple.radius);
                    if (diff < rippleWidth) {
                        const strength = (1 - diff / rippleWidth) * ripple.alpha;
                        scale += strength * 2;
                    }
                }
            }

            ctx.beginPath();
            const radiusMultiplier = isHalftone ? 2 : 1;
            const radius = Math.round(baseRadius * scale * radiusMultiplier);
            ctx.arc(Math.round(dot.x), Math.round(dot.y), radius, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
        }
    }

    let lastFrame = 0;
    const frameInterval = 1000 / 12;

    function animate(timestamp) {
        if (timestamp - lastFrame >= frameInterval) {
            lastFrame = timestamp;
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
        requestAnimationFrame(animate);
    }

    sourceImage.onload = () => {
        if (isHalftone && sourceImage.naturalWidth > 0) {
            drawImageToHiddenCanvas();
            requestAnimationFrame(animate);
        }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    if (!isHalftone) requestAnimationFrame(animate);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('canvas.ripple-canvas').forEach(setupRippleCanvas);
});
export function createGrid(canvas, spacing = 8) {
    const grid = [];

    const cols = Math.ceil(canvas.width / spacing);
    const rows = Math.ceil(canvas.height / spacing);

    for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
            const offsetX = (y % 2 === 0) ? 0 : spacing / 2;

            grid.push({
                x: x * spacing + offsetX,
                y: y * spacing
            });
        }
    }

    return grid;
}

export function drawDotGrid(ctx, grid, getRadius) {
    for (const dot of grid) {
        const radius = getRadius(dot);
        if (radius <= 0) continue;

        ctx.beginPath();
        ctx.arc(Math.round(dot.x), Math.round(dot.y), radius, 0, Math.PI * 2);
        ctx.fillStyle = '#1c1c1c';
        ctx.fill();
    }
}

export function resizeCanvasAndGrid(canvas, spacing = 8) {
    const wrapper = canvas.parentElement;

    if (canvas.classList.contains('halftone')) {
        const image = wrapper.querySelector('img');
        if (image && image.naturalWidth > 0) {
            const aspectRatio = image.naturalWidth / image.naturalHeight;
            const wrapperWidth = wrapper.clientWidth;
            const wrapperHeight = wrapperWidth / aspectRatio;

            wrapper.style.height = `${wrapperHeight}px`;
            canvas.width = wrapperWidth;
            canvas.height = wrapperHeight;
        } else {
            const fallbackHeight = wrapper.clientWidth * 0.5625;
            wrapper.style.height = `${fallbackHeight}px`;
            canvas.width = wrapper.clientWidth;
            canvas.height = fallbackHeight;
        }
    } else {
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
    }

    return createGrid(canvas, spacing);
}
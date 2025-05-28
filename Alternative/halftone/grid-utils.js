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

        const size = radius * 2;
        ctx.fillStyle = '#243f00';
        ctx.fillRect(
            Math.round(dot.x - radius),
            Math.round(dot.y - radius),
            size,
            size
        );
    }
}

export function resizeCanvasAndGrid(canvas, spacing = 8) {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;

    const grid = createGrid(canvas, spacing);
    return grid;
}
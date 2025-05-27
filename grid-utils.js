export function createGrid(canvas, spacing = 8) {
    const grid = [];
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
    return grid;
}

export function drawDotGrid(ctx, grid, getRadius) {
    for (const dot of grid) {
        const radius = getRadius(dot);
        if (radius <= 0) continue;

        ctx.beginPath();
        ctx.arc(Math.round(dot.x), Math.round(dot.y), radius, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();
    }
}

export function resizeCanvasAndGrid(canvas, spacing = 8) {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;

    const grid = createGrid(canvas, spacing);
    return grid;
}
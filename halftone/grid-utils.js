export function createGrid(canvas, spacing) {
    const cols = Math.ceil(canvas.width / spacing);
    const rows = Math.ceil(canvas.height / spacing);
    const grid = [];

    for (let y = 0; y <= rows; y++) {
        const offsetX = (y & 1) ? spacing / 2 : 0;
        for (let x = 0; x <= cols; x++) {
            grid.push({ x: x * spacing + offsetX, y: y * spacing });
        }
    }

    return grid;
}

export function drawDotGrid(ctx, grid, getRadius, color = '#1c1c1c') { //#324c18
    ctx.fillStyle = color;
    for (let i = 0; i < grid.length; i++) {
        const { x, y } = grid[i];
        const r = getRadius(grid[i]);
        if (r <= 0) continue;
        ctx.beginPath();
        ctx.arc(Math.round(x), Math.round(y), r, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function resizeCanvasAndGrid(canvas, spacing) {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    return createGrid(canvas, spacing);
}

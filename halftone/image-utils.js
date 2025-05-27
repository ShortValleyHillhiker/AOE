export function getBrightnessAt(imageData, x, y, width) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const idx = (iy * width + ix) * 4;

    const [r, g, b] = imageData.data.slice(idx, idx + 3);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
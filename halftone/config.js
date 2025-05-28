function clamp(min, preferred, max) {
    return Math.max(min, Math.min(preferred, max));
}

const vw = window.innerWidth;

export const CONFIG = {
    // spacing: clamp(8, vw /  96, 32),
    // baseRadius: clamp(2.5, vw / 300, 100),
    // rippleWidth: clamp(12, vw / 54, 96),
    // rippleSpeed: clamp(10, vw / 60, 80),
    // dragCooldown: 150,
    // maxRipples: 15,
    // fadeFactor: 0.9,
    // frameRate: 12
        
    spacing: 8,
    baseRadius: 2.5,
    rippleWidth: 12,
    rippleSpeed: 10,
    dragCooldown: 50,
    maxRipples: 15,
    fadeFactor: 0.9,
    frameRate: 12
};
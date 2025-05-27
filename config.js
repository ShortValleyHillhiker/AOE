function clamp(min, preferred, max) {
    return Math.max(min, Math.min(preferred, max));
}

const vw = window.innerWidth;

export const CONFIG = {
    // spacing: clamp(8, vw / 64, 32),
    // baseRadius: clamp(2.5, vw / 640, 10),
    // rippleWidth: clamp(12, vw / 56, 48),
    // rippleSpeed: 10,
    // dragCooldown: 50,
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
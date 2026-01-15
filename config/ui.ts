export const ui = {
    glow: {
        loggedIn: {
            class: 'scale-100 opacity-100',
            style: {
                // OUTER GLOW: Vignette using Theme Glow Color
                // Tuned size: transparent until 40% (was 30%) to reduce "largeness"
                backgroundHelper: (glowColor: string) => `radial-gradient(circle at center, transparent 40%, ${glowColor}50 100%)`,
                boxShadowHelper: (glowColor: string) => `inset 0 0 100px 20px ${glowColor}20`,

                filter: 'blur(60px)',
                animation: 'pulse-glow 8s ease-in-out infinite',
                zIndex: '50',
                pointerEvents: 'none'
            }
        },
        loggedOut: {
            class: 'scale-100 opacity-30', // Minimal visibility (was 80)
            style: {
                // OUTER GLOW: Very faint cool vignette
                backgroundHelper: () => `radial-gradient(circle at center, transparent 30%, #6366F120 100%)`,
                boxShadowHelper: () => `inset 0 0 100px 20px #6366F105`, // Almost invisible shadow

                filter: 'blur(60px)',
                animation: 'none',
                zIndex: '50',
                pointerEvents: 'none'
            }
        },
        transitionDuration: '3000ms' // Smooth transition restored
    }
}

export default defineAppConfig({
    socials: {
        // instagram: {
        //     url: 'https://instagram.com/nicole',
        //     icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png'
        // },
        // twitter: {
        //     url: 'https://x.com/nicole',
        //     icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/X_logo_2023.svg/2268px-X_logo_2023.svg.png'
        // },
        email: {
            url: 'mailto:hey.itsnicolechristine@gmail.com',
            icon: 'https://cdn-icons-png.flaticon.com/512/732/732200.png'
        },
        tiktok: {
            url: 'https://tiktok.com/@its.nicole.christine',
            icon: 'https://sf-tb-sg.ibytedtos.com/obj/eden-sg/uhtyvueh7nulogpoguhm/tiktok-icon2.png'
        }
    },
    security: {
        sessionTimeoutMinutes: 1440 // 24 Hours
    },
    meta: {
        name: 'Nicole Christine',
        tagline: 'Creator & Model',
        copyright: 'Nicole Christine',
        operator: 'ILYTAT LLC'
    },
    theme: {
        active: 'default',
        themes: {
            default: {
                name: 'Electric Purple',
                colors: {
                    primary: '#D946EF', // Fuchsia 500
                    secondary: '#A855F7', // Purple 500
                    background: '#0A0118', // Deepest Violet
                    surface: '#1A0B2E', // Rich Violet Surface
                    text: '#FAF5FF', // Purple 50
                    muted: '#A78BFA', // Violet 400
                    border: '#2E1065', // Violet 950
                    success: '#4ADE80', // Green 400
                    error: '#F87171', // Red 400
                    warning: '#FACC15', // Yellow 400
                    info: '#60A5FA' // Blue 400
                }
            },
            light: {
                name: 'Rose Gold',
                colors: {
                    primary: '#E11D48', // Rose 600
                    secondary: '#DB2777', // Pink 600
                    background: '#FAFAF9', // Stone 50
                    surface: '#FFFFFF', // White
                    text: '#1C1917', // Stone 900
                    muted: '#78716C', // Stone 500
                    border: '#E7E5E4', // Stone 200
                    success: '#15803D', // Green 700
                    error: '#BE123C', // Rose 700
                    warning: '#B45309', // Amber 700
                    info: '#1D4ED8' // Blue 700
                }
            },
            midnight: {
                name: 'True Midnight',
                colors: {
                    primary: '#38BDF8', // Sky 400
                    secondary: '#6366F1', // Indigo 500
                    background: '#000000', // True Black
                    surface: '#121212', // Material Dark
                    text: '#F8FAFC', // Slate 50
                    muted: '#94A3B8', // Slate 400
                    border: '#1E293B', // Slate 800
                    success: '#22C55E', // Green 500
                    error: '#EF4444', // Red 500
                    warning: '#EAB308', // Yellow 500
                    info: '#3B82F6' // Blue 500
                }
            }
        }
    }
})

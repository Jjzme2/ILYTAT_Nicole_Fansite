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
                name: 'Neon Dark',
                colors: {
                    primary: '#D946EF', // Fuchsia 500
                    secondary: '#8B5CF6', // Violet 500
                    background: '#0F172A', // Slate 900
                    surface: '#1E293B', // Slate 800
                    text: '#F8FAFC', // Slate 50
                    muted: '#94A3B8', // Slate 400
                    border: '#334155' // Slate 700
                }
            },
            light: {
                name: 'Soft Light',
                colors: {
                    primary: '#EC4899', // Pink 500
                    secondary: '#8B5CF6', // Violet 500
                    background: '#ffffff', // White
                    surface: '#F8FAFC', // Slate 50
                    text: '#0F172A', // Slate 900
                    muted: '#64748B', // Slate 500
                    border: '#E2E8F0' // Slate 200
                }
            },
            midnight: {
                name: 'Midnight Blue',
                colors: {
                    primary: '#38BDF8', // Sky 400
                    secondary: '#818CF8', // Indigo 400
                    background: '#020617', // Slate 950
                    surface: '#0F172A', // Slate 900
                    text: '#F8FAFC', // Slate 50
                    muted: '#64748B', // Slate 500
                    border: '#1E293B' // Slate 800
                }
            }
        }
    }
})

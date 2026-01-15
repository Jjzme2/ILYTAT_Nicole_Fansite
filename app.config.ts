import {
    themes
    , ui
    , socials
    , quickLaunch
    , meta
    , security
    , hoverMessages
} from './config'

export default defineAppConfig({
    socials,
    security,
    meta,
    hoverMessages,
    theme: {
        active: 'default',
        themes: themes
    },
    ui,
    quickLaunch
})

import {
    themes
    , ui
    , socials
    , adminLinks
    , creatorLinks
    , meta
    , metaDom
    , security
    , hoverMessages
    , messaging
} from './config'

export default defineAppConfig({
    socials,
    security,
    meta,
    metaDom,
    messaging,
    hoverMessages,
    theme: {
        active: 'default',
        themes: themes
    },
    ui,
    adminLinks,
    creatorLinks
})


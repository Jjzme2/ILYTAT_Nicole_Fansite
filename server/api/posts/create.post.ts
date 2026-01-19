


export default defineEventHandler(async (event) => {
    // 1. Verify Auth (User must be Admin or Creator)
    const user = await getUserFromEvent(event)

    if (user.role !== 'admin' && user.role !== 'creator') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: functionality restricted to admins and creators.'
        })
    }

    const body = await readBody(event)
    const { db } = useFirebaseAdmin()

    // 2. Create the Document
    const docRef = await db.collection('posts').add({
        title: body.title,
        storageKey: body.storageKey, // The R2 Key
        mediaType: body.mediaType,   // 'image' or 'audio'
        isExclusive: true,
        createdAt: new Date(),
        createdBy: user.uid, // Good practice to track who created it
        authorEmail: user.email
        // Add any other metadata (e.g. description, tags)
    })

    return { id: docRef.id, success: true }
})

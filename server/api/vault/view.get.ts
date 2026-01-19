import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'


export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const key = query.key as string
    const postId = query.postId as string

    // 1. Check if public access is allowed via Post ID
    let isAuthorized = false

    if (postId) {
        try {
            const { db } = useFirebaseAdmin()
            const postSnap = await db.collection('posts').doc(postId).get()
            if (postSnap.exists) {
                const postData = postSnap.data()
                // If post is free and keys match
                if (postData?.isFree && postData?.storageKey === key) {
                    isAuthorized = true
                }
            }
        } catch (e) {
            console.error('Error checking public post access:', e)
        }
    }

    // 2. If not public/free, enforce User Auth (Subscriber/Admin/Creator)
    if (!isAuthorized) {
        try {
            const user = await getUserFromEvent(event)
            if (!user.isSubscriber && user.role !== 'admin' && user.role !== 'creator') {
                throw createError({ statusCode: 403, message: 'Forbidden: Restricted to subscribers.' })
            }
        } catch (e) {
            throw createError({ statusCode: 403, message: 'Forbidden: Authentication required.' })
        }
    }



    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key as string
    })

    // Generate a URL valid for 1 hour (3600 seconds)
    // After 1 hour, this link stops working. Perfect for preventing leaks.
    const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

    return { url }
})
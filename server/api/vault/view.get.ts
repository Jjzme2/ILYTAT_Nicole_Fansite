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

    if (!isAuthorized) {
        try {
            const user: any = await getUserFromEvent(event)
            // Allow if subscriber OR if has privileged role (admin, creator, developer)
            // Checks both legacy 'role' string and new 'roles' array
            const allowedRoles = ['admin', 'creator', 'developer']
            const hasPrivilege = allowedRoles.includes(user.role) || (user.roles && Array.isArray(user.roles) && user.roles.some((r: any) => allowedRoles.includes(r)))

            if (!user.isSubscriber && !hasPrivilege) {
                throw createError({ statusCode: 403, message: 'Forbidden: Restricted access.' })
            }
        } catch (e: any) {
            // Differentiate between Auth failure vs Permission failure
            if (e.statusCode === 403) throw e
            throw createError({ statusCode: 401, message: 'Unauthorized: Authentication required.' })
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
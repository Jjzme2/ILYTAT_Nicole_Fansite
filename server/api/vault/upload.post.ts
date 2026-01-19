import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'


export default defineEventHandler(async (event) => {
    const user = await getUserFromEvent(event)

    // Only allow admins and creators to upload
    if (user.role !== 'admin' && user.role !== 'creator') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden: functionality restricted to admins and creators.'
        })
    }

    const body = await readBody(event)
    const fileExt = body.filename.split('.').pop()
    const key = `${uuidv4()}.${fileExt}` // Unique ID

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: body.contentType,
    })

    // Generate a URL valid for 60 seconds to upload the file
    const url = await getSignedUrl(r2Client, command, { expiresIn: 60 })

    return { uploadUrl: url, key: key }
})
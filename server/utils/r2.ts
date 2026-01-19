import { S3Client } from '@aws-sdk/client-s3'

const config = useRuntimeConfig()

// 1. Initialize the Client once
export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: config.r2.accessKeyId,
        secretAccessKey: config.r2.secretAccessKey,
    },
})

// 2. Export the bucket name for easy access
export const bucketName = config.r2.bucketName
// Delete audio file from R2
export const runtime = 'node'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check if credentials are available
  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    throw createError({
      statusCode: 500,
      message: 'R2 credentials not configured',
    })
  }

  try {
    const query = getQuery(event)
    const fileKey = query.key as string

    if (!fileKey) {
      throw createError({
        statusCode: 400,
        message: 'File key is required',
      })
    }

    // Import AWS SDK
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3')

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: config.r2Endpoint as string,
      credentials: {
        accessKeyId: config.r2AccessKeyId as string,
        secretAccessKey: config.r2SecretAccessKey as string,
      },
    })

    // Delete from R2
    const command = new DeleteObjectCommand({
      Bucket: config.r2BucketName as string,
      Key: fileKey,
    })

    await s3Client.send(command)

    return {
      success: true,
      message: 'File deleted from R2',
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Delete failed',
    })
  }
})



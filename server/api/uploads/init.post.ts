// Initialize upload and get presigned URL for R2
export const runtime = 'node'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check credentials
  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    throw createError({
      statusCode: 500,
      message: 'R2 credentials not configured',
    })
  }

  try {
    const body = await readBody(event)
    const { fileName, fileSize, contentType, trackId, name, description, version, durationSeconds } = body

    if (!fileName || !fileSize || !trackId) {
      throw createError({
        statusCode: 400,
        message: 'fileName, fileSize, and trackId are required',
      })
    }

    // Generate unique file key
    const fileExtension = fileName.split('.').pop() || 'mp3'
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileKey = `audio/${trackId}/${timestamp}-${randomString}.${fileExtension}`

    // Import AWS SDK
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: config.r2Endpoint as string,
      credentials: {
        accessKeyId: config.r2AccessKeyId as string,
        secretAccessKey: config.r2SecretAccessKey as string,
      },
    })

    // Create presigned URL (valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: config.r2BucketName as string,
      Key: fileKey,
      ContentType: contentType || 'audio/mpeg',
    })

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

    // Generate public URL
    const publicUrl = `${config.r2PublicUrl}/${fileKey}`

    return {
      success: true,
      uploadUrl: presignedUrl,
      fileKey,
      fileUrl: publicUrl,
      fileName,
      trackId,
      metadata: {
        name: name || fileName,
        description: description || null,
        version: version || null,
        durationSeconds: durationSeconds || null,
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to initialize upload',
    })
  }
})


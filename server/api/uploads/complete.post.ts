// Complete upload and save metadata to database
export const runtime = 'node'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    const body = await readBody(event)
    const { fileKey, fileUrl, fileName, trackId, metadata } = body

    if (!fileKey || !fileUrl || !trackId) {
      throw createError({
        statusCode: 400,
        message: 'fileKey, fileUrl, and trackId are required',
      })
    }

    // Verify file exists in R2 (optional but recommended)
    try {
      const { S3Client, HeadObjectCommand } = await import('@aws-sdk/client-s3')
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: config.r2Endpoint as string,
        credentials: {
          accessKeyId: config.r2AccessKeyId as string,
          secretAccessKey: config.r2SecretAccessKey as string,
        },
      })

      const command = new HeadObjectCommand({
        Bucket: config.r2BucketName as string,
        Key: fileKey,
      })

      const headResult = await s3Client.send(command)
      const fileSize = headResult.ContentLength || 0

      // Generate slug from filename
      const slug = fileName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Extract format from extension
      const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''
      const format = fileExtension === 'mp3' ? 'MP3' : fileExtension.toUpperCase()

      return {
        success: true,
        fileUrl,
        fileKey,
        fileName,
        slug: slug || `audio-${Date.now()}`,
        size: fileSize,
        type: headResult.ContentType || 'audio/mpeg',
        trackId,
        name: metadata?.name || fileName,
        description: metadata?.description || null,
        version: metadata?.version || null,
        duration_seconds: metadata?.durationSeconds || null,
        format,
        bitrate: null,
        sample_rate: null,
        file_size_bytes: fileSize,
      }
    } catch (r2Error: any) {
      // File doesn't exist or error checking
      throw createError({
        statusCode: 404,
        message: 'File not found in R2. Upload may have failed.',
      })
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to complete upload',
    })
  }
})


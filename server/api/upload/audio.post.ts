// Upload audio file to R2
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
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'No file provided',
      })
    }

    // Find file and metadata in form data
    let file: File | null = null
    let trackId: string | null = null
    let name: string | null = null
    let description: string | null = null

    for (const part of formData) {
      if (part.name === 'file' && part.filename) {
        file = new File([part.data], part.filename, { type: part.type || 'audio/mpeg' })
      } else if (part.name === 'track_id') {
        trackId = part.data.toString('utf-8')
      } else if (part.name === 'name') {
        name = part.data.toString('utf-8')
      } else if (part.name === 'description') {
        description = part.data.toString('utf-8')
      }
    }

    if (!file) {
      throw createError({
        statusCode: 400,
        message: 'No file provided',
      })
    }

    if (!trackId) {
      throw createError({
        statusCode: 400,
        message: 'track_id is required',
      })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'mp3'
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${trackId}/${timestamp}-${randomString}.${fileExtension}`
    const fileKey = `audio/${fileName}`

    // Import AWS SDK
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: config.r2Endpoint as string,
      credentials: {
        accessKeyId: config.r2AccessKeyId as string,
        secretAccessKey: config.r2SecretAccessKey as string,
      },
    })

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: config.r2BucketName as string,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type || 'audio/mpeg',
    })

    await s3Client.send(command)

    // Generate public URL
    const publicUrl = `${config.r2PublicUrl}/${fileKey}`

    // Generate slug from filename
    const slug = file.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return {
      success: true,
      fileUrl: publicUrl,
      fileKey,
      fileName: file.name,
      slug: slug || `audio-${timestamp}`,
      size: file.size,
      type: file.type,
      trackId,
      name: name || file.name,
      description: description || null,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Upload failed',
    })
  }
})


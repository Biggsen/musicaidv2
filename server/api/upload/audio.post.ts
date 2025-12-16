// Upload audio file to R2
export const runtime = 'node'

export default defineEventHandler(async (event) => {
  // #region agent log
  console.log('[UPLOAD_DEBUG] Function entry', JSON.stringify({location:'audio.post.ts:4',message:'Function entry',data:{hasEvent:!!event},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}));
  // #endregion
  const config = useRuntimeConfig()

  // Check if credentials are available
  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    // #region agent log
    console.log('[UPLOAD_DEBUG] R2 credentials missing', JSON.stringify({location:'audio.post.ts:12',message:'R2 credentials missing',data:{hasAccountId:!!config.r2AccountId,hasAccessKey:!!config.r2AccessKeyId,hasSecret:!!config.r2SecretAccessKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'}));
    // #endregion
    throw createError({
      statusCode: 500,
      message: 'R2 credentials not configured',
    })
  }

  try {
    // Parse multipart form data
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before form data parse', JSON.stringify({location:'audio.post.ts:22',message:'Before form data parse',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}));
    // #endregion
    const formData = await readMultipartFormData(event)
    // #region agent log
    console.log('[UPLOAD_DEBUG] Form data parsed', JSON.stringify({location:'audio.post.ts:25',message:'Form data parsed',data:{formDataLength:formData?.length||0,hasFormData:!!formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}));
    // #endregion
    if (!formData || formData.length === 0) {
      // #region agent log
      console.log('[UPLOAD_DEBUG] No form data error', JSON.stringify({location:'audio.post.ts:28',message:'No form data error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}));
      // #endregion
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
    let version: string | null = null
    let durationSeconds: number | null = null

    for (const part of formData) {
      if (part.name === 'file' && part.filename) {
        // #region agent log
        console.log('[UPLOAD_DEBUG] Creating file object', JSON.stringify({location:'audio.post.ts:45',message:'Creating file object',data:{filename:part.filename,dataLength:part.data?.length||0,type:part.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}));
        // #endregion
        file = new File([new Uint8Array(part.data)], part.filename, { type: part.type || 'audio/mpeg' })
        // #region agent log
        console.log('[UPLOAD_DEBUG] File object created', JSON.stringify({location:'audio.post.ts:47',message:'File object created',data:{fileName:file.name,fileSize:file.size,fileType:file.type},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}));
        // #endregion
      } else if (part.name === 'track_id') {
        trackId = part.data.toString('utf-8')
      } else if (part.name === 'name') {
        name = part.data.toString('utf-8')
      } else if (part.name === 'description') {
        description = part.data.toString('utf-8')
      } else if (part.name === 'version') {
        version = part.data.toString('utf-8')
      } else if (part.name === 'duration_seconds') {
        const durationStr = part.data.toString('utf-8')
        const durationNum = parseInt(durationStr, 10)
        if (!isNaN(durationNum) && durationNum > 0) {
          durationSeconds = durationNum
        }
      }
    }
    // #region agent log
    console.log('[UPLOAD_DEBUG] Form data extraction complete', JSON.stringify({location:'audio.post.ts:61',message:'Form data extraction complete',data:{hasFile:!!file,hasTrackId:!!trackId,fileSize:file?.size||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'}));
    // #endregion

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
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before AWS SDK import', JSON.stringify({location:'audio.post.ts:84',message:'Before AWS SDK import',data:{fileKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3')

    // Create S3 client for R2
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before S3 client creation', JSON.stringify({location:'audio.post.ts:88',message:'Before S3 client creation',data:{hasEndpoint:!!config.r2Endpoint,hasBucket:!!config.r2BucketName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: config.r2Endpoint as string,
      credentials: {
        accessKeyId: config.r2AccessKeyId as string,
        secretAccessKey: config.r2SecretAccessKey as string,
      },
    })
    // #region agent log
    console.log('[UPLOAD_DEBUG] S3 client created', JSON.stringify({location:'audio.post.ts:97',message:'S3 client created',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion

    // Convert file to buffer
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before file buffer conversion', JSON.stringify({location:'audio.post.ts:100',message:'Before file buffer conversion',data:{fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    // #region agent log
    console.log('[UPLOAD_DEBUG] File buffer created', JSON.stringify({location:'audio.post.ts:103',message:'File buffer created',data:{bufferLength:fileBuffer.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: config.r2BucketName as string,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: file.type || 'audio/mpeg',
    })
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before R2 upload', JSON.stringify({location:'audio.post.ts:110',message:'Before R2 upload',data:{bucket:config.r2BucketName,key:fileKey,bodySize:fileBuffer.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion
    await s3Client.send(command)
    // #region agent log
    console.log('[UPLOAD_DEBUG] R2 upload completed', JSON.stringify({location:'audio.post.ts:113',message:'R2 upload completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'}));
    // #endregion

    // Generate public URL
    const publicUrl = `${config.r2PublicUrl}/${fileKey}`

    // Generate slug from filename
    const slug = file.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Extract audio metadata
    let audioMetadata: {
      duration_seconds: number | null
      format: string | null
      bitrate: number | null
      sample_rate: number | null
    } = {
      duration_seconds: durationSeconds, // Use duration from client if provided
      format: null,
      bitrate: null,
      sample_rate: null,
    }

    try {
      // Extract basic info from file
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
      audioMetadata.format = fileExtension === 'mp3' ? 'MP3' : fileExtension.toUpperCase()
      
      // File size is available
      // Duration is extracted client-side and passed here
      // Bitrate and sample_rate would require audio processing library (e.g., music-metadata)
      // For now, we'll leave them as null - can be extracted later
    } catch (err) {
      // Metadata extraction failed, continue without it
      console.warn('Failed to extract audio metadata:', err)
    }

    // #region agent log
    console.log('[UPLOAD_DEBUG] Before response object creation', JSON.stringify({location:'audio.post.ts:145',message:'Before response object creation',data:{publicUrl,fileKey,fileName:file.name,fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}));
    // #endregion
    const responseObj = {
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
      version: version || null,
      duration_seconds: audioMetadata.duration_seconds,
      format: audioMetadata.format,
      bitrate: audioMetadata.bitrate,
      sample_rate: audioMetadata.sample_rate,
      file_size_bytes: file.size,
    }
    // #region agent log
    console.log('[UPLOAD_DEBUG] Response object created', JSON.stringify({location:'audio.post.ts:166',message:'Response object created',data:{responseKeys:Object.keys(responseObj),responseSize:JSON.stringify(responseObj).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}));
    // #endregion
    // #region agent log
    try{JSON.stringify(responseObj);console.log('[UPLOAD_DEBUG] Response serialization test passed', JSON.stringify({location:'audio.post.ts:168',message:'Response serialization test passed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}));}catch(e){console.log('[UPLOAD_DEBUG] Response serialization test FAILED', JSON.stringify({location:'audio.post.ts:168',message:'Response serialization test FAILED',data:{error:String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}));}
    // #endregion
    // #region agent log
    console.log('[UPLOAD_DEBUG] Before return statement', JSON.stringify({location:'audio.post.ts:170',message:'Before return statement',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'}));
    // #endregion
    return responseObj
  } catch (error: any) {
    // #region agent log
    console.log('[UPLOAD_DEBUG] Error caught', JSON.stringify({location:'audio.post.ts:175',message:'Error caught',data:{errorMessage:error?.message||'unknown',errorName:error?.name||'unknown',statusCode:error?.statusCode||500,stack:error?.stack?.substring(0,200)||''},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'}));
    // #endregion
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Upload failed',
    })
  }
})


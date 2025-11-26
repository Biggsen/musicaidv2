// Test endpoint to verify R2 connection
export const runtime = 'node'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Check if credentials are available
  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    return {
      success: false,
      error: 'R2 credentials not configured',
      hasAccountId: !!config.r2AccountId,
      hasAccessKey: !!config.r2AccessKeyId,
      hasSecretKey: !!config.r2SecretAccessKey,
    }
  }

  try {
    // Import AWS SDK
    const { S3Client, HeadBucketCommand } = await import('@aws-sdk/client-s3')

    // Create S3 client for R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: config.r2Endpoint as string,
      credentials: {
        accessKeyId: config.r2AccessKeyId as string,
        secretAccessKey: config.r2SecretAccessKey as string,
      },
    })

    // Try to access the specific bucket (instead of listing all buckets)
    // This works with bucket-specific permissions
    const command = new HeadBucketCommand({
      Bucket: config.r2BucketName as string,
    })
    await s3Client.send(command)

    return {
      success: true,
      message: 'R2 connection successful',
      bucket: config.r2BucketName,
      endpoint: config.r2Endpoint,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.constructor?.name || 'Unknown',
      errorCode: error.Code || error.$metadata?.httpStatusCode || 'Unknown',
      bucket: config.r2BucketName,
      endpoint: config.r2Endpoint,
    }
  }
})


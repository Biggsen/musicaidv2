export default defineEventHandler(async event => {
  return {
    success: true,
    message: 'MusicAid API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }
})

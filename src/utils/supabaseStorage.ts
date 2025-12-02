import { supabase } from './supabaseClient'

// export interface UploadResult {
//   publicUrl: string
//   path: string
// }

// export async function uploadFile(bucket: string, file: File, folder?: string): Promise<UploadResult> {
//   const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${file.name}`

//   // Upload file
//   const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
//   if (error || !data) {
//     console.error('Upload file failed:', error)
//     throw error || new Error('Upload failed: no data returned')
//   }

//   // Lấy publicUrl
//   const { data: urlData, error: urlError } = supabase.storage.from(bucket).getPublicUrl(data.path)

//   console.log('urlData', urlData)

//   if (urlError || !urlData) {
//     console.error('Get public URL failed:', urlError)
//     throw urlError || new Error('Get public URL failed')
//   }

//   console.log('Uploaded file data:', data)

//   return { publicUrl: urlData.publicUrl, path: data.path }
// }

export interface UploadResult {
  publicUrl: string
  path: string
}

export async function uploadFile(bucket: string, file: File, folder?: string): Promise<UploadResult> {
  const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${file.name}`

  // Upload file
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
  if (error || !data) {
    console.error('Upload file failed:', error)
    throw error || new Error('Upload failed: no data returned')
  }

  // Lấy publicUrl
  const urlResponse = supabase.storage.from(bucket).getPublicUrl(data.path)
  const publicUrl = urlResponse.data.publicUrl

  if (!publicUrl) {
    console.error('Get public URL failed')
    throw new Error('Get public URL failed')
  }

  console.log('Uploaded file data:', data)
  console.log('Public URL:', publicUrl)

  return { publicUrl, path: data.path }
}

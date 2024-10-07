import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/utils/supabase-admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function storeImage(imageUrl: string, prompt: string, userId: string) {
  const { data, error } = await supabaseAdmin
    .from('generated_images')
    .insert([
      { user_id: userId, image_url: imageUrl, prompt: prompt }
    ])

  if (error) {
    console.error('Error storing image:', error)
    throw error
  }

  return data
}

export async function getImages(userId?: string) {
  let query = supabase.from('generated_images').select('*')
  
  if (userId) {
    query = query.eq('user_id', userId)
  }
  
  const { data, error } = await query.order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching images:', error)
    return []
  }
  
  return data
}

export async function uploadImage(file: File, userId: string) {
  const { data, error } = await supabase.storage
    .from('generated-images')
    .upload(`${userId}/${Date.now()}.png`, file, {
      contentType: 'image/png'
    })

  if (error) {
    console.error('Error uploading image:', error)
    throw error
  }

  return data
}

export function getPublicUrl(path: string) {
  const { data } = supabase.storage
    .from('generated-images')
    .getPublicUrl(path)

  return data.publicUrl
}
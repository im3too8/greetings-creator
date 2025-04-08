import { supabase } from './supabaseClient'

export const uploadTemplateImage = async (file: File) => {
  const filePath = `template-images/${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('templates')
    .upload(filePath, file)

  if (error) throw error

  const { publicUrl } = supabase.storage
    .from('templates')
    .getPublicUrl(filePath)

  return publicUrl
}

export const uploadFontFile = async (file: File) => {
  const filePath = `fonts/${Date.now()}_${file.name}`
  const { error } = await supabase.storage
    .from('templates')
    .upload(filePath, file)

  if (error) throw error

  const { publicUrl } = supabase.storage
    .from('templates')
    .getPublicUrl(filePath)

  return publicUrl
}

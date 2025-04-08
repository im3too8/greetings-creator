import { supabase } from './supabaseClient'

export type TextAreaData = {
  id: string
  content: string
  x: number
  y: number
  width: number
  height: number
  fontFamily: string
  fontSize: number
  color: string
  alignment: 'left' | 'center' | 'right'
  direction: 'ltr' | 'rtl'
}

export type TemplateData = {
  name: string
  image_url: string
  image_width: number
  image_height: number
  font_url?: string
  text_areas: TextAreaData[]
}

export const saveTemplate = async (template: TemplateData) => {
  const { data, error } = await supabase
    .from('templates')
    .insert([template])

  if (error) throw error
  return data
}

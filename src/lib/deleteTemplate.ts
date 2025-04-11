import { supabase } from './supabaseClient'

export const deleteTemplate = async (templateId: string) => {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
}

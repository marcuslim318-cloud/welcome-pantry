import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = url && key ? createClient(url, key) : null

export type ActivityState = {
  title: string
  theme: string
  groupCount: number
  groupSize: number
  names: string[]
  leaders: string[]
  together: string[][]
  apart: string[][]
  groups: string[][]
  status: 'draft' | 'drawing' | 'done'
}

export async function saveActivity(slug: string, state: ActivityState) {
  if (!supabase) return
  await supabase.from('activities').upsert({ slug, state, updated_at: new Date().toISOString() })
}

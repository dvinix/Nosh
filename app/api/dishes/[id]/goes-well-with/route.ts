import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getFrequentlyOrderedTogether } from '@/lib/recommendations'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params
  const dishes = await getFrequentlyOrderedTogether(supabase, id)
  return NextResponse.json(dishes)
}

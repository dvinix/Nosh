import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BudgetPlannerClient } from '@/components/budget-planner-client'

export const revalidate = 0

export default async function BudgetPlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <BudgetPlannerClient />
}

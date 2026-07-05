import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DietPlannerClient } from '@/components/diet-planner-client'

export const revalidate = 0

export default async function PlannerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if there is an existing plan for this week (last 7 days)
  const { data: existingPlans } = await supabase
    .from('diet_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)

  const activePlan = existingPlans?.[0]

  return <DietPlannerClient initialPlan={activePlan} />
}

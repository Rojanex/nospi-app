import { strings } from '@/constants/strings'
import { buildPlanInsert, isNewPlanFormValid } from '@/lib/plans/newPlanForm'
import { notifyPlanCreated } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import { ApiResponse, NewPlanFormValues } from '@/types'
import { PostgrestError } from '@supabase/supabase-js'

function mapCreatePlanError(error: PostgrestError): string {
  const message = error.message.toLowerCase()
  if (
    message.includes('enforce_create_limit') ||
    message.includes('create limit') ||
    message.includes('límite') ||
    message.includes('limit')
  ) {
    return strings.newPlan.createErrorLimit
  }
  return strings.newPlan.createErrorGeneric
}

export async function createPlan(
  form: NewPlanFormValues,
): Promise<ApiResponse<{ id: string }>> {
  const { data: authData } = await supabase.auth.getUser()
  const user = authData.user

  if (!user) {
    return { data: null, error: strings.newPlan.createErrorAuth }
  }

  if (!isNewPlanFormValid(form)) {
    return { data: null, error: strings.newPlan.createErrorValidation }
  }

  const payload = buildPlanInsert(form, user.id)

  const { data, error } = await supabase
    .from('plans')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    console.error('[createPlan]', error)
    return { data: null, error: mapCreatePlanError(error) }
  }

  notifyPlanCreated()
  return { data: { id: data.id }, error: null }
}

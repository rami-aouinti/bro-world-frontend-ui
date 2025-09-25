import type { ComputedRef } from 'vue'
import { inject, provide } from 'vue'

export interface FormFieldControlContext {
  id: ComputedRef<string>
  ariaLabelledby: ComputedRef<string | undefined>
  ariaDescribedby: ComputedRef<string | undefined>
  required: ComputedRef<boolean>
  error: ComputedRef<boolean>
}

const FORM_FIELD_SYMBOL = Symbol('FormFieldContext')

export function provideFormField(context: FormFieldControlContext) {
  provide(FORM_FIELD_SYMBOL, context)
}

export function useFormField(): FormFieldControlContext | null {
  return inject<FormFieldControlContext | null>(FORM_FIELD_SYMBOL, null)
}

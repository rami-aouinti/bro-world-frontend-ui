import { z } from 'zod'

function trimmedString() {
  return z.string().trim()
}

const contactSchema = z
  .object({
    name: trimmedString().min(1, 'required'),
    email: trimmedString().min(1, 'required').email('email'),
    subject: trimmedString().min(1, 'required'),
    message: trimmedString().min(1, 'required'),
  })
  .superRefine((data, ctx) => {
    if (data.message.length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'minMessage',
        path: ['message'],
      })
    }
  })

export type ContactFormValues = z.input<typeof contactSchema>
export type ContactValidationKey = 'required' | 'email' | 'minMessage'
export type ContactValidationErrors = Record<
  keyof ContactFormValues,
  ContactValidationKey | null
>

export function validateContactForm(
  values: ContactFormValues,
): { valid: boolean; errors: ContactValidationErrors } {
  const initialErrors: ContactValidationErrors = {
    name: null,
    email: null,
    subject: null,
    message: null,
  }

  const result = contactSchema.safeParse(values)

  if (result.success) {
    return { valid: true, errors: initialErrors }
  }

  const errors = { ...initialErrors }

  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ContactValidationErrors | undefined

    if (!field || errors[field]) continue

    errors[field] = (issue.message ?? 'required') as ContactValidationKey
  }

  return { valid: false, errors }
}

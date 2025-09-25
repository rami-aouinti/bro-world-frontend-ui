import { describe, expect, it } from 'vitest'

import { validateContactForm } from '~/lib/contact/validation'

describe('validateContactForm', () => {
  it('returns no errors for a valid submission', () => {
    const { valid, errors } = validateContactForm({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Collaboration',
      message: 'I would love to collaborate on the next release.',
    })

    expect(valid).toBe(true)
    expect(Object.values(errors).every((value) => value === null)).toBe(true)
  })

  it('validates required fields', () => {
    const { valid, errors } = validateContactForm({
      name: '',
      email: '',
      subject: '',
      message: '',
    })

    expect(valid).toBe(false)
    expect(errors.name).toBe('required')
    expect(errors.email).toBe('required')
    expect(errors.subject).toBe('required')
    expect(errors.message).toBe('required')
  })

  it('validates email format and message length', () => {
    const { valid, errors } = validateContactForm({
      name: 'Test User',
      email: 'invalid-email',
      subject: 'Feedback',
      message: 'Too short',
    })

    expect(valid).toBe(false)
    expect(errors.email).toBe('email')
    expect(errors.message).toBe('minMessage')
  })

  it('trims values before validation', () => {
    const { valid, errors } = validateContactForm({
      name: '   Grace   ',
      email: '  grace@example.com  ',
      subject: '  Hello  ',
      message: '   This message has enough characters.   ',
    })

    expect(valid).toBe(true)
    expect(Object.values(errors).every((value) => value === null)).toBe(true)
  })
})

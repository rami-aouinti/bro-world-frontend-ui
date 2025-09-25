import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from '../BaseInput.vue'
import FormField from '../FormField.vue'

describe('BaseInput', () => {
  it('emits update:modelValue and input when user types', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        modelValue: '',
      },
    })

    const input = wrapper.get('input')
    await input.setValue('hello')

    expect(wrapper.emitted()['update:modelValue']).toBeTruthy()
    expect(wrapper.emitted()['update:modelValue']?.[0]).toEqual(['hello'])
    expect(wrapper.emitted().input?.[0]).toEqual(['hello'])
  })

  it('links describedby to form field errors', async () => {
    const wrapper = mount({
      components: { BaseInput, FormField },
      template: `
        <FormField label="Email" :error="true" :error-messages="['Required']">
          <BaseInput model-value="" />
        </FormField>
      `,
    })

    const input = wrapper.get('input')
    const describedBy = input.attributes('aria-describedby')

    expect(describedBy).toBeTruthy()
    const errorElement = wrapper.find('[id$="-error"]')
    expect(errorElement.exists()).toBe(true)
    if (describedBy) {
      expect(describedBy).toContain(errorElement.attributes('id'))
    }
  })
})

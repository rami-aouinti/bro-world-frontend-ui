import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseModal from '../BaseModal.vue'
import BaseButton from '../BaseButton.vue'

describe('BaseModal', () => {
  it('emits update:modelValue=false and close when Close button is clicked', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
        title: 'Edit item',
      },
    })

    const buttons = wrapper.findAllComponents(BaseButton)
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    await buttons[0].trigger('click')

    expect(wrapper.emitted()['update:modelValue']).toBeTruthy()
    expect(wrapper.emitted()['update:modelValue']?.[0]).toEqual([false])
    expect(wrapper.emitted().close?.[0]).toEqual([])
  })

  it('emits primary when the primary button is clicked', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
        primaryLabel: 'Update',
      },
    })

    const buttons = wrapper.findAllComponents(BaseButton)
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    const primaryButton = buttons[1]
    await primaryButton.trigger('click')

    expect(wrapper.emitted().primary).toBeTruthy()
    expect(primaryButton.text()).toContain('Update')
  })

  it('closes on escape keypress', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
      },
    })

    const dialog = wrapper.findComponent({ name: 'VDialog' })
    await dialog.trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted()['update:modelValue']).toBeTruthy()
    expect(wrapper.emitted()['update:modelValue']?.[0]).toEqual([false])
    expect(wrapper.emitted().close?.[0]).toEqual([])
  })

  it('sets aria-labelledby when a title is provided', async () => {
    const wrapper = mount(BaseModal, {
      props: {
        modelValue: true,
        title: 'Create post',
      },
    })

    await nextTick()

    const labelledby = wrapper.attributes('aria-labelledby')
    expect(labelledby).toBeTruthy()

    if (labelledby) {
      const heading = document.getElementById(labelledby)
      expect(heading?.textContent).toContain('Create post')
    }
  })
})

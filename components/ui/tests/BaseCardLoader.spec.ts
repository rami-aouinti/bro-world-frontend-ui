import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCardLoader from '../BaseCardLoader.vue'

describe('BaseCardLoader', () => {
  it('exposes an accessible status role', () => {
    const wrapper = mount(BaseCardLoader)

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.attributes('data-variant')).toBe('basic')
    expect(wrapper.find('[data-test="loader-basic"]').exists()).toBe(true)
  })

  it('renders profile variant skeleton', () => {
    const wrapper = mount(BaseCardLoader, {
      props: {
        variant: 'profile',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('profile')
    expect(wrapper.find('[data-test="loader-profile"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="profile-avatar"]').exists()).toBe(true)
  })

  it('renders media variant skeleton', () => {
    const wrapper = mount(BaseCardLoader, {
      props: {
        variant: 'media',
      },
    })

    expect(wrapper.find('[data-test="loader-media"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="media-cover"]').exists()).toBe(true)
  })

  it('supports layout props for padding and rounding', () => {
    const wrapper = mount(BaseCardLoader, {
      props: {
        padding: 'lg',
        rounded: 'md',
        ariaLabel: 'Chargement',
      },
    })

    expect(wrapper.classes()).toContain('p-8')
    expect(wrapper.classes()).toContain('rounded-2xl')
    expect(wrapper.attributes('aria-label')).toBe('Chargement')
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '../BaseCard.vue'

describe('BaseCard', () => {
  it('renders optional slot sections when provided', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        media: '<div class="media-slot" />',
        header: '<div>Header</div>',
        default: '<p>Body content</p>',
        footer: '<span>Footer</span>',
      },
    })

    expect(wrapper.find('[data-test="base-card-media"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="base-card-header"]').text()).toContain('Header')
    expect(wrapper.find('[data-test="base-card-body"]').text()).toContain('Body content')
    expect(wrapper.find('[data-test="base-card-footer"]').text()).toContain('Footer')
  })

  it('applies gradient variant and hoverable classes', () => {
    const wrapper = mount(BaseCard, {
      props: {
        variant: 'gradient',
        hoverable: true,
      },
      slots: {
        default: 'Content',
      },
    })

    expect(wrapper.attributes('data-variant')).toBe('gradient')
    expect(wrapper.classes()).toContain('bg-gradient-to-br')
    expect(wrapper.classes()).toContain('hover:-translate-y-1')
  })

  it('supports custom root element and merges attributes', () => {
    const wrapper = mount(BaseCard, {
      props: {
        as: 'section',
        padding: 'lg',
        spacing: 'lg',
        footerDivider: false,
      },
      attrs: {
        id: 'custom-card',
        class: 'custom-card',
      },
      slots: {
        default: 'Section content',
        footer: '<span data-test="footer">Footer</span>',
      },
    })

    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.attributes('id')).toBe('custom-card')
    expect(wrapper.classes()).toContain('custom-card')
    expect(wrapper.classes()).toContain('p-8')
    const footer = wrapper.find('[data-test="base-card-footer"]')
    expect(footer.classes()).not.toContain('border-t')
    expect(footer.find('[data-test="footer"]').exists()).toBe(true)
  })
})

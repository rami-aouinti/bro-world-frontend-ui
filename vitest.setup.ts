import { config } from '@vue/test-utils'
import { Teleport, defineComponent, h } from 'vue'
import { createVuetify } from 'vuetify'
import * as vuetifyComponents from 'vuetify/components'
import * as vuetifyDirectives from 'vuetify/directives'
import 'vuetify/styles'

const vuetify = createVuetify({
  components: vuetifyComponents,
  directives: vuetifyDirectives,
})

config.global.plugins = config.global.plugins ?? []
config.global.plugins.push(vuetify)

config.global.stubs = {
  transition: false,
  'transition-group': false,
  VDialog: defineComponent({
    name: 'VDialog',
    inheritAttrs: false,
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, slots }) {
      return () => {
        if (!props.modelValue) {
          return null
        }

        const {
          class: classAttr,
          onKeydown,
          ...restAttrs
        } = attrs as Record<string, unknown> & { onKeydown?: ((event: KeyboardEvent) => void) | ((event: KeyboardEvent) => void)[] }

        function handleKeydown(event: KeyboardEvent) {
          if (Array.isArray(onKeydown)) {
            onKeydown.forEach((handler) => handler(event))
          } else if (typeof onKeydown === 'function') {
            onKeydown(event)
          }
        }

        const dialogContent = h(
          'div',
          {
            ...restAttrs,
            class: ['v-dialog', classAttr],
            onKeydown: handleKeydown,
          },
          slots.default?.() ?? [],
        )

        return h(
          'div',
          {
            class: classAttr,
            'aria-modal': restAttrs['aria-modal'] ?? 'true',
            'aria-labelledby': restAttrs['aria-labelledby'] as string | undefined,
            onKeydown: handleKeydown,
          },
          [h(Teleport, { to: 'body' }, dialogContent)],
        )
      }
    },
  }),
}

if (!('visualViewport' in window)) {
  function noop() {}
  const mockViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    offsetTop: 0,
    offsetLeft: 0,
    pageTop: 0,
    pageLeft: 0,
    addEventListener: noop,
    removeEventListener: noop,
  } as unknown as VisualViewport

  window.visualViewport = mockViewport
}

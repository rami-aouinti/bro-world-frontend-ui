import { defineNuxtPlugin } from '#app'
import { Icon } from '@iconify/vue'
import { computed, defineComponent, h } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  const IconWrapper = defineComponent({
    name: 'IconWrapper',
    inheritAttrs: false,
    props: {
      name: {
        type: String,
        required: false,
      },
      icon: {
        type: String,
        required: false,
      },
      size: {
        type: [String, Number],
        required: false,
      },
    },
    setup(props, { attrs }) {
      const resolvedIcon = computed(() => {
        const attrIcon = attrs.icon as string | undefined
        const attrName = attrs.name as string | undefined
        return props.icon ?? props.name ?? attrIcon ?? attrName ?? ''
      })

      const resolvedSize = computed(() => {
        const attrSize = attrs.size as string | number | undefined
        return props.size ?? attrSize
      })

      return () => {
        const { name, icon, size, ...restAttrs } = attrs as Record<string, unknown>

        const finalSize = resolvedSize.value

        const iconProps: Record<string, unknown> = {
          ...restAttrs,
          icon: resolvedIcon.value,
        }

        if (finalSize != null) {
          iconProps.width = finalSize
          iconProps.height = finalSize
        }

        if (!iconProps.icon) {
          return null
        }

        return h(Icon, iconProps)
      }
    },
  })

  nuxtApp.vueApp.component('Icon', IconWrapper)
})

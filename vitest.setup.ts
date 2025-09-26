import { config } from '@vue/test-utils'
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
}

if (!('visualViewport' in window)) {
  const noop = () => {}
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

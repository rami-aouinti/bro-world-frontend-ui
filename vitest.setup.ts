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

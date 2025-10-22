import { config } from "@vue/test-utils";
import { Teleport, defineComponent, h } from "vue";
import { createVuetify } from "vuetify";
import * as vuetifyComponents from "vuetify/components";
import * as vuetifyDirectives from "vuetify/directives";
import "vuetify/styles";
import UserAvatar from "~/components/UserAvatar.vue";

const vuetify = createVuetify({
  components: vuetifyComponents,
  directives: vuetifyDirectives,
});

config.global.plugins = config.global.plugins ?? [];
config.global.plugins.push(vuetify);

const NuxtImgStub = defineComponent({
  name: "NuxtImgStub",
  inheritAttrs: false,
  props: {
    src: {
      type: [String, Object],
      default: undefined,
    },
    alt: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    return () =>
      h("img", {
        ...attrs,
        class: [attrs.class, "nuxt-img-stub"].filter(Boolean),
        src:
          typeof props.src === "string"
            ? props.src
            : (attrs.src as string | undefined),
        alt: props.alt ?? (attrs.alt as string | undefined),
      });
  },
});

const IconStub = defineComponent({
  name: "IconStub",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: ["icon-stub", attrs.class].filter(Boolean),
          role: (attrs.role as string | undefined) ?? "img",
          "aria-hidden": attrs["aria-hidden"] ?? "true",
        },
        slots.default?.() ?? [],
      );
  },
});

config.global.stubs = {
  ...(config.global.stubs ?? {}),
  transition: false,
  "transition-group": false,
  NuxtImg: NuxtImgStub,
  Icon: IconStub,
  VDialog: defineComponent({
    name: "VDialog",
    inheritAttrs: false,
    props: {
      modelValue: {
        type: Boolean,
        default: false,
      },
    },
    emits: ["update:modelValue"],
    setup(props, { attrs, slots }) {
      return () => {
        if (!props.modelValue) {
          return null;
        }

        const {
          class: classAttr,
          onKeydown,
          ...restAttrs
        } = attrs as Record<string, unknown> & {
          onKeydown?: ((event: KeyboardEvent) => void) | ((event: KeyboardEvent) => void)[];
        };

        function handleKeydown(event: KeyboardEvent) {
          if (Array.isArray(onKeydown)) {
            onKeydown.forEach((handler) => handler(event));
          } else if (typeof onKeydown === "function") {
            onKeydown(event);
          }
        }

        const dialogContent = h(
          "div",
          {
            ...restAttrs,
            class: ["v-dialog", classAttr],
            onKeydown: handleKeydown,
          },
          slots.default?.() ?? [],
        );

        return h(
          "div",
          {
            class: classAttr,
            "aria-modal": restAttrs["aria-modal"] ?? "true",
            "aria-labelledby": restAttrs["aria-labelledby"] as string | undefined,
            onKeydown: handleKeydown,
          },
          [h(Teleport, { to: "body" }, dialogContent)],
        );
      };
    },
  }),
};

config.global.components = {
  ...(config.global.components ?? {}),
  UserAvatar,
};

if (!("visualViewport" in window)) {
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
  } as unknown as VisualViewport;

  window.visualViewport = mockViewport;
}

export const NuxtLink = {
  name: "NuxtLinkStub",
  props: {
    to: {
      type: [String, Object],
      default: undefined,
    },
  },
  template: "<a><slot /></a>",
};

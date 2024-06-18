import { Teleport } from "vue";

export const RootPortal = defineComponent({
  props: {
    to: {
      type: HTMLElement,
      required: false,
      default: document.body
    }
  },
  setup(props, ctx) {
    return () => <Teleport to={props.to}>{ctx.slots.default?.()}</Teleport>;
  }
});

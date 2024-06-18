import * as LabelPrimitive from "radix-vue";
import { clsxm } from "~/utils/helper";

export const Label = defineComponent({
  props: {
    as: String,
    asChild: Boolean,
    id: String,
    className: String
  },
  setup(props, ctx) {
    return () => (
      <LabelPrimitive.Label
        as={props.as}
        for={props.id}
        asChild={props.asChild}
        class={clsxm(
          "text-foreground-600 text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          props.className
        )}
      >
        {ctx.slots.default?.()}
      </LabelPrimitive.Label>
    );
  }
});

import clsx from "clsx";
import { uniqueId } from "lodash-es";
import { Label } from "~/components/label/Label";

export const SidebarWrapper = defineComponent({
  props: {
    className: [String] as PropType<string>
  },
  setup(props, { slots }) {
    return () => {
      return (
        <div
          class={clsx(
            "flex max-h-[calc(100vh-6rem)] grow flex-col gap-8 overflow-auto px-2 pb-4 font-medium scrollbar-none lg:h-0 lg:max-h-[auto]",

            props.className
          )}
        >
          {slots.default?.()}
        </div>
      );
    };
  }
});

export const SidebarSection = defineComponent({
  props: {
    label: {
      type: String,
      requried: true
    },
    className: {
      type: String
    },
    actions: {
      type: Object as PropType<VNode>
    }
  },
  setup(props, { slots }) {
    const id = uniqueId(":l").concat(":");
    return () => (
      <section class="relative flex flex-col gap-4">
        <div class="relative ml-1 flex items-center justify-between">
          <Label id={id} class="flex-1 shrink-0">
            {props.label}
          </Label>
          {!!props.actions && (
            <div class="flex items-center gap-2">{props.actions}</div>
          )}
        </div>
        <div class={props.className} id={id}>
          {slots.default?.()}
        </div>
      </section>
    );
  }
});

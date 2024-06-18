import { clsxm } from "~/utils/helper";

export const Divider = defineComponent({
  props: {
    className: String
  },
  setup(props) {
    return () => (
      <div
        class={clsxm(
          "relative flex w-full box-border text-[16px] text-base-content transition-colors ease-in-out duration-300",
          props.className
        )}
      >
        <div
          class={
            "bg-neutral-400/20 dark:bg-neutral-900 border-none h-[1px] w-full m-0 transition-colors ease-in-out duration-300"
          }
        />
      </div>
    );
  }
});

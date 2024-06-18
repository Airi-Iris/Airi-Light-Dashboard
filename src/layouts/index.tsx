import { RootPortal } from "~/components/portal";
import { clsxm } from "~/utils/helper";

export const MainLayout = defineComponent({
  setup(props, ctx) {
    return () => (
      <div class="flex min-h-screen flex-col [&>div]:flex [&>div]:grow [&>div]:flex-col">
        <main class="mt-28 flex min-h-0 grow flex-col p-4">
          {ctx.slots.default?.()}
        </main>
      </div>
    );
  }
});

export const OffsetMainLayout = defineComponent({
  props: {
    className: String
  },
  setup(props, ctx) {
    return () => (
      <div class={clsxm(props.className, "-ml-4 w-[calc(100%+2rem)] p-4")}>
        {ctx.slots.default?.()}
      </div>
    );
  }
});

export const OffsetHeaderLayout = defineComponent({
  props: {
    className: String
  },
  setup(props, ctx) {
    return () => (
      <RootPortal>
        <div
          class={clsxm(
            "fixed right-4 top-[4.5rem] z-[19] flex",
            props.className
          )}
        >
          {ctx.slots.default?.()}
        </div>
      </RootPortal>
    );
  }
});

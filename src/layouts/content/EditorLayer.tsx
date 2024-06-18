/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

/* eslint-disable @typescript-eslint/no-empty-function */
import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  provide,
  ref
} from "vue";
import { useRouter } from "vue-router";
import styles from "./index.module.css";
import type { PropType, VNode } from "vue";
import { clsxm } from "~/utils/helper";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { RootPortal } from "~/components/portal";

const ProvideKey = Symbol("inject");

interface Injectable {
  addFloatButton: (vnode: VNode) => symbol;
  removeFloatButton: (name: symbol) => void;
  setHeaderButtons: (vnode: VNode | null) => void;
}
export const useLayout = () =>
  inject<Injectable>(ProvideKey, {
    addFloatButton(el: VNode) {
      return Symbol();
    },
    removeFloatButton(name: symbol) {},
    setHeaderButtons(el: VNode | null) {}
  });
export const EditorLayer = defineComponent({
  props: {
    actionsElement: {
      type: Object as PropType<VNode | null>,
      required: false
    },
    contentElement: {
      type: Object as PropType<VNode | null>,
      required: false
    },
    sidebarElement: {
      type: Object as PropType<VNode | null>,
      required: false
    },
    footerButtonElement: {
      type: Object as PropType<VNode | null>,
      required: false
    },
    title: {
      type: String
    },
    description: {
      type: [String, Object] as PropType<string | VNode>
    },
    headerClass: {
      type: [String] as PropType<string>
    },
    mainClass: {
      type: [String] as PropType<string>
    }
  },
  setup(props, ctx) {
    const { slots } = ctx;
    const router = useRouter();
    const route = computed(() => router.currentRoute);
    const A$ael = () => props.actionsElement ?? null;
    const A$cel = () => props.contentElement ?? null;
    const A$sel = () => props.sidebarElement ?? null;
    const A$fel = () => props.footerButtonElement ?? null;
    const footerExtraButtonEl = ref<
      null | ((() => VNode) & { displayName$: symbol })[]
    >(null);
    provide<Injectable>(ProvideKey, {
      addFloatButton(el: VNode | (() => VNode)) {
        footerExtraButtonEl.value ??= [];
        const E: any = typeof el === "function" ? el : () => el;
        E.displayName$ = E.name ? Symbol(E.name) : Symbol("fab");
        footerExtraButtonEl.value.push(E);

        return E.displayName$;
      },
      removeFloatButton(name: symbol) {
        if (!footerExtraButtonEl.value) {
          return;
        }
        const index = footerExtraButtonEl.value.findIndex(
          (E) => E.displayName$ === name
        );
        if (index !== -1) {
          footerExtraButtonEl.value.splice(index, 1);
        }
      },

      setHeaderButtons(el: VNode | null) {
        if (!el) {
          SettingHeaderEl.value = null;
          return;
        }
        SettingHeaderEl.value = () => el;
      }
    });

    onBeforeUnmount(() => {
      footerExtraButtonEl.value = null;
    });

    const pageTitle = computed(
      //@ts-ignore
      () => props.title ?? route.value.value.matched.at(-1)?.meta.title
    );

    const SettingHeaderEl = ref<(() => VNode) | null>();
    // 抽出动态组件，防止整个子代组件全部重渲染
    const HeaderActionComponent = defineComponent({
      setup() {
        return () => (
          <>
            {SettingHeaderEl.value ? (
              <SettingHeaderEl.value />
            ) : props.actionsElement ? (
              <A$ael />
            ) : (
              slots.actions?.()
            )}
          </>
        );
      }
    });
    const Footer = defineComponent({
      setup() {
        return () => {
          return (
            <footer class={styles.buttons}>
              {footerExtraButtonEl.value
                ? footerExtraButtonEl.value.map((E) => (
                    <E key={E.displayName$} />
                  ))
                : null}
              {props.footerButtonElement ? <A$fel /> : slots.buttons?.()}
            </footer>
          );
        };
      }
    });

    const uiStore = useStoreRef(UIStore);

    return () => {
      const isMobile = uiStore.viewport.value.mobile;

      return (
        <>
          <div
            class={clsxm(
              "flex flex-wrap items-center justify-between lg:mb-5",
              props.headerClass
            )}
          >
            <div class="flex items-center justify-between">
              <p class="flex items-center text-lg font-medium">
                {isMobile ? <div /> : <span>{pageTitle.value}</span>}
              </p>
            </div>
            {isMobile ? (
              <RootPortal>
                <div class="fixed right-4 top-28 z-20 flex shrink-0 grow gap-2 text-right lg:gap-4">
                  <HeaderActionComponent />
                </div>
              </RootPortal>
            ) : (
              <div class="flex shrink-0 grow gap-2 text-right lg:gap-4">
                <HeaderActionComponent />
              </div>
            )}
          </div>
          <main
            class={clsxm(
              "flex grow lg:grid lg:grid-cols-[auto_400px] lg:gap-4",
              props.mainClass
            )}
          >
            <div class="flex grow flex-col overflow-auto">
              <A$cel />
            </div>
            <A$sel />
            <Footer />
          </main>
          {slots.default?.()}
        </>
      );
    };
  }
});

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
export const ContentLayout = defineComponent({
  props: {
    actionsElement: {
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
    }
  },
  setup(props, ctx) {
    const { slots } = ctx;
    const router = useRouter();
    const route = computed(() => router.currentRoute);
    const A$ael = () => props.actionsElement ?? null;
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

    const breadcrumbText = computed(() =>
      route.value.value.matched.reduce(
        (t, cur) =>
          t +
          (cur.meta.title
            ? // t 不为空，补一个 分隔符
              t.length > 0
              ? ` · ${cur.meta.title}`
              : cur.meta.title
            : ""),
        ""
      )
    );
    const pageTitle = computed(
      //@ts-ignore
      () => props.title ?? route.value.value.matched.at(-1)?.meta.title
    );

    const descriptionElement = computed(() => {
      if (!props.description && breadcrumbText.value === pageTitle.value) {
        return null;
      }

      return props.description ?? breadcrumbText.value;
    });

    const SettingHeaderEl = ref<(() => VNode) | null>();
    // 抽出动态组件，防止整个子代组件全部重渲染
    const HeaderActionComponent = defineComponent({
      setup() {
        return () => (
          <div class={[styles["header-actions"], "space-x-4"]}>
            {SettingHeaderEl.value ? (
              <SettingHeaderEl.value />
            ) : props.actionsElement ? (
              <A$ael />
            ) : (
              slots.actions?.()
            )}
          </div>
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

    return () => (
      <>
        <div
          class={[
            "left-0 right-0 top-[-2.5rem] z-[15] bg-transparent p-12 pb-6 phone:px-6",
            props.headerClass
          ]}
        >
          <div class="flex justify-between">
            <div class={"flex flex-col"}>
              <h1 class="flex items-center text-[1.73rem]">
                {pageTitle.value}
              </h1>
              {descriptionElement.value && (
                <h2 class={"opacity-80"}>{descriptionElement.value}</h2>
              )}
            </div>
            <HeaderActionComponent />
          </div>
        </div>
        <main class={clsxm("p-12 pt-[6px]", [styles.main])}>
          {slots.default?.()}
        </main>
        <Footer />
      </>
    );
  }
});

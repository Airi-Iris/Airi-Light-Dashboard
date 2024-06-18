import { NTabPane, NTabs } from "naive-ui";
import { defineComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { TabSecurity } from "./tabs/security";
import { TabSystem } from "./tabs/system";
import { TabUser } from "./tabs/user";

enum SettingTab {
  User = "user",
  System = "system",
  Security = "security"
}
export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();
    const tabValue = ref(route.params.type as string);

    watch(
      () => route.params.type,
      (n) => {
        if (!n) {
          return;
        }
        tabValue.value = n as any;
      }
    );
    const headerActionsEl = ref<null | VNode>(null);
    return () => (
      <>
        <div class="relative -mt-12 flex w-full grow flex-col">
          <div
            dir="ltr"
            data-orientation="horizontal"
            class="flex flex-row sticky top-16 z-[1] -ml-4 h-[42px] -mt-8 w-[calc(100%+2rem)] bg-white/80 backdrop-blur dark:bg-zinc-900/80 border-b-[0.5px] border-zinc-200 dark:border-neutral-900"
          >
            <h1 class={"w-[50px] center flex mr-4 ml-4 font-bold text-[16px]"}>
              设定
            </h1>
          </div>
          <div
            class={
              "bg-white dark:bg-[#151515] border-[#eeeeee] border border-solid rounded-md dark:border-neutral-900 flex mt-12"
            }
          >
            <NTabs
              type="line"
              animated
              class="lg:w-full w-full enter-x"
              justify-content="space-evenly"
              size="medium"
              bar-width={220}
              value={tabValue.value}
              onUpdateValue={(e) => {
                router.replace({
                  ...route,
                  //@ts-ignore
                  params: { ...route.params, type: e }
                });
              }}
            >
              <NTabPane
                tab="基本设置"
                name={SettingTab.User}
                class="items-center"
              >
                <TabUser />
              </NTabPane>

              <NTabPane
                tab="系统设置"
                name={SettingTab.System}
                class="items-center"
              >
                <TabSystem />
              </NTabPane>

              <NTabPane
                tab="安全设置"
                name={SettingTab.Security}
                class="items-center"
              >
                <TabSecurity />
              </NTabPane>
            </NTabs>
          </div>
        </div>
      </>
    );
  }
});

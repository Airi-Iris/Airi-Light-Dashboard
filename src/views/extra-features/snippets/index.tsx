import { NCard, NTabPane, NTabs } from "naive-ui";
import { useRoute, useRouter } from "vue-router";

import { Tab2ForEdit } from "./tabs/for-edit";
import { Tab1ForList } from "./tabs/for-list";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { SnippetGroup } from "./interfaces/snippet-group";
import { RESTManager } from "~/utils";

const useFetchReferenceNames = () => {
  const referenceNames = ref<SnippetGroup[]>([]);
  const fetchReferenceNames = async () => {
    const data = await RESTManager.api.snippets.group.get<{
      data: SnippetGroup[];
    }>({
      params: {
        size: 50
      }
    });

    referenceNames.value = data.data;
  };

  onMounted(() => {
    fetchReferenceNames();
  });

  return {
    referenceNames,
    fetchReferenceNames
  };
};

export default defineComponent({
  name: "SnippetView",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const currentTab = computed(() => route.query.tab || "0");
    const uiStore = useStoreRef(UIStore);
    const isMobile = uiStore.viewport.value.mobile;
    const { referenceNames: references, fetchReferenceNames } =
      useFetchReferenceNames();

    return () => (
      <div class="relative -mt-12 flex w-full grow flex-col">
        <div class="mt-[5rem] p-12 pt-[6px]">
          <NCard
            class={"rounded-md border border-solid border-border"}
            contentStyle={"padding:0 1.5rem;"}
          >
            {{
              header() {
                return (
                  <>
                    <div class={"flex flex-col mb-4 select-none"}>
                      <h1 class={"flex items-center text-[1.73rem]"}>
                        配置与云函数
                      </h1>
                      <h2 class={"opacity-80 text-sm inline-flex"}>
                        附加功能 · 配置与云函数
                      </h2>
                    </div>
                  </>
                );
              },
              default() {
                return (
                  <>
                    <NTabs
                      size="medium"
                      value={currentTab.value as string}
                      onUpdateValue={(e) => {
                        router.push({
                          query: {
                            tab: e
                          }
                        });
                      }}
                    >
                      <NTabPane name={"0"} tab={"列表"} displayDirective={"if"}>
                        <Tab1ForList />
                      </NTabPane>

                      <NTabPane name={"1"} tab={"编辑"} displayDirective={"if"}>
                        <Tab2ForEdit />
                      </NTabPane>
                    </NTabs>
                  </>
                );
              }
            }}
          </NCard>
        </div>
      </div>
    );
  }
});

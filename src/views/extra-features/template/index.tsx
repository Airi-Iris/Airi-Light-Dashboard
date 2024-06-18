import { NCard, NTabPane, NTabs } from "naive-ui";

import { EmailTab } from "./tabs/email";
import { MarkdownTab } from "./tabs/markdown";

export default defineComponent({
  setup() {
    const tab = ref("1");
    return () => (
      <div class="relative -mt-12 flex w-full grow flex-col">
        <div class="mt-[5rem] p-12 pt-[6px] pb-[6px]">
          <NCard
            class={"rounded-md border border-solid border-border"}
            contentStyle={"padding:0 1.5rem 1.5rem;"}
          >
            {{
              header() {
                return (
                  <>
                    <div class={"flex flex-col mb-4 select-none"}>
                      <h1 class={"flex items-center text-[1.73rem]"}>
                        模板编辑
                      </h1>
                      <h2 class={"opacity-80 text-sm inline-flex mt-2"}>
                        附加功能 · 模板编辑
                      </h2>
                    </div>
                  </>
                );
              },
              default() {
                return (
                  <NTabs
                    value={tab.value}
                    size="medium"
                    onUpdateValue={(tabvalue) => {
                      tab.value = tabvalue;
                    }}
                  >
                    <NTabPane name="1" tab="邮件模板">
                      <EmailTab />
                    </NTabPane>
                    <NTabPane name="2" tab="预览 Markdown 模板">
                      <MarkdownTab />
                    </NTabPane>
                  </NTabs>
                );
              }
            }}
          </NCard>
        </div>
      </div>
    );
  }
});

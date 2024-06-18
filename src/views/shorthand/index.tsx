/**
 * 最近 & 速记
 */
import {
  NButton,
  NPopconfirm,
  NSpace,
  NTimeline,
  NTimelineItem
} from "naive-ui";
import { defineComponent, onMounted } from "vue";
import type { RecentlyModel } from "~/models/recently";

import { Icon } from "@vicons/utils";

import {
  MaterialSymbolsThumbDownOutline,
  MaterialSymbolsThumbUpOutline,
  PenIcon
} from "~/components/icons";
import { useShorthand } from "~/components/shorthand";
import { RelativeTime } from "~/components/time/relative-time";

import { RoundedIconButtonBase } from "../../components/button/rounded-button";
import { RESTManager } from "../../utils/rest";
import styles from "./index.module.css";
import { OffsetHeaderLayout } from "~/layouts";

export default defineComponent({
  setup() {
    const data = ref([] as RecentlyModel[]);
    const loading = ref(true);

    onMounted(async () => {
      RESTManager.api.recently.all
        .get<{ data: RecentlyModel[] }>()
        .then((res) => {
          data.value = res.data;
          loading.value = false;
        });
    });
    const { create } = useShorthand();
    return () => (
      <div class="relative -mt-12 flex w-full grow flex-col">
        <div
          dir="ltr"
          data-orientation="horizontal"
          class="flex flex-row sticky top-16 z-[1] -ml-4 h-[42px] -mt-8 w-[calc(100%+2rem)] bg-white/80 backdrop-blur dark:bg-zinc-900/80 border-b-[0.5px] border-zinc-200 dark:border-neutral-900"
        >
          <h1 class={"w-[50px] center flex mr-4 ml-4 font-bold text-[16px]"}>
            速记
          </h1>
        </div>
        <div class="flex mt-16 p-16 pt-0">
          <NTimeline>
            {data.value.map((item) => {
              return (
                <NTimelineItem type="default" key={item.id}>
                  {{
                    icon() {
                      return (
                        <Icon>
                          <PenIcon />
                        </Icon>
                      );
                    },
                    default() {
                      return (
                        <div class={styles["timeline-grid"]}>
                          <span>{item.content}</span>

                          <div class="action">
                            <NPopconfirm
                              placement="left"
                              positiveText="取消"
                              negativeText="删除"
                              onNegativeClick={async () => {
                                await RESTManager.api
                                  .recently(item.id)
                                  .delete();
                                message.success("删除成功");
                                data.value.splice(data.value.indexOf(item), 1);
                              }}
                            >
                              {{
                                trigger: () => (
                                  <NButton quaternary type="error" size="tiny">
                                    移除
                                  </NButton>
                                ),

                                default: () => (
                                  <span class={"max-w-48 break-all"}>
                                    确定要删除 {item.content} ?
                                  </span>
                                )
                              }}
                            </NPopconfirm>
                          </div>
                        </div>
                      );
                    },
                    footer() {
                      return (
                        <NSpace inline size={5}>
                          <RelativeTime time={item.created} />
                          <NSpace inline size={1} align="center">
                            <MaterialSymbolsThumbUpOutline /> {item.up}
                            <span class={"mx-2"}>/</span>
                            <MaterialSymbolsThumbDownOutline /> {item.down}
                          </NSpace>
                        </NSpace>
                      );
                    }
                  }}
                </NTimelineItem>
              );
            })}
          </NTimeline>
        </div>

        <OffsetHeaderLayout>
          <RoundedIconButtonBase
            icon={<i class="icon-[mingcute--add-line] size-[16px]" />}
            className="bg-accent size-[28px]"
            name="记录"
            onClick={() => {
              create().then((res) => {
                if (res) {
                  data.value.unshift(res);
                }
              });
            }}
          />
        </OffsetHeaderLayout>
      </div>
    );
  }
});

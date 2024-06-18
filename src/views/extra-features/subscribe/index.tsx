import { Table } from "~/components/table";
import { RelativeTime } from "~/components/time/relative-time";
import { useDataTableFetch } from "~/hooks/use-table";
import { NButton, NCard, NPopconfirm, NSpace, NSwitch, NTag } from "naive-ui";
import { RESTManager } from "~/utils";
import { useRoute } from "vue-router";
import { SubscribeBit2TextMap } from "./constants";
import type { SubscribeResponse } from "~/models/subscribe";
import type { TableColumns } from "naive-ui/es/data-table/src/interface";

export default defineComponent({
  setup() {
    const route = useRoute();
    const subscribeEnabled = ref(false);

    onBeforeMount(async () => {
      const enabled = await RESTManager.api.subscribe.status
        .get<{
          enable: boolean;
        }>()
        .then((res) => {
          return res.enable;
        });
      subscribeEnabled.value = enabled;
    });

    const toggleSubscribeEnable = async () => {
      await RESTManager.api.options("featureList").patch({
        data: {
          emailSubscribe: !subscribeEnabled.value
        }
      });
      subscribeEnabled.value = !subscribeEnabled.value;
    };

    const { loading, checkedRowKeys, data, pager, fetchDataFn } =
      useDataTableFetch((data, pager) => {
        return async (page = route.query.page || 1, size = 10) => {
          const response =
            await RESTManager.api.subscribe.get<SubscribeResponse>({
              params: {
                page,
                size,
                sortBy: "created",
                sortOrder: "-1"
              }
            });
          data.value = response.data;
          pager.value = response.pagination;
        };
      });
    const fetchData = fetchDataFn;
    watch(
      () => route.query.page,
      async (n) => {
        // @ts-expect-error
        await fetchData(n);
      }
    );

    onMounted(async () => {
      await fetchDataFn();
    });

    const columns = computed<TableColumns<any>>(() => [
      {
        title: "邮箱",
        key: "email",
        ellipsis: { tooltip: true },
        width: 140
      },
      {
        title: "订阅内容",
        key: "subscribe",
        width: 250,
        render(row) {
          return <SubscribeBit bit={row.subscribe} />;
        }
      },
      {
        title: "创建于",
        width: 250,
        key: "created",
        sortOrder: "descend",
        render(row) {
          return <RelativeTime time={row.created} />;
        }
      },
      {
        title: "操作",
        fixed: "right",
        width: 40,
        key: "id",
        render(row) {
          return (
            <NSpace>
              <NPopconfirm
                positiveText="取消"
                negativeText="删除"
                onNegativeClick={async () => {
                  await RESTManager.api.subscribe.unsubscribe.get({
                    params: {
                      email: row.email,
                      cancelToken: row.cancelToken
                    }
                  });
                  message.success("删除成功");
                  await fetchData(pager.value.currentPage);
                }}
              >
                {{
                  trigger: () => (
                    <NButton quaternary type="error" size="tiny">
                      移除
                    </NButton>
                  ),

                  default: () => (
                    <span class="max-w-48">确定要删除 {row.title}？</span>
                  )
                }}
              </NPopconfirm>
            </NSpace>
          );
        }
      }
    ]);

    const DescriptionElement = defineComponent(() => () => (
      <div class={"inline-flex items-center"}>
        <span>邮件订阅开启状态：</span>
        <NSwitch
          value={subscribeEnabled.value}
          onChange={toggleSubscribeEnable}
        />
      </div>
    ));
    return () => (
      <div class="relative -mt-12 flex w-full grow flex-col">
        <div class="mt-[5rem] p-12 pt-[6px]">
          <NCard
            class={"rounded-md border border-solid border-border"}
            contentStyle={"padding:0;"}
          >
            {{
              header() {
                return (
                  <>
                    <div class={"flex flex-col mb-4 select-none"}>
                      <h1 class={"flex items-center text-[1.73rem]"}>
                        管理订阅
                      </h1>
                      <h2 class={"opacity-80 text-sm inline-flex mt-2"}>
                        <DescriptionElement />
                      </h2>
                    </div>
                  </>
                );
              },
              default() {
                return (
                  <Table
                    class={"mb-4 custom-ef-np custom-ef-ndt"}
                    data={data}
                    loading={loading.value}
                    columns={columns.value}
                    onFetchData={fetchData}
                    pager={pager}
                    onUpdateCheckedRowKeys={(keys) => {
                      checkedRowKeys.value = keys;
                    }}
                  />
                );
              }
            }}
          </NCard>
        </div>
      </div>
    );
  }
});

export const SubscribeBit = defineComponent({
  props: {
    bit: {
      type: Number,
      required: true
    }
  },
  render() {
    const tagElements = [] as VNode[];

    for (const [bit, text] of SubscribeBit2TextMap.entries()) {
      bit & this.bit && tagElements.push(<NTag round>{text}</NTag>);
    }

    return <NSpace>{tagElements}</NSpace>;
  }
});

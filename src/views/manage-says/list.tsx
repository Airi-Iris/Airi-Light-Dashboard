import { DeleteConfirmButton } from "~/components/special-button/delete-confirm";
import { Table } from "~/components/table";
import { RelativeTime } from "~/components/time/relative-time";
import { useDataTableFetch } from "~/hooks/use-table";
import { NButton, NPopconfirm, NSpace, useDialog, useMessage } from "naive-ui";
import { defineComponent, onMounted, reactive, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { RoundedIconButtonBase } from "../../components/button/rounded-button";
import { RESTManager } from "../../utils/rest";
import type { TableColumns } from "naive-ui/lib/data-table/src/interface";
import type { SayResponse } from "~/models/say";
import { OffsetHeaderLayout } from "~/layouts";
import { clsxm } from "~/utils/helper";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";

const ManageSayListView = defineComponent({
  name: "SayList",
  setup(props, ctx) {
    const { checkedRowKeys, data, pager, loading, fetchDataFn } =
      useDataTableFetch(
        (data, pager) =>
          async (page = route.query.page || 1, size = 30) => {
            const response = await RESTManager.api.says.get<SayResponse>({
              params: {
                page,
                size,
                select: "title text _id id created modified author source"
              }
            });
            data.value = response.data;
            pager.value = response.pagination;
          }
      );

    const message = useMessage();
    const dialog = useDialog();

    const route = useRoute();
    const fetchData = fetchDataFn;
    watch(
      () => route.query.page,
      async (n) => {
        // @ts-expect-error
        await fetchData(n);
      }
    );

    onMounted(async () => {
      await fetchData();
    });

    const DataTable = defineComponent({
      setup() {
        const columns = reactive<TableColumns<any>>([
          {
            type: "selection",
            options: ["none", "all"]
          },
          {
            title: "创建于",
            key: "created",
            width: 100,
            render(row) {
              return (
                <RouterLink to={`/says/edit?id=${row.id}`}>
                  <RelativeTime time={row.created} />
                </RouterLink>
              );
            }
          },
          {
            title: "内容",
            key: "text"
          },
          { title: "作者", key: "author" },
          { title: "来源", key: "source" },
          {
            title: "操作",
            fixed: "right",
            key: "id",
            width: 130,
            render(row) {
              return (
                <NSpace wrap={false}>
                  <RouterLink to={`/says/edit?id=${row.id}`}>
                    <NButton quaternary type="primary" size="tiny">
                      编辑
                    </NButton>
                  </RouterLink>
                  <NPopconfirm
                    positiveText={"取消"}
                    negativeText="删除"
                    onNegativeClick={async () => {
                      await RESTManager.api.says(row.id).delete();
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
                        <span class="max-w-48">确定要删除“{row.text}” ?</span>
                      )
                    }}
                  </NPopconfirm>
                </NSpace>
              );
            }
          }
        ]);

        return () => (
          <Table
            loading={loading.value}
            columns={columns}
            data={data}
            onFetchData={fetchData}
            pager={pager}
            onUpdateCheckedRowKeys={(keys) => {
              checkedRowKeys.value = keys;
            }}
          />
        );
      }
    });

    const uiStore = useStoreRef(UIStore);
    return () => {
      const isMobile = uiStore.viewport.value.mobile;
      return (
        <>
          <div class="relative">
            <>
              <div
                class={clsxm(
                  "flex flex-wrap items-center justify-between pt-4 lg:mb-5"
                )}
              >
                <div class="flex items-center justify-between">
                  <p class="flex items-center text-lg font-medium">
                    {isMobile ? <div /> : <span>说说 · 说什么了呢</span>}
                  </p>
                </div>
              </div>
              <DataTable />
            </>
          </div>
          <OffsetHeaderLayout className="space-x-2">
            <>
              <DeleteConfirmButton
                checkedRowKeys={checkedRowKeys.value}
                onDelete={async () => {
                  const status = await Promise.allSettled(
                    checkedRowKeys.value.map((id) =>
                      RESTManager.api.says(id as string).delete()
                    )
                  );

                  for (const s of status) {
                    if (s.status === "rejected") {
                      message.success(`删除失败，${s.reason.message}`);
                    }
                  }

                  checkedRowKeys.value.length = 0;
                  fetchData();
                }}
              />
              <RoundedIconButtonBase
                className="bg-accent"
                name={"撰写"}
                to={"/says/edit"}
                icon={<i class="icon-[mingcute--add-line] text-white" />}
              />
            </>
          </OffsetHeaderLayout>
        </>
      );
    };
  }
});

export default ManageSayListView;

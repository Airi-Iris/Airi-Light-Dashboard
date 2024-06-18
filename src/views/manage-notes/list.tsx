import { BookmarkIcon, EyeHideIcon } from "~/components/icons";
import { TableTitleLink } from "~/components/link/title-link";
import { DeleteConfirmButton } from "~/components/special-button/delete-confirm";
import { Table } from "~/components/table";
import { EditColumn } from "~/components/table/edit-column";
import { RelativeTime } from "~/components/time/relative-time";
import { useDataTableFetch } from "~/hooks/use-table";
import { NButton, NEllipsis, NPopconfirm, NSpace, useMessage } from "naive-ui";
import { formatNumber } from "~/utils/number";
import { defineComponent, onMounted, reactive, watch } from "vue";
import { useRoute } from "vue-router";

import { Icon } from "@vicons/utils";

import { RoundedIconButtonBase } from "../../components/button/rounded-button";
import { RESTManager } from "../../utils/rest";
import type { TableColumns } from "naive-ui/lib/data-table/src/interface";
import type { NoteModel } from "~/models/note";
import type { Pager } from "~/models/base";
import { clsxm } from "~/utils/helper";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { OffsetHeaderLayout } from "~/layouts";

export const ManageNoteListView = defineComponent({
  name: "NoteList",
  setup() {
    const { loading, checkedRowKeys, data, pager, sortProps, fetchDataFn } =
      useDataTableFetch<NoteModel>(
        (data, pager) =>
          async (page = route.query.page || 1, size = 20, db_query) => {
            const response = await RESTManager.api.notes.get<{
              data: NoteModel[];
              pagination: Pager;
            }>({
              params: {
                db_query,
                page,
                size,
                select:
                  "title _id nid id created modified mood weather hide publicAt bookmark coordinates location count meta",
                ...(sortProps.sortBy
                  ? { sortBy: sortProps.sortBy, sortOrder: sortProps.sortOrder }
                  : {})
              }
            });
            data.value = response.data;
            pager.value = response.pagination;
          }
      );

    const message = useMessage();

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
        const columns = reactive<TableColumns<NoteModel>>([
          {
            type: "selection",
            options: ["none", "all"]
          },
          {
            title: "序号",
            width: 16 * 4,
            key: "nid"
          },
          {
            title: "标题",
            sortOrder: false,
            sorter: "default",
            key: "title",
            width: 280,

            filter: true,
            filterOptions: [
              { label: "回忆项", value: "bookmark" },
              { label: "隐藏项", value: "hide" }
            ],

            render(row) {
              const isSecret =
                row.publicAt && +new Date(row.publicAt) - Date.now() > 0;
              return (
                <TableTitleLink
                  inPageTo={`/notes/edit?id=${row.id}`}
                  title={row.title}
                  externalLinkTo={`/notes/${row.nid}`}
                  id={row.id}
                  withToken={row.hide || isSecret}
                  xLog={row.meta?.xLog}
                >
                  {{
                    default() {
                      return (
                        <>
                          {row.hide || isSecret ? (
                            <Icon color="#34495e">
                              <EyeHideIcon />
                            </Icon>
                          ) : null}
                          {row.bookmark ? (
                            <Icon color="#e74c3c">
                              <BookmarkIcon />
                            </Icon>
                          ) : null}
                        </>
                      );
                    }
                  }}
                </TableTitleLink>
              );
            }
          },
          {
            title: "心情",
            key: "mood",
            width: 100,
            render(row, index) {
              return (
                <EditColumn
                  initialValue={data.value[index].mood ?? ""}
                  onSubmit={async (v) => {
                    await RESTManager.api.notes(row.id).patch({
                      data: {
                        mood: v
                      }
                    });

                    message.success("修改成功");
                    data.value[index].mood = v;
                  }}
                  placeholder="心情"
                />
              );
            }
          },
          {
            title: "天气",
            key: "weather",
            width: 100,
            render(row, index) {
              return (
                <EditColumn
                  initialValue={data.value[index].weather ?? ""}
                  onSubmit={async (v) => {
                    await RESTManager.api.notes(row.id).patch({
                      data: {
                        weather: v
                      }
                    });
                    message.success("修改成功");
                    data.value[index].weather = v;
                  }}
                  placeholder="天气"
                />
              );
            }
          },
          {
            title: "地点",
            key: "location",
            width: 200,
            render(row) {
              const { coordinates, location } = row;
              if (!location) {
                return null;
              } else {
                return (
                  <NEllipsis class="max-w-[200px] truncate">
                    {{
                      tooltip() {
                        return (
                          <div class="">
                            <p>{location}</p>
                            <p>
                              {coordinates?.longitude}, {coordinates?.latitude}
                            </p>
                          </div>
                        );
                      },
                      default() {
                        return location;
                      }
                    }}
                  </NEllipsis>
                );
              }
            }
          },

          {
            title: () => (
              <div class="flex items-center">
                <i class="icon-[mingcute--eye-line] size-5 mr-1" />
                <span>阅读数</span>
              </div>
            ),
            key: "count.read",
            width: 50,
            ellipsis: {
              tooltip: true
            },
            render(row) {
              return formatNumber(row.count?.read || 0);
            }
          },
          {
            title: () => (
              <div class="flex items-center">
                <i class="icon-[mingcute--heart-line] size-5 mr-1" />
                <span>喜欢数</span>
              </div>
            ),
            width: 50,
            ellipsis: {
              tooltip: true
            },
            key: "count.like",
            render(row) {
              return formatNumber(row.count?.like || 0);
            }
          },

          {
            title: "创建于",
            key: "created",
            sortOrder: "descend",
            sorter: "default",
            width: 200,
            render(row) {
              return <RelativeTime time={row.created} />;
            }
          },
          {
            title: "修改于",
            key: "modified",
            sorter: "default",
            sortOrder: false,
            width: 200,
            render(row) {
              return <RelativeTime time={row.modified} />;
            }
          },
          {
            title: "操作",
            key: "id",
            width: 100,
            fixed: "right",
            render(row) {
              return (
                <NSpace>
                  <NPopconfirm
                    positiveText={"取消"}
                    negativeText="删除"
                    onNegativeClick={async () => {
                      await RESTManager.api.notes(row.id).delete();
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
                        <span class="max-w-48">确定要删除 {row.title} ?</span>
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
            nTableProps={{
              async onUpdateFilters(filter: { title: string[] }, column) {
                const { title } = filter;
                if (!title || title.length === 0) {
                  await fetchData();
                  return;
                }
                await fetchData(
                  1,
                  undefined,
                  title.reduce((acc, i) => ({ ...acc, [i]: true }), {})
                );
              }
            }}
            loading={loading.value}
            columns={columns}
            data={data}
            onFetchData={fetchData}
            pager={pager}
            onUpdateCheckedRowKeys={(keys) => {
              checkedRowKeys.value = keys;
            }}
            onUpdateSorter={async (props) => {
              sortProps.sortBy = props.sortBy;
              sortProps.sortOrder = props.sortOrder;
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
                    {isMobile ? <div /> : <span>手记 · 管理</span>}
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
                      RESTManager.api.notes(id as string).delete()
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
                to={"/notes/edit"}
                icon={<i class="icon-[mingcute--add-line] text-white" />}
              />
            </>
          </OffsetHeaderLayout>
        </>
      );
    };
  }
});

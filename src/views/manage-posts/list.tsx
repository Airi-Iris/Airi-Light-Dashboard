import { PhPushPin } from "~/components/icons";
import { TableTitleLink } from "~/components/link/title-link";
import { DeleteConfirmButton } from "~/components/special-button/delete-confirm";
import { Table } from "~/components/table";
import { EditColumn } from "~/components/table/edit-column";
import { RelativeTime } from "~/components/time/relative-time";
import { useStoreRef } from "~/hooks/use-store-ref";
import { useDataTableFetch } from "~/hooks/use-table";
import {
  NButton,
  NIcon,
  NPopconfirm,
  NPopover,
  NSpace,
  useMessage
} from "naive-ui";
import { CategoryStore } from "~/stores/category";
import { parseDate } from "~/utils";
import { computed, defineComponent, onMounted, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { RoundedIconButtonBase } from "../../components/button/rounded-button";
import { RESTManager } from "../../utils/rest";
import type {
  CategoryWithChildrenModel,
  PickedPostModelInCategoryChildren
} from "~/models/category";
import type {
  FilterOption,
  FilterState,
  TableColumns
} from "naive-ui/lib/data-table/src/interface";
import type { ComputedRef } from "vue";
import type { PostModel, PostResponse } from "../../models/post";
import { OffsetHeaderLayout } from "~/layouts";
import { clsxm } from "~/utils/helper";
import { UIStore } from "~/stores/ui";

export const ManagePostListView = defineComponent({
  name: "PostList",
  setup() {
    const { loading, checkedRowKeys, data, pager, sortProps, fetchDataFn } =
      useDataTableFetch(
        (data, pager) =>
          async (page = route.query.page || 1, size = 20) => {
            const response = await RESTManager.api.posts.get<PostResponse>({
              params: {
                page,
                size,
                select:
                  "title _id id created modified slug categoryId copyright tags count pin meta",
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

    const categoryStore = useStoreRef(CategoryStore);

    onMounted(async () => {
      await fetchData();
      await categoryStore.fetch();
    });

    const DataTable = defineComponent({
      setup() {
        const categoryFilterOptions: ComputedRef<FilterOption[]> = computed(
          () =>
            categoryStore.data.value?.map((i) => ({
              label: i.name,
              value: i.id
            })) || []
        );

        const columns = reactive<TableColumns<PostModel>>([
          {
            type: "selection",
            options: ["none", "all"]
          },
          {
            title: "标题",
            key: "title",
            width: 280,
            render(row) {
              return (
                <div class={"flex flex-grow items-center space-x-2"}>
                  {row.pin && (
                    <NPopover>
                      {{
                        trigger() {
                          return (
                            <NIcon class={"flex-shrink-0 text-orange-400"}>
                              <PhPushPin />
                            </NIcon>
                          );
                        },
                        default() {
                          if (!row.pin) return null;
                          return (
                            <span>
                              置顶于{" "}
                              {parseDate(row.pin, "yyyy 年 M 月 d 日 HH:mm:ss")}
                            </span>
                          );
                        }
                      }}
                    </NPopover>
                  )}
                  <div class={"w-0 flex-grow"}>
                    <TableTitleLink
                      id={row.id}
                      title={row.title}
                      inPageTo={`/posts/edit?id=${row.id}`}
                      externalLinkTo={`/posts/${row.category.slug}/${row.slug}`}
                      xLog={row.meta?.xLog}
                    />
                  </div>
                </div>
              );
            }
          },
          {
            title: "分类",
            sortOrder: false,
            sorter: "default",
            key: "category",
            width: 100,
            ellipsis: true,
            // @ts-expect-error
            filterOptions: categoryFilterOptions,
            filter: true,
            render(row) {
              const map = categoryStore.map.value;

              if (!map) {
                return "";
              }

              return (
                <EditColumn
                  returnToConfrim={false}
                  initialValue={
                    categoryStore.map.value.get(row.categoryId)?.name ?? ""
                  }
                  onSubmit={async (v) => {
                    await RESTManager.api.posts(row.id).patch({
                      data: {
                        categoryId: v
                      }
                    });

                    message.success("修改成功~!");
                    data.value.find((i) => i.id === row.id).categoryId = v;
                  }}
                  type="select"
                  options={
                    categoryStore.data.value?.map((i) => ({
                      label: i.name,
                      value: i.id,
                      key: i.id
                    })) || []
                  }
                />
              );
            }
          },
          {
            title: "标签",
            key: "tags",
            width: 100,
            ellipsis: true,
            render(row) {
              return row.tags?.join("，");
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
            render(row) {
              return row.count?.read || 0;
            }
          },
          {
            title: () => (
              <div class="flex items-center">
                <i class="icon-[mingcute--thumb-up-line] size-5 mr-1" />
                <span>点赞数</span>
              </div>
            ),
            width: 50,
            key: "count.like",
            render(row) {
              return row.count?.like || 0;
            }
          },
          {
            title: "创建于",
            width: 100,
            key: "created",
            sortOrder: "descend",
            sorter: "default",
            render(row) {
              return <RelativeTime time={row.created} />;
            }
          },
          {
            title: "修改于",
            key: "modified",
            sorter: "default",
            sortOrder: false,
            width: 100,
            render(row) {
              return <RelativeTime time={row.modified} />;
            }
          },
          {
            title: "操作",
            fixed: "right",
            width: 60,
            key: "id",
            render(row) {
              return (
                <NSpace>
                  <NPopconfirm
                    positiveText={"取消"}
                    negativeText="删除"
                    onNegativeClick={async () => {
                      await RESTManager.api.posts(row.id).delete();
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
            loading={loading.value}
            columns={columns}
            data={data}
            nTableProps={{
              onUpdateFilters: async (filterState: FilterState) => {
                if (!filterState) {
                  return;
                }

                if (
                  filterState.category &&
                  Array.isArray(filterState.category)
                ) {
                  const len = filterState.category.length;
                  if (!len) {
                    await fetchData();
                    return;
                  }
                  const ids = filterState.category.join(",");

                  const { entries: _data } =
                    await RESTManager.api.categories.get<{
                      entries: Record<string, CategoryWithChildrenModel>;
                    }>({
                      params: {
                        ids
                      }
                    });

                  const concatList: PickedPostModelInCategoryChildren[] =
                    Object.values(_data)
                      .reduce((list, cur) => {
                        const children = cur.children?.map((i) => {
                          Object.defineProperty(i, "categoryId", {
                            value: cur.id,
                            enumerable: true
                          });
                          Object.defineProperty(i, "category", {
                            get() {
                              return cur;
                            },

                            enumerable: false
                          });

                          return i;
                        });
                        return [...list, ...children];
                      }, [] as PickedPostModelInCategoryChildren[])
                      .sort(
                        (a, b) => +new Date(a.created) - +new Date(b.created)
                      );

                  data.value = concatList;
                  pager.value = {
                    currentPage: 1,
                    total: 1,
                    size: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                    totalPage: 1
                  };
                }
              }
            }}
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
        <div class="relative">
          <>
            <div
              class={clsxm(
                "flex flex-wrap items-center justify-between pt-4 lg:mb-5"
              )}
            >
              <div class="flex items-center justify-between">
                <p class="flex items-center text-lg font-medium">
                  {isMobile ? <div /> : <span>文稿 · 管理</span>}
                </p>
              </div>
            </div>
            <DataTable />
          </>
          <OffsetHeaderLayout className="space-x-2">
            <>
              <DeleteConfirmButton
                checkedRowKeys={checkedRowKeys.value}
                onDelete={async () => {
                  const status = await Promise.allSettled(
                    checkedRowKeys.value.map((id) =>
                      RESTManager.api.posts(id as string).delete()
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
                to={"/posts/edit"}
                icon={<i class="icon-[mingcute--add-line] text-white" />}
              />
            </>
          </OffsetHeaderLayout>
        </div>
      );
    };
  }
});

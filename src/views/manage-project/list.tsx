import { MenuDownIcon } from "~/components/icons";
import { DeleteConfirmButton } from "~/components/special-button/delete-confirm";
import { RelativeTime } from "~/components/time/relative-time";
import { useDataTableFetch } from "~/hooks/use-table";
import {
  NAvatar,
  NButton,
  NButtonGroup,
  NCheckbox,
  NElement,
  NIcon,
  NList,
  NListItem,
  NPagination,
  NPopselect,
  NSpace,
  NSpin,
  NThing,
  useMessage
} from "naive-ui";
import { router } from "~/router";
import { RouteName } from "~/router/name";
import { parseDate } from "~/utils";
import { defineComponent, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

import { RoundedIconButtonBase } from "../../components/button/rounded-button";
import { RESTManager } from "../../utils/rest";
import type { ProjectModel, ProjectResponse } from "~/models/project";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { clsxm } from "~/utils/helper";
import { OffsetHeaderLayout } from "~/layouts";

const ManageProjectView = defineComponent({
  setup() {
    const { data, pager, sortProps, fetchDataFn, loading } =
      useDataTableFetch<ProjectModel>(
        (data, pager) =>
          async (page = route.query.page || 1, size = 30) => {
            const response =
              await RESTManager.api.projects.get<ProjectResponse>({
                params: {
                  page,
                  size
                }
              });
            data.value = response.data;
            pager.value = response.pagination;
          }
      );

    const checkedRowKeys = reactive(new Set<string>());

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
                    {isMobile ? <div /> : <span>项目 · 项目列表</span>}
                  </p>
                </div>
              </div>
              <div class={"p-16 pt-0"}>
                <NSpin show={loading.value}>
                  <NList
                    hoverable
                    bordered={false}
                    class="min-h-[300px] bg-transparent"
                  >
                    {{
                      footer() {
                        return (
                          <div class="flex justify-end">
                            <NPagination
                              itemCount={pager.value.total}
                              pageCount={pager.value.totalPage}
                              page={pager.value.currentPage}
                              pageSize={pager.value.size}
                              onUpdatePage={(page) => {
                                fetchData(page);
                              }}
                            />
                          </div>
                        );
                      },
                      default() {
                        return data.value.map((item) => {
                          return (
                            <NListItem
                              key={item.id}
                              class={"bg-base-100 rounded-md"}
                            >
                              {{
                                prefix() {
                                  return (
                                    <NCheckbox
                                      class="mt-4"
                                      checked={checkedRowKeys.has(item.id)}
                                      onUpdateChecked={(checked) => {
                                        if (checked) {
                                          checkedRowKeys.add(item.id);
                                        } else {
                                          checkedRowKeys.delete(item.id);
                                        }
                                      }}
                                    />
                                  );
                                },

                                default() {
                                  return (
                                    <NThing description={item.description}>
                                      {{
                                        header() {
                                          return (
                                            <div>
                                              <NButton
                                                ghost
                                                type="primary"
                                                quaternary
                                                class="!font-medium"
                                                {...(item.projectUrl
                                                  ? {
                                                      tag: "a",
                                                      href: item.projectUrl,
                                                      target: "_blank"
                                                    }
                                                  : {})}
                                              >
                                                {item.name}
                                              </NButton>
                                            </div>
                                          );
                                        },
                                        footer() {
                                          return (
                                            <NElement>
                                              <NSpace class="pl-[3.6rem] text-sm text-[var(--clear-color-pressed)]">
                                                <span>
                                                  创建于{" "}
                                                  {parseDate(item.created)}
                                                </span>

                                                {item.modified && (
                                                  <span>
                                                    更新于{" "}
                                                    <RelativeTime
                                                      time={item.modified}
                                                    />
                                                  </span>
                                                )}
                                              </NSpace>
                                            </NElement>
                                          );
                                        },
                                        "header-extra": function () {
                                          return (
                                            <NButtonGroup>
                                              <NButton
                                                onClick={() => {
                                                  router.push({
                                                    name: RouteName.EditProject,
                                                    query: { id: item.id }
                                                  });
                                                }}
                                              >
                                                编辑
                                              </NButton>
                                              <NPopselect
                                                class="!p-0"
                                                options={[
                                                  {
                                                    value: "del",
                                                    label: "",
                                                    render() {
                                                      return (
                                                        <NButton
                                                          type="error"
                                                          bordered={false}
                                                          onClick={async () => {
                                                            await RESTManager.api
                                                              .projects(item.id)
                                                              .delete();
                                                            message.success(
                                                              "删除成功"
                                                            );
                                                            await fetchData(
                                                              pager.value
                                                                .currentPage
                                                            );
                                                          }}
                                                        >
                                                          删除
                                                        </NButton>
                                                      );
                                                    }
                                                  }
                                                ]}
                                              >
                                                <NButton class="!px-2">
                                                  <NIcon>
                                                    <MenuDownIcon />
                                                  </NIcon>
                                                </NButton>
                                              </NPopselect>
                                            </NButtonGroup>
                                          );
                                        },
                                        avatar() {
                                          return item.avatar ? (
                                            <NAvatar
                                              class="align-center"
                                              circle
                                              src={item.avatar}
                                              size="large"
                                            />
                                          ) : (
                                            <NAvatar
                                              circle
                                              size="large"
                                              class="align-center"
                                            >
                                              {item.name[0].toUpperCase()}
                                            </NAvatar>
                                          );
                                        }
                                      }}
                                    </NThing>
                                  );
                                }
                              }}
                            </NListItem>
                          );
                        });
                      }
                    }}
                  </NList>
                </NSpin>
              </div>
            </>
          </div>
          <OffsetHeaderLayout className="space-x-2">
            <DeleteConfirmButton
              checkedRowKeys={checkedRowKeys}
              onDelete={async () => {
                await Promise.all(
                  Array.from(checkedRowKeys.values()).map((id) => {
                    return RESTManager.api.projects(id as string).delete();
                  })
                );
                checkedRowKeys.clear();

                fetchData();
              }}
            />
            <RoundedIconButtonBase
              className="bg-accent"
              name={"添加项目"}
              to={"/projects/edit"}
              icon={<i class="icon-[mingcute--add-line] text-white" />}
            />
          </OffsetHeaderLayout>
        </>
      );
    };
  }
});

export default ManageProjectView;

import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { FunctionIcon, LockIcon } from "~/components/icons";
import { tableRowStyle } from "~/components/table";
import { RelativeTime } from "~/components/time/relative-time";
import {
  NButton,
  NDataTable,
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NMenu,
  NPopconfirm,
  NSpace
} from "naive-ui";
import { RESTManager } from "~/utils";
import { getToken } from "~/utils/auth";
import { useRoute, useRouter } from "vue-router";

import { Icon } from "@vicons/utils";

import { SnippetType } from "../../../../models/snippet";
import { ImportSnippetButton } from "../components/import-snippets-button";
import { UpdateDependencyButton } from "../components/update-deps-button";
import type { SnippetGroup } from "../interfaces/snippet-group";
import type { SnippetModel } from "../../../../models/snippet";
import type { MenuMixedOption } from "naive-ui/es/menu/src/interface";
import { OffsetHeaderLayout } from "~/layouts";

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

export const Tab1ForList = defineComponent({
  setup() {
    const { referenceNames: references, fetchReferenceNames } =
      useFetchReferenceNames();

    const router = useRouter();
    const menuOptions = computed<MenuMixedOption[]>(() =>
      references.value.map((group) => {
        return {
          label: () => (
            <div class={"flex justify-between text-sm"}>
              <span class={"truncate"}>{group.reference}</span>
              <span class={"flex-shrink-0"}>{group.count}</span>
            </div>
          ),
          key: group.reference
        };
      })
    );
    const selectValue = ref("");
    let abortController: AbortController | null = null;
    const datatableSource = ref<SnippetModel[] | undefined>([]);
    const route = useRoute();
    const onSelect = (value: string) => {
      router.replace({
        query: {
          ...route.query,
          reference: value
        }
      });
      selectValue.value = value;
    };

    watch(
      // @ts-expect-error
      () => [selectValue.value, references.value],
      ([value]: [string, any]) => {
        if (abortController) {
          abortController.abort();
          datatableSource.value = undefined;
        }
        abortController = new AbortController();
        RESTManager.api.snippets
          .group(value)
          .get<{ data: SnippetModel[] }>({
            signal: abortController.signal
          })
          .then((res) => {
            datatableSource.value = res.data;
          });
      }
    );

    onMounted(() => {
      if (route.query.reference) {
        onSelect(route.query.reference as string);
      }
    });

    const onRowDelete = async (
      row: SnippetModel,
      deleteText: string,
      isBuiltFunction: boolean
    ) => {
      if (isBuiltFunction) {
        await RESTManager.api.fn.reset(row.id).delete();
      } else {
        await RESTManager.api.snippets(row.id).delete();
      }
      message.success(`${deleteText}成功`);

      if (!datatableSource.value || isBuiltFunction) {
        return;
      }
      datatableSource.value = datatableSource.value.filter((source) => {
        return source.id !== row.id;
      });
    };

    return () => {
      return (
        <>
          <OffsetHeaderLayout className="space-x-2">
            <RoundedIconButtonBase
              className="bg-accent"
              icon={<i class="icon-[mingcute--add-line] size-4" />}
              onClick={() => {
                router.push({
                  query: {
                    tab: 1
                  }
                });
              }}
              name="新建云函数"
            />

            <ImportSnippetButton onFinish={fetchReferenceNames} />
            <UpdateDependencyButton />
          </OffsetHeaderLayout>
          <NLayout hasSider embedded>
            <NLayoutSider bordered width={150}>
              <NMenu
                options={menuOptions.value}
                value={selectValue.value}
                onUpdateValue={onSelect}
              />
            </NLayoutSider>
            <NLayoutContent>
              <NDataTable
                bordered={false}
                rowClassName={() => tableRowStyle}
                loading={!datatableSource.value}
                data={datatableSource.value}
                class={"custom-ef-ndt"}
                columns={[
                  {
                    key: "name",
                    title: "名称",
                    render(row: SnippetModel) {
                      const name = row.name;
                      const isPrivate = row.private;
                      return (
                        <NSpace align="center">
                          {row.type === SnippetType.Function && (
                            <Icon>
                              <FunctionIcon />
                            </Icon>
                          )}
                          <NButton
                            tag="a"
                            quaternary
                            // @ts-ignore
                            href={`${
                              RESTManager.endpoint +
                              (row.type === SnippetType.Function
                                ? "/fn/"
                                : "/snippets/") +
                              row.reference
                            }/${row.name}${
                              row.private ? `?token=${getToken()}` : ""
                            }`}
                            target="_blank"
                            size="tiny"
                          >
                            {row.type == SnippetType.Function &&
                              row.method != "GET" && (
                                <span class={"mr-2"}>{row.method} - </span>
                              )}
                            {row.enable === false ? (
                              <del>{name}</del>
                            ) : (
                              <span>{name}</span>
                            )}
                          </NButton>
                          {isPrivate && (
                            <Icon class={"flex items-center"}>
                              <LockIcon />
                            </Icon>
                          )}
                        </NSpace>
                      );
                    }
                  },

                  {
                    title: "类型",
                    key: "type"
                  },

                  {
                    key: "comment",
                    title: "备注",
                    width: 300,
                    ellipsis: {
                      tooltip: true
                    }
                  },
                  {
                    title: "创建于",
                    key: "created",
                    render(row) {
                      return (
                        <RelativeTime
                          showPopoverInfoAbsoluteTime
                          time={row.created}
                        />
                      );
                    }
                  },

                  {
                    title: "操作",
                    key: "id",
                    fixed: "right",
                    render(row) {
                      const isBuiltFunction =
                        row.builtIn && row.type === SnippetType.Function;

                      const deleteText = isBuiltFunction ? "重置" : "删除";
                      return (
                        <NSpace>
                          <NButton
                            quaternary
                            size="tiny"
                            type="primary"
                            onClick={() => {
                              router.push({
                                query: {
                                  ...route.query,
                                  tab: 1,
                                  id: row.id
                                }
                              });
                            }}
                          >
                            编辑
                          </NButton>

                          <NPopconfirm
                            positiveText="取消"
                            negativeText={deleteText}
                            onNegativeClick={() =>
                              onRowDelete(row, deleteText, isBuiltFunction)
                            }
                          >
                            {{
                              trigger: () => (
                                <NButton quaternary type="error" size="tiny">
                                  {deleteText}
                                </NButton>
                              ),

                              default: () => (
                                <span class="max-w-48">
                                  确定要{deleteText} {row.title} ?
                                </span>
                              )
                            }}
                          </NPopconfirm>
                        </NSpace>
                      );
                    }
                  }
                ]}
              />
            </NLayoutContent>
          </NLayout>
        </>
      );
    };
  }
});

const colums = [
  {
    type: "selection",
    options: ["none", "all"]
  },
  {
    key: "name",
    title: "名称",
    render(row: SnippetModel) {
      const name = row.name;
      const isPrivate = row.private;
      return (
        <NSpace align="center">
          {row.type === SnippetType.Function && (
            <Icon>
              <FunctionIcon />
            </Icon>
          )}
          <NButton
            tag="a"
            quaternary
            // @ts-ignore
            href={`${
              RESTManager.endpoint +
              (row.type === SnippetType.Function ? "/fn/" : "/snippets/") +
              row.reference
            }/${row.name}${row.private ? `?token=${getToken()}` : ""}`}
            target="_blank"
            size="tiny"
          >
            {row.type == SnippetType.Function && row.method != "GET" && (
              <span class={"mr-2"}>{row.method} - </span>
            )}
            {row.enable === false ? <del>{name}</del> : <span>{name}</span>}
          </NButton>
          {isPrivate && (
            <Icon class={"flex items-center"}>
              <LockIcon />
            </Icon>
          )}
        </NSpace>
      );
    }
  },

  {
    title: "类型",
    key: "type"
  },

  {
    key: "comment",
    title: "备注",
    width: 300,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: "创建于",
    key: "created",
    render(row) {
      return <RelativeTime time={row.created} />;
    }
  },

  {
    title: "操作",
    key: "id",
    fixed: "right",
    render(row) {
      return (
        <NSpace>
          <NButton
            quaternary
            size="tiny"
            type="primary"
            onClick={() => {
              // router.push({
              //   query: {
              //     tab: 1,
              //     id: row.id,
              //   },
              // })
            }}
          >
            编辑
          </NButton>

          {/* <NPopconfirm
            positiveText={'取消'}
            negativeText="删除"
            onNegativeClick={async () => {
              await RESTManager.api.snippets(row.id).delete()
              message.success('删除成功')
              await fetchDataFn(pager.value.currentPage)
            }}
          >
            {{
              trigger: () => (
                <NButton text type="error" size="tiny">
                  移除
                </NButton>
              ),

              default: () => (
                <span class="max-w-48">
                  确定要删除 {row.title} ?
                </span>
              ),
            }}
          </NPopconfirm> */}
        </NSpace>
      );
    }
  }
];

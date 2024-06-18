import omit from "lodash-es/omit";
import {
  NBadge,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NPopconfirm,
  NSelect,
  NSpace,
  NTabPane,
  NTabs,
  NTag,
  NText,
  useDialog,
  useMessage
} from "naive-ui";
import { defineComponent, onBeforeMount, ref, toRaw, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { LinkModel, LinkResponse, LinkStateCount } from "~/models/link";

import {
  HeaderActionButtonWithDesc,
  RoundedIconButtonBase
} from "~/components/button/rounded-button";
import { Table } from "~/components/table";
import { RelativeTime } from "~/components/time/relative-time";
import { useDataTableFetch } from "~/hooks/use-table";
import { LinkState, LinkStateNameMap, LinkType } from "~/models/link";
import { RouteName } from "~/router/name";
import { RESTManager } from "~/utils";

import { Avatar } from "./components/avatar";
import { LinkAuditModal } from "./components/reason-modal";
import { UrlComponent } from "./url-components";
import { OffsetHeaderLayout } from "~/layouts";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { clsxm } from "~/utils/helper";

export default defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();

    const uiStore = useStoreRef(UIStore);
    const isMobile = uiStore.viewport.value.mobile;

    const tabValue = ref<LinkState>(
      (route.query.state as any) ?? LinkState.Pass
    );

    const { data, fetchDataFn, pager, loading } = useDataTableFetch<LinkModel>(
      (data, pager) =>
        async (page = route.query.page || 1, size = 50) => {
          const state: LinkState =
            (route.query.state as any | 0) ?? LinkState.Pass;
          const response = await RESTManager.api.links.get<LinkResponse>({
            params: {
              page,
              size,
              state: state | 0
            }
          });
          data.value = response.data;
          pager.value = response.pagination;
        }
    );
    const message = useMessage();
    const resetEditData: () => Omit<
      LinkModel,
      "id" | "created" | "hide" | "email"
    > & {
      id: null | string;
    } = () => ({
      avatar: "",
      name: "",
      type: LinkType.Friend,
      url: "",
      id: null,
      description: "",
      state: LinkState.Pass
    });
    const editDialogShow = ref(false);
    const editDialogData = ref(resetEditData());
    const isHealthChecked = ref(false);
    const unreachableLink = ref(0);
    const reachableLink = ref(0);

    watch(
      () => route.query.state,
      async (_) => {
        await fetchDataFn();
      }
    );

    watch(
      () => route.query.page,
      async (_) => {
        await fetchDataFn();
      },
      { immediate: true }
    );
    const stateCount = ref<LinkStateCount>({} as any);

    const fetchStat = async () => {
      const state = await RESTManager.api.links.state.get<LinkStateCount>();
      stateCount.value = state;
    };

    onBeforeMount(() => {
      fetchStat();
    });
    const onSubmit = async () => {
      const id = editDialogData.value.id;

      if (id) {
        const newData = await RESTManager.api.links(id).put<LinkModel>({
          data: omit<any, keyof LinkModel>(editDialogData.value, [
            "id",
            "created",
            "hide"
          ])
        });
        const idx = data.value.findIndex((i) => i.id == id);

        if (newData.state != tabValue.value) {
          data.value.splice(idx, 1);
          fetchStat();
        } else {
          // @ts-expect-error
          data.value[idx] = {
            ...data.value[idx],
            ...toRaw(editDialogData.value)
          };
        }
      } else {
        const { data: item } = (await RESTManager.api.links.post({
          data: { ...editDialogData.value }
        })) as any;
        data.value.unshift(item);
      }
      message.success("操作成功");
      editDialogShow.value = false;
      editDialogData.value = resetEditData();
    };

    const health = ref<
      Record<
        string,
        {
          id: string;
          status: number | string;
          message?: string;
        }
      >
    >();
    const handleCheck = async () => {
      const l = message.loading("检查中", { duration: 20e4 });

      try {
        const data = await RESTManager.api.links.health.get<any>({
          timeout: 20e4
        });

        // HACK manual lowercase key
        // @see: https://github.com/sindresorhus/camelcase-keys/issues/85
        health.value = Object.entries(data).reduce((acc, [k, v]) => {
          return { ...acc, [k.toLowerCase()]: v };
        }, {});
        // Additional data stats
        unreachableLink.value = Object.entries(data).reduce(
          (acc, [_, i]: any) => {
            return i.status !== 200 ? acc + 1 : acc;
          },
          0
        );
        reachableLink.value = Object.entries(data).reduce(
          (acc, [_, i]: any) => {
            return i.status === 200 ? acc + 1 : acc;
          },
          0
        );
        message.success("检查完成");
        isHealthChecked.value = true;
      } catch (error) {
        console.error(error);
      } finally {
        requestAnimationFrame(() => {
          l.destroy();
        });
      }
    };

    const modal = useDialog();

    return () => (
      <>
        <OffsetHeaderLayout className="space-x-2">
          <Fragment>
            <RoundedIconButtonBase
              icon={<i class="icon-[mingcute--add-line]" />}
              className="bg-accent"
              onClick={() => {
                editDialogData.value = resetEditData();
                editDialogShow.value = true;
              }}
              name="添加新朋友"
            />

            <RoundedIconButtonBase
              icon={<i class="icon-[mingcute--heartbeat-line]" />}
              className="bg-[#2080f0]"
              variant="info"
              onClick={handleCheck}
              name="检查友链可用性"
            />
          </Fragment>
        </OffsetHeaderLayout>
        <div class="relative -mt-12 flex w-full grow flex-col">
          <div
            dir="ltr"
            data-orientation="horizontal"
            class="flex flex-row sticky top-16 z-[1] -ml-4 h-[42px] -mt-8 w-[calc(100%+2rem)] bg-white/80 backdrop-blur dark:bg-zinc-900/80 border-b-[0.5px] border-zinc-200 dark:border-neutral-900"
          >
            <h1 class={"w-[50px] center flex mr-4 ml-4 font-bold text-[16px]"}>
              朋友们
            </h1>
          </div>
          <div class="mt-16 p-16 pt-0">
            <NCard
              class={"mt-16 rounded-md"}
              headerExtra={() => {
                return !isMobile ? (
                  <>
                    <div class="shrink grow" />
                    <div class="flex grow-0 items-center gap-4">
                      <div class="flex gap-2">
                        <>
                          <HeaderActionButtonWithDesc
                            icon={
                              <i class="icon-[mingcute--add-line] size-4" />
                            }
                            variant="primary"
                            onClick={() => {
                              editDialogData.value = resetEditData();
                              editDialogShow.value = true;
                            }}
                            description="添加新朋友"
                          />

                          <HeaderActionButtonWithDesc
                            icon={
                              <i class="icon-[mingcute--heartbeat-line] size-4" />
                            }
                            class="bg-[#2080f0]"
                            onClick={handleCheck}
                            description="检查友链可用性"
                          />
                        </>
                      </div>
                    </div>
                  </>
                ) : null;
              }}
            >
              {{
                header() {
                  return (
                    <>
                      <div class={"flex flex-col mb-4 select-none"}>
                        <h1 class={"flex items-center text-[1.73rem]"}>
                          朋友们
                        </h1>
                        <h2 class={"opacity-80 text-sm inline-flex"}>
                          朋友们 · 列表
                          <span
                            class={clsxm(
                              "ml-4 center text-center inline-flex",
                              isHealthChecked.value
                                ? "text-[#2080f0]"
                                : "text-orange-400"
                            )}
                          >
                            {isHealthChecked.value ? (
                              <>
                                <span>{`=>`}友链可用性检查返回如下结果:</span>
                                <NTag
                                  type="error"
                                  size="small"
                                  class={"h-[16px] mx-2"}
                                >
                                  失效友链:{unreachableLink.value}
                                </NTag>
                                <NTag
                                  type="success"
                                  size="small"
                                  class={"h-[16px] mr-2"}
                                >
                                  有效友链:{reachableLink.value}
                                </NTag>
                                <span>详情请查看表格</span>
                              </>
                            ) : (
                              "=>未运行友链可用性检查<="
                            )}
                          </span>
                        </h2>
                      </div>
                    </>
                  );
                },
                default() {
                  return (
                    <>
                      <NTabs
                        class="min-h-[30px]"
                        size="medium"
                        value={tabValue.value}
                        onUpdateValue={(e) => {
                          tabValue.value = e;

                          router.replace({
                            name: RouteName.Friend,
                            query: { state: e }
                          });
                        }}
                      >
                        <NTabPane name={LinkState.Pass} tab="朋友们" />
                        <NTabPane
                          name={LinkState.Audit}
                          tab={() => (
                            <NBadge value={stateCount.value.audit} processing>
                              <NText>待审核</NText>
                            </NBadge>
                          )}
                        />

                        <NTabPane
                          name={LinkState.Outdate}
                          tab={() => (
                            <NBadge
                              value={stateCount.value.outdate}
                              type="info"
                            >
                              <NText>过时的</NText>
                            </NBadge>
                          )}
                        />
                        <NTabPane
                          name={LinkState.Reject}
                          tab={() => (
                            <NBadge
                              value={stateCount.value.reject}
                              type="warning"
                            >
                              <NText>已拒绝</NText>
                            </NBadge>
                          )}
                        />
                        <NTabPane
                          name={LinkState.Banned}
                          tab={() => (
                            <NBadge
                              value={stateCount.value.banned}
                              type="error"
                            >
                              <NText>封禁的</NText>
                            </NBadge>
                          )}
                        />
                      </NTabs>
                      <Table
                        loading={loading.value}
                        data={data}
                        class={"mt-2"}
                        nTableProps={{
                          maxHeight: "calc(100vh - 22rem)"
                        }}
                        columns={[
                          {
                            title: "头像",
                            key: "avatar",
                            width: 80,
                            render(row) {
                              return (
                                <Avatar name={row.name} avatar={row.avatar} />
                              );
                            }
                          },
                          {
                            title: "名称",
                            key: "name",
                            render(row) {
                              return (
                                <a
                                  target="_blank"
                                  href={row.url}
                                  rel="noreferrer"
                                >
                                  {row.name}
                                </a>
                              );
                            }
                          },
                          {
                            title: "描述",
                            key: "description",
                            width: 250,
                            ellipsis: { lineClamp: 2, tooltip: true }
                          },
                          {
                            title: "网址",
                            key: "url",
                            render(row) {
                              const urlHealth = health.value?.[row.id];
                              return (
                                <UrlComponent
                                  url={row.url}
                                  errorMessage={urlHealth?.message}
                                  status={urlHealth?.status}
                                />
                              );
                            }
                          },
                          {
                            title: "类型",
                            key: "type",
                            width: 80,
                            render(row) {
                              return ["朋友", "收藏"][row.type | 0];
                            }
                          },
                          {
                            title: "对方邮箱",
                            key: "email",
                            // width: 120,
                            render(row) {
                              return (
                                <a href={`mailto:${row.email}`}>{row.email}</a>
                              );
                            }
                          },
                          {
                            title: "结识时间",
                            key: "created",
                            width: 80,
                            render(row) {
                              return <RelativeTime time={row.created} />;
                            }
                          },
                          {
                            width: 150,
                            title: "操作",
                            fixed: "right",
                            key: "action",
                            render(row) {
                              return (
                                <NSpace wrap={false}>
                                  {row.state == LinkState.Audit && (
                                    <>
                                      <NButton
                                        quaternary
                                        size="tiny"
                                        type="primary"
                                        onClick={async () => {
                                          await RESTManager.api.links
                                            .audit(row.id)
                                            .patch();
                                          message.success(
                                            `通过了来自${row.name}的友链邀请`
                                          );
                                          const idx = data.value.findIndex(
                                            (i) => i.id == row.id
                                          );
                                          data.value.splice(idx, 1);
                                          stateCount.value.audit--;
                                        }}
                                      >
                                        通过
                                      </NButton>

                                      <NButton
                                        quaternary
                                        size="tiny"
                                        type="info"
                                        onClick={async () => {
                                          modal.create({
                                            title: "发送友链结果",
                                            closeOnEsc: true,
                                            closable: true,
                                            content: () => {
                                              return (
                                                <LinkAuditModal
                                                  onCallback={async (
                                                    state,
                                                    reason
                                                  ) => {
                                                    await RESTManager.api.links.audit
                                                      .reason(row.id)
                                                      .post({
                                                        data: {
                                                          state,
                                                          reason
                                                        }
                                                      });
                                                    message.success(
                                                      `已发送友链结果给「${row.name}」`
                                                    );
                                                    const idx =
                                                      data.value.findIndex(
                                                        (i) => i.id == row.id
                                                      );
                                                    data.value.splice(idx, 1);
                                                    stateCount.value.audit--;

                                                    modal.destroyAll();
                                                  }}
                                                />
                                              );
                                            }
                                          });
                                        }}
                                      >
                                        理由
                                      </NButton>
                                    </>
                                  )}
                                  <NButton
                                    quaternary
                                    size="tiny"
                                    type="info"
                                    onClick={(_) => {
                                      editDialogShow.value = true;
                                      editDialogData.value = { ...row };
                                    }}
                                  >
                                    编辑
                                  </NButton>
                                  <NPopconfirm
                                    positiveText={"取消"}
                                    negativeText="删除"
                                    onNegativeClick={async () => {
                                      await RESTManager.api
                                        .links(row.id)
                                        .delete();
                                      message.success("删除成功");
                                      await fetchDataFn(
                                        pager.value.currentPage
                                      );
                                      row.state == LinkState.Audit &&
                                        stateCount.value.audit--;
                                    }}
                                  >
                                    {{
                                      trigger: () => (
                                        <NButton
                                          quaternary
                                          type="error"
                                          size="tiny"
                                        >
                                          移除
                                        </NButton>
                                      ),

                                      default: () => (
                                        <span class="max-w-48">
                                          确定要删除友链 {row.name} ?
                                        </span>
                                      )
                                    }}
                                  </NPopconfirm>
                                </NSpace>
                              );
                            }
                          }
                        ]}
                        onFetchData={fetchDataFn}
                        pager={pager}
                      />
                    </>
                  );
                }
              }}
            </NCard>

            {/* Modal */}

            <NModal
              transformOrigin="center"
              show={editDialogShow.value}
              onUpdateShow={(e) => void (editDialogShow.value = e)}
            >
              <NCard
                style="width: 500px;max-width: 90vw"
                headerStyle={{ textAlign: "center" }}
                title={
                  editDialogData.value.id
                    ? `编辑: ${editDialogData.value.name}`
                    : "新增"
                }
              >
                <NForm>
                  <NFormItem label="名字" required>
                    <NInput
                      autofocus
                      value={editDialogData.value.name}
                      onInput={(e) => void (editDialogData.value.name = e)}
                    />
                  </NFormItem>

                  <NFormItem label="头像">
                    <NInput
                      autofocus
                      value={editDialogData.value.avatar}
                      onInput={(e) => void (editDialogData.value.avatar = e)}
                    />
                  </NFormItem>

                  <NFormItem label="网址" required>
                    <NInput
                      autofocus
                      value={editDialogData.value.url}
                      onInput={(e) => void (editDialogData.value.url = e)}
                    />
                  </NFormItem>

                  <NFormItem label="描述">
                    <NInput
                      autofocus
                      value={editDialogData.value.description}
                      onInput={(e) =>
                        void (editDialogData.value.description = e)
                      }
                    />
                  </NFormItem>

                  <NFormItem label="类型">
                    <NSelect
                      placeholder="选择类型"
                      options={[
                        { label: "朋友", value: LinkType.Friend },
                        { label: "收藏", value: LinkType.Collection }
                      ]}
                      value={editDialogData.value.type}
                      onUpdateValue={(e) =>
                        void (editDialogData.value.type = e | 0)
                      }
                    />
                  </NFormItem>
                  {editDialogData.value.id && (
                    <NFormItem label="状态">
                      <NSelect
                        placeholder="选择状态"
                        options={Object.entries(LinkStateNameMap).map(
                          ([k, v]) => ({
                            label: v,
                            value: LinkState[k]
                          })
                        )}
                        value={editDialogData.value.state}
                        onUpdateValue={(e) =>
                          void (editDialogData.value.state = e | 0)
                        }
                      />
                    </NFormItem>
                  )}
                </NForm>

                <div class="text-right">
                  <NSpace size={12} align="center" inline>
                    <NButton type="primary" onClick={onSubmit} round>
                      确定
                    </NButton>
                    <NButton
                      onClick={() => {
                        editDialogShow.value = false;
                        editDialogData.value = resetEditData();
                      }}
                      round
                    >
                      取消
                    </NButton>
                  </NSpace>
                </div>
              </NCard>
            </NModal>
          </div>
        </div>
      </>
    );
  }
});

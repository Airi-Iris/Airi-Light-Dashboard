import markdownEscape from "markdown-escape";
import {
  NAvatar,
  NButton,
  NCard,
  NForm,
  NFormItemRow,
  NInput,
  NModal,
  NPopconfirm,
  NPopover,
  NSpace,
  NTabPane,
  NTabs,
  NText,
  useDialog,
  useMessage
} from "naive-ui";
import { defineComponent, nextTick, reactive, ref, unref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { CommentModel, CommentsResponse } from "~/models/comment";
import type { TableColumns } from "naive-ui/lib/data-table/src/interface";

import { Icon } from "@vicons/utils";

import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { EmojiAddIcon, UserAnonymouse } from "~/components/icons";
import { IpInfoPopover } from "~/components/ip-info";
import { Table } from "~/components/table";
import { WEB_URL } from "~/constants/env";
import { KAOMOJI_LIST } from "~/constants/kaomoji";
import { useStoreRef } from "~/hooks/use-store-ref";
import { useDataTableFetch } from "~/hooks/use-table";
import { CommentState } from "~/models/comment";
import { RouteName } from "~/router/name";
import { UIStore } from "~/stores/ui";
import { RESTManager } from "~/utils/rest";
import { relativeTimeFromNow } from "~/utils/time";

import { CommentMarkdownRender } from "./markdown-render";
import { OffsetHeaderLayout } from "~/layouts";

enum CommentType {
  Pending,
  Marked,
  Trash
}

const ManageComment = defineComponent(() => {
  const route = useRoute();
  const router = useRouter();

  const tabValue = ref(
    (+(route.query.state as any) as CommentType) ?? CommentType.Pending
  );

  const { data, checkedRowKeys, fetchDataFn, pager, loading } =
    useDataTableFetch<CommentModel>(
      (data, pager) =>
        async (page = route.query.page || 1, size = 10) => {
          const state: CommentType = route.query.state as any;
          const response = await RESTManager.api.comments.get<CommentsResponse>(
            {
              params: {
                page,
                size,
                state: state | 0
              }
            }
          );
          data.value = response.data.map(($) => {
            Reflect.deleteProperty($, "children");
            return $;
          });
          pager.value = response.pagination;
        }
    );
  const message = useMessage();
  const replyDialogShow = ref<boolean>(false);
  const replyComment = ref<CommentModel | null>(null);
  const replyText = ref("");
  const replyInputRef = ref<typeof NInput>();

  const requestLoading = ref(false);

  const onReplySubmit = async () => {
    if (!replyComment.value) {
      return;
    }
    try {
      requestLoading.value = true;
      await RESTManager.api.comments.master.reply(replyComment.value.id).post({
        data: {
          text: replyText.value
        }
      });
      replyDialogShow.value = false;
      replyComment.value = null;
      message.success("回复成功啦~");
      replyText.value = "";
      await fetchData();
    } finally {
      requestLoading.value = false;
    }
  };

  const fetchData = fetchDataFn;
  watch(
    () => route.query.page,
    async (n) => {
      // @ts-expect-error
      await fetchData(n);
    },
    { immediate: true }
  );

  watch(
    () => route.query.state,
    async (_) => {
      data.value = [];
      checkedRowKeys.value = [];
      nextTick(() => fetchData());
    }
  );

  async function changeState(id: string | string[], state: CommentState) {
    if (Array.isArray(id)) {
      await Promise.all(
        id.map((i) => {
          return RESTManager.api.comments(i).patch({ data: { state } });
        })
      );
    } else {
      await RESTManager.api.comments(id).patch({ data: { state } });
    }
    message.success("操作完成");
    await fetchData();
  }

  async function handleDelete(id: string | string[]) {
    if (Array.isArray(id)) {
      try {
        await Promise.all(
          id.map((i) => {
            return RESTManager.api
              .comments(i)
              .delete({ errorHandler: (err) => void 0 });
          })
        );
      } catch {}
    } else {
      await RESTManager.api.comments(id).delete();
    }
    await fetchData();
    message.success("删除成功");
  }
  const columns: TableColumns<CommentModel> = reactive([
    {
      title: "",
      key: "avatar",
      width: 60,
      render(row) {
        return <NAvatar circle src={row.avatar as any} />;
      }
    },
    {
      title: "作者",
      key: "author",
      width: 200,
      render(row) {
        return (
          <NSpace vertical size={2}>
            <div class={"inline-flex items-center space-x-2"}>
              {row.isWhispers && (
                <Icon>
                  <UserAnonymouse />
                </Icon>
              )}
              <a
                href={(row.url as any) || "#"}
                target="_blank"
                rel="noreferrer"
              >
                {row.author}
              </a>
            </div>
            <a href={(`mailto:${row.mail}` as any) || ""} target="_blank">
              {row.mail as any}
            </a>

            <div>
              <IpInfoPopover
                ip={row.ip}
                trigger={"hover"}
                triggerEl={
                  <NText depth="3" class="select-all">
                    {row.ip}
                  </NText>
                }
              />
            </div>
          </NSpace>
        );
      }
    },
    {
      title: "内容",
      key: "text",
      render(row: any) {
        const link = (() => {
          switch (row.refType) {
            case "posts": {
              return `${WEB_URL}/posts/${row.ref.category.slug}/${row.ref.slug}`;
            }
            case "notes": {
              return `${WEB_URL}/notes/${row.ref.nid}`;
            }
            case "pages": {
              return `${WEB_URL}/${row.ref.slug}`;
            }
          }
        })() as string;
        return (
          <NSpace vertical size={2}>
            <NSpace size={5}>
              <span>{relativeTimeFromNow(row.created)}</span>
              <span>于</span>
              {row.ref.title && (
                <a href={link} target="_blank">
                  {row.ref.title}
                </a>
              )}
              {row.ref.content && (
                <NPopover>
                  {{
                    default() {
                      return <p>{row.ref.content}</p>;
                    },
                    trigger() {
                      return (
                        <NButton text size="tiny" type="primary">
                          速记
                        </NButton>
                      );
                    }
                  }}
                </NPopover>
              )}
            </NSpace>
            <p>
              <CommentMarkdownRender text={row.text} />
            </p>
            {row.parent && (
              <blockquote class="border-primary-default my-2 ml-4 border-l-[3px] border-solid pl-[12px]">
                <NSpace size={2} align="center">
                  <NText depth="2">
                    {row.parent.author}&nbsp;在&nbsp;
                    {relativeTimeFromNow(row.parent.created)}&nbsp;说:&nbsp;
                    <CommentMarkdownRender text={row.parent.text} />
                  </NText>
                </NSpace>
              </blockquote>
            )}

            <div class="space-x-3">
              {tabValue.value !== CommentType.Marked && (
                <NButton
                  quaternary
                  size="tiny"
                  type="primary"
                  onClick={() => changeState(row.id, 1)}
                >
                  已读
                </NButton>
              )}
              {tabValue.value !== CommentType.Trash && (
                <NButton
                  quaternary
                  size="tiny"
                  type="warning"
                  onClick={() => changeState(row.id, 2)}
                >
                  垃圾
                </NButton>
              )}
              {tabValue.value !== CommentType.Trash && (
                <NButton
                  quaternary
                  size="tiny"
                  type="info"
                  onClick={(e) => {
                    replyComment.value = row;
                    replyDialogShow.value = true;
                  }}
                >
                  回复
                </NButton>
              )}
              <NPopconfirm
                positiveText={"取消"}
                negativeText="删除"
                onNegativeClick={() => {
                  handleDelete(row.id);
                }}
              >
                {{
                  trigger: () => (
                    <NButton text size="tiny" type="error">
                      删除
                    </NButton>
                  ),

                  default: () => (
                    <span class="max-w-48">确定要删除 {row.title} ?</span>
                  )
                }}
              </NPopconfirm>
            </div>
          </NSpace>
        );
      }
    }
  ]);

  const dialog = useDialog();

  const { viewport } = useStoreRef(UIStore);

  const handleKeyDown = (e: KeyboardEvent) => {
    // cmd + enter to onSubmit
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      onReplySubmit();
      e.preventDefault();
    }
  };
  return () => (
    <>
      <div class="relative -mt-12 flex w-full grow flex-col">
        <div
          dir="ltr"
          data-orientation="horizontal"
          class="flex flex-row sticky top-16 z-[1] -ml-4 -mt-8 w-[calc(100%+2rem)] h-[42px] items-center bg-white/80 backdrop-blur dark:bg-zinc-900/80 border-b-[0.5px] border-zinc-200 dark:border-neutral-900"
        >
          <h1 class={"w-[50px] center flex mr-4 ml-4 font-bold text-[16px]"}>
            评论
          </h1>
          <NTabs
            size="medium"
            animated
            class={"ml-4 files-tab"}
            value={tabValue.value}
            tab-class={"!text-sm"}
            onUpdateValue={(e) => {
              router
                .replace({ name: RouteName.Comment, query: { state: e } })
                .then(() => {
                  tabValue.value = e;
                });
            }}
          >
            <NTabPane name={CommentType.Pending} tab="未读" class={"!p-0"} />

            <NTabPane name={CommentType.Marked} tab="已读" class={"!p-0"} />

            <NTabPane name={CommentType.Trash} tab="垃圾" class={"!p-0"} />
          </NTabs>
        </div>
        <div class="flex mt-16">
          <>
            <Table
              maxWidth={600}
              data={data}
              loading={loading.value}
              onFetchData={fetchData}
              pager={pager}
              onUpdateCheckedRowKeys={(keys) => {
                checkedRowKeys.value = keys;
              }}
              columns={[
                {
                  type: "selection",
                  options: ["none", "all"],
                  width: 50
                },
                ...columns
              ]}
            />
          </>

          {/* reply dialog */}
          <NModal
            transformOrigin="center"
            show={!!replyDialogShow.value}
            onUpdateShow={(s) => {
              if (!s) {
                replyDialogShow.value = s;
              }
            }}
          >
            {replyComment.value && (
              <NCard
                style="width: 500px;max-width: 90vw"
                headerStyle={{ textAlign: "center" }}
                title={`回复: ${replyComment.value.author}`}
              >
                <NForm onSubmit={onReplySubmit}>
                  <NFormItemRow label={`${replyComment.value.author} 说:`}>
                    <NCard
                      embedded
                      bordered
                      class={
                        "h-[100px] cursor-default overflow-auto !p-2 !px-4 !text-gray-500"
                      }
                      contentStyle={{ padding: "0" }}
                    >
                      <CommentMarkdownRender text={replyComment.value.text} />
                    </NCard>
                  </NFormItemRow>

                  <NFormItemRow label={"回复内容"}>
                    <NInput
                      ref={replyInputRef}
                      value={replyText.value}
                      type="textarea"
                      onInput={(e) => (replyText.value = e)}
                      autosize={{ minRows: 4, maxRows: 10 }}
                      onKeydown={handleKeyDown}
                    />
                  </NFormItemRow>

                  <div class="flex justify-between">
                    <NPopover
                      trigger={"click"}
                      placement={viewport.value.mobile ? "top-end" : "left"}
                    >
                      {{
                        trigger() {
                          return (
                            <NButton text class="text-[20px]">
                              <Icon>
                                <EmojiAddIcon />
                              </Icon>
                            </NButton>
                          );
                        },
                        default() {
                          return (
                            <NCard
                              style="max-width: 300px; max-height: 500px"
                              class={"overflow-auto"}
                              bordered={false}
                            >
                              <NSpace align="center" class={"!justify-between"}>
                                {KAOMOJI_LIST.map((kaomoji) => (
                                  <NButton
                                    text
                                    key={kaomoji}
                                    type="primary"
                                    onClick={() => {
                                      if (!replyInputRef.value) {
                                        return;
                                      }
                                      const $ta = unref(replyInputRef.value)
                                        .textareaElRef as HTMLTextAreaElement;
                                      $ta.focus();

                                      nextTick(() => {
                                        const start =
                                          $ta.selectionStart as number;
                                        const end = $ta.selectionEnd as number;
                                        const escapeKaomoji =
                                          markdownEscape(kaomoji);
                                        $ta.value = `${$ta.value.slice(
                                          0,
                                          Math.max(0, start)
                                        )} ${escapeKaomoji} ${$ta.value.substring(
                                          end,
                                          $ta.value.length
                                        )}`;
                                        replyText.value = $ta.value;
                                        nextTick(() => {
                                          const shouldMoveToPos =
                                            start + escapeKaomoji.length + 2;
                                          $ta.selectionStart = shouldMoveToPos;
                                          $ta.selectionEnd = shouldMoveToPos;

                                          $ta.focus();
                                        });
                                      });
                                    }}
                                  >
                                    {kaomoji}
                                  </NButton>
                                ))}
                              </NSpace>
                            </NCard>
                          );
                        }
                      }}
                    </NPopover>
                    <NSpace size={12} align="center" inline>
                      <NButton
                        type="primary"
                        onClick={onReplySubmit}
                        round
                        loading={requestLoading.value}
                      >
                        确定
                      </NButton>
                      <NButton
                        onClick={() => {
                          replyText.value = "";
                          replyDialogShow.value = false;
                        }}
                        round
                      >
                        取消
                      </NButton>
                    </NSpace>
                  </div>
                </NForm>
              </NCard>
            )}
          </NModal>
        </div>
      </div>
      <OffsetHeaderLayout className="space-x-2">
        <Fragment>
          {tabValue.value !== CommentType.Marked && (
            <RoundedIconButtonBase
              name="已读"
              className="bg-accent size-[28px]"
              disabled={checkedRowKeys.value.length === 0}
              icon={<i class="icon-[mingcute--check-line] size-4" />}
              onClick={() => {
                changeState(checkedRowKeys.value, CommentState.Read);
                checkedRowKeys.value.length = 0;
              }}
            />
          )}

          {tabValue.value !== CommentType.Trash && (
            <RoundedIconButtonBase
              name="标记为垃圾"
              className="size-[28px] bg-[#f0a020]"
              disabled={checkedRowKeys.value.length === 0}
              icon={<i class="icon-[mingcute--delete-line] size-4" />}
              variant="warning"
              onClick={() => {
                changeState(checkedRowKeys.value, CommentState.Junk);
                checkedRowKeys.value.length = 0;
              }}
            />
          )}
          <RoundedIconButtonBase
            name="删除"
            className="size-[28px]"
            icon={<i class="icon-[mingcute--recycle-line] size-4" />}
            variant="recycle"
            disabled={checkedRowKeys.value.length === 0}
            onClick={() => {
              dialog.warning({
                title: "警告",
                content: "你确定要删除多条评论？",
                negativeText: "确定",
                positiveText: "不确定",
                onNegativeClick: async () => {
                  await handleDelete(checkedRowKeys.value);
                  checkedRowKeys.value.length = 0;
                }
              });
            }}
          />
        </Fragment>
      </OffsetHeaderLayout>
    </>
  );
});

export default ManageComment;

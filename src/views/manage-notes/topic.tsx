import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { TrashIcon } from "~/components/icons";
import { useDataTableFetch } from "~/hooks/use-table";
import {
  NAvatar,
  NButton,
  NButtonGroup,
  NList,
  NListItem,
  NPagination,
  NPopconfirm,
  NThing
} from "naive-ui";
import { RESTManager } from "~/utils";
import { textToBigCharOrWord } from "~/utils/word";
import { useRoute, useRouter } from "vue-router";

import { Icon } from "@vicons/utils";

import { TopicDetail } from "./components/topic-detail";
import { TopicEditModal } from "./components/topic-modal";
import type { TopicModel } from "~/models/topic";
import type { PaginateResult } from "@mx-space/api-client";
import { OffsetHeaderLayout } from "~/layouts";
import { clsxm } from "~/utils/helper";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();

    watch(
      () => route.query.page,
      (page) => {
        if (!page) {
          fetchTopic(0);
        } else {
          fetchTopic(+page);
        }
      }
    );

    const {
      fetchDataFn: fetchTopic,
      data: topics,
      pager: pagination
    } = useDataTableFetch<TopicModel>(
      (topics, pagination) =>
        async (
          page = Number.parseInt(route.query.page as any) || 1,
          size = 20
        ) => {
          const res = await RESTManager.api.topics.get<
            PaginateResult<TopicModel>
          >({
            //@ts-ignore
            page,
            size
          });

          pagination.value = res.pagination;

          topics.value = res.data;

          return res;
        }
    );

    onMounted(() => fetchTopic());

    const editTopicId = ref("");
    const showTopicModal = ref(false);
    const handleAddTopic = () => {
      showTopicModal.value = true;
      editTopicId.value = "";
    };
    const handleCloseModal = () => {
      showTopicModal.value = false;
      editTopicId.value = "";
    };

    const handleDelete = async (id: string) => {
      await RESTManager.api.topics(id).delete();
      fetchTopic();
    };
    const handleEdit = (id: string) => {
      editTopicId.value = id;
      showTopicModal.value = true;
    };
    const uiStore = useStoreRef(UIStore);
    const isMobile = uiStore.viewport.value.mobile;
    return {
      pagination,
      topics,
      fetchTopic,
      handleAddTopic,
      editTopicId,
      showTopicModal,
      handleCloseModal,
      isMobile,
      handleSubmit(topic: TopicModel) {
        handleCloseModal();

        const index = topics.value.findIndex((item) => item.id === topic.id);
        if (-~index) {
          topics.value[index] = topic;
        } else {
          topics.value.push(topic);
        }
      },
      handleDelete,
      handleEdit,
      route,
      router
    };
  },
  render() {
    const {
      pagination,
      topics,
      router,
      route,
      editTopicId,
      showTopicModal,
      handleAddTopic,
      handleCloseModal,
      handleSubmit,
      handleEdit,
      handleDelete,
      isMobile
    } = this;

    return (
      <>
        <div class="relative">
          <div
            class={clsxm(
              "flex flex-wrap items-center justify-between pt-4 lg:mb-5"
            )}
          >
            <div class="flex items-center justify-between">
              <p class="flex items-center text-lg font-medium">
                {isMobile ? <div /> : <span>手记 · 专栏</span>}
              </p>
            </div>
          </div>
          <div class="pt-[6px]">
            <NList bordered class={"mb-4"}>
              {topics.map((topic) => (
                <NListItem key={topic.id}>
                  {{
                    prefix() {
                      return (
                        <NAvatar
                          data-src={topic.icon}
                          class={`mt-2 ${topic.icon && "!bg-transparent"}`}
                          circle
                          size={50}
                          src={topic.icon || undefined}
                        >
                          {topic.icon
                            ? undefined
                            : textToBigCharOrWord(topic.name)}
                        </NAvatar>
                      );
                    },
                    suffix() {
                      return (
                        <NButtonGroup>
                          <NButton round onClick={() => handleEdit(topic.id!)}>
                            编辑
                          </NButton>
                          <NPopconfirm
                            onPositiveClick={() => handleDelete(topic.id!)}
                          >
                            {{
                              default() {
                                return `确定删除「${topic.name}」？`;
                              },
                              trigger() {
                                return (
                                  <NButton circle tertiary type="error">
                                    <Icon>
                                      <TrashIcon />
                                    </Icon>
                                  </NButton>
                                );
                              }
                            }}
                          </NPopconfirm>
                        </NButtonGroup>
                      );
                    },
                    default() {
                      return (
                        <NThing description={topic.introduce}>
                          {{
                            header() {
                              return (
                                <>
                                  <div class={"inline-flex space-x-6 center"}>
                                    <h1>{topic.name}</h1>
                                    <span
                                      class={
                                        "text-zinc-800/70 dark:text-zinc-400/60 text-sm"
                                      }
                                    >
                                      {`${topic.slug}`}
                                    </span>
                                  </div>
                                </>
                              );
                            },
                            default() {
                              return topic.description;
                            },
                            footer() {
                              return <TopicDetail id={topic.id!} />;
                            }
                          }}
                        </NThing>
                      );
                    }
                  }}
                </NListItem>
              ))}
            </NList>
            {pagination && (
              <div class={"flex justify-end"}>
                <NPagination
                  page={pagination.currentPage}
                  onUpdatePage={(page) => {
                    router.replace({
                      query: { ...route.query, page },
                      params: { ...route.params }
                    });
                  }}
                  pageCount={pagination.totalPage}
                  pageSize={pagination.size}
                  showQuickJumper
                />
              </div>
            )}

            <TopicEditModal
              onClose={handleCloseModal}
              show={Boolean(showTopicModal || editTopicId)}
              id={editTopicId}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
        <OffsetHeaderLayout className="space-x-2">
          <>
            <RoundedIconButtonBase
              className="bg-accent"
              name={"添加"}
              onClick={handleAddTopic}
              icon={<i class="icon-[mingcute--add-line] text-white" />}
            />
          </>
        </OffsetHeaderLayout>
      </>
    );
  }
});

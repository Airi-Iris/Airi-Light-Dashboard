import {
  NAvatar,
  NButton,
  NButtonGroup,
  NCard,
  NEmpty,
  NList,
  NListItem,
  NModal,
  NPagination,
  NPopconfirm,
  NSelect,
  NSkeleton,
  NThing,
  NUploadDragger
} from "naive-ui";
import { useRouter } from "vue-router";
import type { NoteModel, Pager, PaginateResult } from "@mx-space/api-client";
import type { TopicModel } from "~/models/topic";
import type { PropType } from "vue";

import { Icon as NIcon } from "@vicons/utils";

import {
  PencilAltIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon
} from "~/components/icons";
import { IframePreviewButton } from "~/components/special-button/iframe-preview";
import { UploadWrapper } from "~/components/upload";
import { RESTManager } from "~/utils";
import { buildMarkdownRenderUrl } from "~/utils/endpoint";
import { textToBigCharOrWord } from "~/utils/word";

import { useMemoNoteList } from "../hooks/use-memo-note-list";

export const TopicDetail = defineComponent({
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const show = ref(false);

    const topic = ref<null | TopicModel>(null);
    const notes = ref<Pick<NoteModel, "id" | "title" | "nid" | "created">[]>(
      []
    );
    const notePagination = ref<Pager>();

    const loadingNotes = ref(true);

    const handleFetchDetail = async () => {
      show.value = true;
      const topicData = await RESTManager.api
        .topics(props.id)
        .get<TopicModel>();
      topic.value = topicData;

      await fetchTopicNotesWithPagination(topicData.id!);
    };

    const fetchTopicNotesWithPagination = async (
      topicId: string,
      page = 1,
      size = 5
    ) => {
      loadingNotes.value = true;
      const { data, pagination } = await RESTManager.api.notes
        .topics(topicId)
        .get<PaginateResult<Partial<NoteModel>>>({
          params: { page, size }
        });
      loadingNotes.value = false;
      notes.value = data as any;
      notePagination.value = pagination;
      return { data, pagination };
    };

    const handleRemoveTopicFromThisNote = async (noteId: string) => {
      await RESTManager.api.notes(noteId).patch({
        data: {
          topicId: null
        }
      });

      message.success("已移除文章的专栏引用");

      const index = notes.value.findIndex((note) => note.id === noteId);
      if (-~index) {
        notes.value.splice(index, 1);
      }
    };

    const router = useRouter();

    return () => (
      <>
        <NButton size="small" secondary onClick={handleFetchDetail}>
          <NIcon class={"mr-1"}>
            <SearchIcon />
          </NIcon>
          详情
        </NButton>

        <NModal
          show={show.value}
          closable
          onClose={() => {
            show.value = false;
          }}
          closeOnEsc
          onUpdateShow={(s) => {
            show.value = s;
          }}
        >
          {topic.value ? (
            <NCard
              closable
              role="dialog"
              class={"modal-card md"}
              title={`专栏 - ${topic.value.name}`}
              onClose={() => {
                show.value = false;
              }}
            >
              <NThing>
                {{
                  avatar() {
                    return (
                      <UploadWrapper
                        class={"p0"}
                        type="icon"
                        onFinish={(e) => {
                          const res = JSON.parse(
                            (e.event?.target as XMLHttpRequest).responseText
                          );
                          e.file.url = res.url;

                          topic.value &&
                            RESTManager.api
                              .topics(topic.value.id)
                              .patch({
                                data: {
                                  icon: res.url
                                }
                              })
                              .then(() => {
                                if (topic.value) {
                                  topic.value.icon = res.url;
                                }
                              });

                          return e.file;
                        }}
                        onError={(e) => {
                          try {
                            const res = JSON.parse(
                              (e.event?.target as XMLHttpRequest).responseText
                            );
                            message.warning(res.message);
                          } catch {}
                          return e.file;
                        }}
                      >
                        <NUploadDragger>
                          <NAvatar
                            size={60}
                            class="rounded-xl bg-transparent"
                            src={topic.value?.icon || undefined}
                          >
                            {topic.value?.icon
                              ? undefined
                              : textToBigCharOrWord(topic.value?.name)}
                          </NAvatar>
                        </NUploadDragger>
                      </UploadWrapper>
                    );
                  },

                  header() {
                    return <b>{topic.value?.name}</b>;
                  },

                  "header-extra": function () {
                    return (
                      <span class={"opacity-80"}>{topic.value?.slug}</span>
                    );
                  },
                  description() {
                    return (
                      <p class={"clamp-2 break-all opacity-90"}>
                        {topic.value?.introduce}
                      </p>
                    );
                  },
                  default() {
                    return <p>{topic.value?.description}</p>;
                  }
                }}
              </NThing>
              {loadingNotes.value && notes.value.length == 0 ? (
                <NSkeleton animated class="mt-2 h-[350px]" />
              ) : (
                <div class={"mt-4"}>
                  <p class="flex items-center justify-between">
                    <strong>包含的文章：</strong>
                    <AddNoteToThisTopicButton
                      topicId={topic.value.id!}
                      onSuccess={() => {
                        nextTick(() => handleFetchDetail());
                      }}
                    />
                  </p>
                  {notes.value.length === 0 && (
                    <div class={"flex h-[300px] items-center justify-center"}>
                      <NEmpty description="这里还没有任何内容" />
                    </div>
                  )}
                  <NList bordered class={"mt-2"}>
                    {notes.value.map((note) => (
                      <NListItem key={note.id}>
                        {{
                          default() {
                            return (
                              <p class="flex items-center space-x-2">
                                <span>{note.title}</span>
                                <IframePreviewButton
                                  path={buildMarkdownRenderUrl(note.id)}
                                />
                              </p>
                            );
                          },
                          suffix() {
                            return (
                              <NButtonGroup>
                                <NButton
                                  circle
                                  tertiary
                                  type="primary"
                                  onClick={() => {
                                    router.push({
                                      path: `/notes/edit`,
                                      query: {
                                        id: note.id
                                      }
                                    });
                                  }}
                                >
                                  <NIcon>
                                    <PencilAltIcon />
                                  </NIcon>
                                </NButton>
                                <NPopconfirm
                                  onPositiveClick={() =>
                                    handleRemoveTopicFromThisNote(note.id)
                                  }
                                >
                                  {{
                                    trigger() {
                                      return (
                                        <NButton circle tertiary type="error">
                                          <NIcon>
                                            <TrashIcon />
                                          </NIcon>
                                        </NButton>
                                      );
                                    },
                                    default() {
                                      return `是否移除此话题「${topic.value?.name}」？`;
                                    }
                                  }}
                                </NPopconfirm>
                              </NButtonGroup>
                            );
                          }
                        }}
                      </NListItem>
                    ))}
                  </NList>

                  <div class={"flex justify-end"}>
                    {notePagination.value && (
                      <NPagination
                        class={"mt-4"}
                        onUpdatePage={(page) => {
                          fetchTopicNotesWithPagination(props.id, page);
                        }}
                        page={notePagination.value.currentPage}
                        pageCount={notePagination.value.totalPage}
                      />
                    )}
                  </div>
                </div>
              )}
            </NCard>
          ) : (
            <NCard class={"modal-card md"} role="dialog" title="专栏信息获取中">
              <div class={"relative flex gap-2 "}>
                <NSkeleton animated circle width={60} />
                <div class={"flex-grow"}>
                  <NSkeleton animated text repeat={3} class="flex-grow" />
                </div>
              </div>

              <NSkeleton animated repeat={2} class="mt-2" text />
            </NCard>
          )}
        </NModal>
      </>
    );
  }
});

const AddNoteToThisTopicButton = defineComponent({
  props: {
    topicId: {
      type: String,
      required: true
    },
    onSuccess: {
      type: Function as PropType<(noteIds: string[]) => void>,
      required: false
    }
  },
  setup(props) {
    const modalShow = ref(false);
    const handleAddNoteToThisTopic = async () => {
      const notesId = unref(selectNoteIds);

      await Promise.all(
        notesId.map((noteId) => {
          return RESTManager.api.notes(noteId).patch({
            data: {
              topicId: props.topicId
            }
          });
        })
      );
      message.success("添加成功");
      modalShow.value = false;
      props.onSuccess?.(notesId);
    };
    const {
      refresh,
      fetchNext,
      datalist: notes,
      loading: fetchingLoading
    } = useMemoNoteList();

    const selectNoteIds = ref<string[]>([]);

    const handleFetchNext = (e: Event) => {
      const currentTarget = e.currentTarget as HTMLElement;

      if (
        currentTarget.scrollTop + currentTarget.offsetHeight + 10 >=
        currentTarget.scrollHeight
      ) {
        fetchNext();
      }
    };

    onMounted(() => {
      if (notes.value.length === 0) {
        fetchNext();
      }
    });
    return () => (
      <>
        <NButton
          secondary
          type="primary"
          circle
          onClick={() => {
            modalShow.value = true;
          }}
        >
          <NIcon>
            <PlusIcon />
          </NIcon>
        </NButton>

        <NModal
          closable
          closeOnEsc
          show={modalShow.value}
          onUpdateShow={(s) => {
            modalShow.value = s;
          }}
        >
          <NCard title="哪些文章需要添加到专栏？" class={"modal-card sm"}>
            {{
              footer() {
                return (
                  <div class={"text-right"}>
                    <NButton
                      round
                      type="primary"
                      onClick={() => handleAddNoteToThisTopic()}
                    >
                      添加！
                    </NButton>
                  </div>
                );
              },
              default() {
                return (
                  <NSelect
                    maxTagCount={3}
                    filterable
                    clearable
                    loading={fetchingLoading.value}
                    multiple
                    onClear={() => {
                      refresh();
                    }}
                    value={selectNoteIds.value}
                    onUpdateValue={(values) => {
                      selectNoteIds.value = values;
                    }}
                    resetMenuOnOptionsChange={false}
                    options={notes.value.map((note) => ({
                      label: note.title,
                      value: note.id,
                      key: note.id
                    }))}
                    onScroll={handleFetchNext}
                  />
                );
              }
            }}
          </NCard>
        </NModal>
      </>
    );
  }
});

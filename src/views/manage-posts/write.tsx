import { WEB_URL } from "~/constants/env";
import { HeaderActionButtonWithDesc } from "~/components/button/rounded-button";
import { TextBaseDrawer } from "~/components/drawer/text-base-drawer";
import { SlidersHIcon } from "~/components/icons";
import { UnderlineInput } from "~/components/input/underline-input";
import { ParseContentButton } from "~/components/special-button/parse-content";
import { CrossBellConnectorIndirector } from "~/components/xlog-connect";
import { useStoreRef } from "~/hooks/use-store-ref";
import { isString, uniqueId } from "lodash-es";
import {
  NDatePicker,
  NDynamicTags,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NSwitch,
  SelectProps,
  useMessage
} from "naive-ui";
import { RouteName } from "~/router/name";
import { CategoryStore } from "~/stores/category";
import { RESTManager } from "~/utils/rest";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRaw
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { Icon } from "@vicons/utils";

import { AiHelperButton } from "~/components/ai/ai-helper";
import { Editor } from "~/components/editor/universal";
import {
  HeaderPreviewButton,
  PreviewSplitter
} from "~/components/special-button/preview";
import { EmitKeyMap } from "~/constants/keys";

import { useMemoPostList } from "./hooks/use-memo-post-list";
import type { WriteBaseType } from "~/shared/types/base";
import type { SelectMixedOption } from "naive-ui/lib/select/src/interface";
import type { PostModel } from "~/models/post";
import type { CategoryModel, TagModel } from "~/models/category";
import { EditorLayer } from "~/layouts/content/EditorLayer";
import { AdvancedInput } from "~/components/input/AdvancedInput";
import {
  SidebarSection,
  SidebarWrapper
} from "~/components/editor/writing/SidebarBase";
import { UIStore } from "~/stores/ui";
import { clsxm } from "~/utils/helper";
import { SidebarAddition } from "~/components/editor/writing/SidebarAddition";
import { CopyTextButton } from "~/components/special-button/copy-text-button";

type PostReactiveType = WriteBaseType & {
  slug: string;
  categoryId: string;
  copyright: boolean;
  tags: string[];
  summary: string;
  pinOrder: number;
  pin: boolean;
  relatedId: string[];
};

const selectionOverrides: NonNullable<SelectProps["themeOverrides"]> = {
  peers: {
    InternalSelection: {
      borderRadius: "0.5rem",
      color: "transparent"
    }
  }
};

const PostWriteView = defineComponent(() => {
  const uiStore = useStoreRef(UIStore);
  const isMobile = uiStore.viewport.value.mobile;

  const route = useRoute();

  const categoryStore = useStoreRef(CategoryStore);
  onMounted(async () => {
    await categoryStore.fetch();
  });

  const resetReactive: () => PostReactiveType = () => ({
    categoryId: categoryStore.data?.value?.[0].id ?? "",
    slug: "",
    text: "",
    title: "",
    copyright: true,
    tags: [],

    summary: "",

    allowComment: true,
    id: undefined,
    images: [],
    meta: undefined,
    pin: false,
    pinOrder: 1,
    relatedId: [],
    created: undefined
  });

  const parsePayloadIntoReactiveData = (payload: PostModel) => {
    const raw = toRaw(data);
    const keys = Object.keys(raw);
    for (const k in payload) {
      if (keys.includes(k)) {
        data[k] = payload[k];
      }
    }
  };

  const postListState = useMemoPostList();

  const data = reactive<PostReactiveType>(resetReactive());
  const id = computed(() => route.query.id);

  // const currentSelectCategoryId = ref('')
  const category = computed(
    () =>
      categoryStore.get(data.categoryId) ||
      categoryStore.data?.value?.[0] ||
      ({} as CategoryModel)
  );

  onMounted(async () => {
    const $id = id.value;
    if ($id && typeof $id == "string") {
      const payload = (await RESTManager.api.posts($id).get()) as any;

      // HACK: transform
      payload.data.relatedId =
        payload.data.related?.map((r: any) => r.id) || [];
      postListState.append(payload.data.related);

      parsePayloadIntoReactiveData(payload.data as PostModel);
    }
  });

  onMounted(async () => {
    if (postListState.loading.value && !isMobile) {
      await postListState.fetchNext();
    }
  });

  const drawerShow = ref(false);

  const message = useMessage();
  const router = useRouter();

  const handleSubmit = async () => {
    const payload = {
      ...data,
      categoryId: category.value.id,
      summary:
        data.summary && data.summary.trim() != "" ? data.summary.trim() : null
    };

    const { CrossBellConnector } = await import(
      "~/components/xlog-connect/class"
    );

    if (id.value) {
      // update
      if (!isString(id.value)) {
        return;
      }
      const $id = id.value as string;
      const response = await RESTManager.api.posts($id).put<PostModel>({
        data: payload
      });
      message.success("修改成功");
      await CrossBellConnector.createOrUpdate(response);
    } else {
      // create
      const response = await RESTManager.api.posts.post<PostModel>({
        data: payload
      });
      message.success("发布成功");
      await CrossBellConnector.createOrUpdate(response);
    }

    router.push({ name: RouteName.ViewPost, hash: "|publish" });
  };
  const handleOpenDrawer = () => {
    drawerShow.value = true;

    if (postListState.loading.value) {
      postListState.fetchNext();
    }
  };
  const handleFetchNext = (e: Event) => {
    const currentTarget = e.currentTarget as HTMLElement;

    if (
      currentTarget.scrollTop + currentTarget.offsetHeight + 10 >=
      currentTarget.scrollHeight
    ) {
      postListState.fetchNext();
    }
  };

  onBeforeUnmount(() => {
    postListState.refresh();
  });

  watch(
    () => data,
    () => {
      window.dispatchEvent(new CustomEvent(EmitKeyMap.EditDataUpdate));
    },
    { deep: true }
  );
  const lId = uniqueId(":l").concat(":");
  return () => (
    <>
      <EditorLayer
        title={id.value ? `编辑「${data.title}」` : "撰写新文章"}
        headerClass="pt-4"
        actionsElement={
          <>
            <div class="shrink grow" />
            <div class="flex grow-0 items-center gap-4">
              <div class="flex gap-2">
                <ParseContentButton
                  data={data}
                  onHandleYamlParsedMeta={(meta) => {
                    // TODO: other meta field attach to data
                    const { title, slug, ...rest } = meta;
                    data.title = title ?? data.title;
                    data.slug = slug ?? data.slug;

                    data.meta = { ...rest };
                  }}
                />

                <HeaderPreviewButton getData={() => ({ ...data })} iframe />
              </div>
              <HeaderActionButtonWithDesc
                icon={
                  <i class="icon-[mingcute--send-plane-line] size-[16px]" />
                }
                variant="primary"
                description="发布"
                onClick={handleSubmit}
              />
            </div>
          </>
        }
        contentElement={
          <>
            <AdvancedInput
              label="标题"
              labelPlacement="inside"
              labelClassNames="text-xs"
              inputClassNames="text-base font-medium"
              value={data.title}
              onChange={(e) => {
                data.title = e;
              }}
            />

            <div class={"my-3 flex items-center pl-2 text-sm text-gray-500"}>
              <label class="prefix text-base-content" id={lId}>
                地址：{`${WEB_URL}/posts/${category.value.slug}/`}
              </label>
              <UnderlineInput
                id={lId}
                value={data.slug}
                onChange={(e) => {
                  data.slug = e;
                }}
              />

              {!!data.slug && (
                <CopyTextButton
                  text={`${WEB_URL}/posts/${category.value.slug}/${data.slug}`}
                />
              )}

              {(!data.title || !data.slug) && data.text.length > 0 && (
                <AiHelperButton reactiveData={data} />
              )}
            </div>

            <CrossBellConnectorIndirector />
            <PreviewSplitter>
              <Editor
                key={data.id}
                loading={!!(id.value && typeof data.id == "undefined")}
                onChange={(v) => {
                  data.text = v;
                }}
                text={data.text}
              />
            </PreviewSplitter>
          </>
        }
        sidebarElement={
          <>
            <div class="hidden flex-col lg:flex">
              <SidebarWrapper>
                <SidebarSection label="分类">
                  <NSelect
                    placeholder="请选择"
                    value={category.value.id}
                    onUpdateValue={(e) => {
                      data.categoryId = e;
                    }}
                    options={
                      categoryStore.data.value?.map((i) => ({
                        label: i.name,
                        value: i.id,
                        key: i.id
                      })) || []
                    }
                    themeOverrides={selectionOverrides}
                  />
                </SidebarSection>
                <SidebarSection label="标签">
                  <NDynamicTags
                    value={data.tags}
                    onUpdateValue={(e) => {
                      data.tags.length = 0;
                      data.tags.push(...e);
                    }}
                  >
                    {{
                      input({ submit }) {
                        const Component = defineComponent({
                          setup() {
                            const tags = ref([] as SelectMixedOption[]);
                            const loading = ref(false);
                            const value = ref("");
                            const selectRef = ref();
                            onMounted(async () => {
                              loading.value = true;
                              // HACK auto focus
                              if (selectRef.value) {
                                selectRef.value.$el
                                  .querySelector("input")
                                  .focus();
                              }
                              const { data } =
                                await RESTManager.api.categories.get<{
                                  data: TagModel[];
                                }>({
                                  params: { type: "Tag" }
                                });
                              tags.value = data.map((i) => ({
                                label: `${i.name} (${i.count})`,
                                value: i.name,
                                key: i.name
                              }));
                              loading.value = false;
                            });
                            return () => (
                              <NSelect
                                ref={selectRef}
                                size={"small"}
                                value={value.value}
                                clearable
                                loading={loading.value}
                                filterable
                                tag
                                options={tags.value}
                                onUpdateValue={(e) => {
                                  void (value.value = e);
                                  submit(e);
                                }}
                              />
                            );
                          }
                        });

                        return <Component />;
                      },
                      trigger(e) {
                        const AddIcon = defineComponent({
                          setup() {
                            return () => (
                              <button onClick={e.activate}>
                                <div
                                  class={clsxm(
                                    "border-foreground-400/80 flex size-6 items-center justify-center rounded-full border border-dashed",
                                    "hover:text-accent hover:border-accent transition-colors ease-in-out duration-300"
                                  )}
                                >
                                  <i class="icon-[mingcute--add-line] size-3" />
                                </div>
                              </button>
                            );
                          }
                        });
                        return <AddIcon />;
                      }
                    }}
                  </NDynamicTags>
                </SidebarSection>
                <SidebarSection label="关联阅读">
                  <NSelect
                    maxTagCount={3}
                    filterable
                    clearable
                    loading={postListState.loading.value}
                    multiple
                    onClear={() => {
                      postListState.refresh();
                    }}
                    value={data.relatedId}
                    onUpdateValue={(values) => {
                      data.relatedId = values;
                    }}
                    resetMenuOnOptionsChange={false}
                    options={postListState.datalist.value.map((item) => ({
                      label: item.title,
                      value: item.id,
                      key: item.id,
                      disabled: item.id == data.id
                    }))}
                    onScroll={handleFetchNext}
                    themeOverrides={selectionOverrides}
                  />
                </SidebarSection>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    版权信息
                  </label>
                  <NSwitch
                    value={data.copyright}
                    onUpdateValue={(e) => void (data.copyright = e)}
                  />
                </div>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    置顶
                  </label>
                  <NSwitch
                    value={!!data.pin}
                    onUpdateValue={(e) => {
                      data.pin = e;

                      if (!e) {
                        data.pinOrder = 1;
                      }
                    }}
                  />
                </div>
                <div
                  class={clsxm(
                    "flex items-center justify-between space-x-2 text-[1em] max-height-transition-05",
                    //TODO: try another way to add transition effect
                    !data.pin ? "hidden" : ""
                  )}
                >
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    置顶顺序
                  </label>
                  <NInputNumber
                    disabled={!data.pin}
                    value={data.pinOrder}
                    onUpdateValue={(e) => void (data.pinOrder = e || 1)}
                    themeOverrides={{
                      peers: {
                        Input: {
                          borderRadius: "0.5rem"
                        }
                      }
                    }}
                  />
                </div>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    允许评论
                  </label>
                  <NSwitch
                    value={data.allowComment}
                    onUpdateValue={(e) => void (data.allowComment = e)}
                  />
                </div>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    自定义创建时间
                  </label>
                  <NDatePicker
                    clearable
                    isDateDisabled={(ts: number) => {
                      return ts > Date.now();
                    }}
                    type="datetime"
                    value={
                      data.created
                        ? new Date(data.created).getTime()
                        : undefined
                    }
                    onUpdateValue={(e) => {
                      const value = e ? new Date(e).toISOString() : undefined;
                      data.created = value;
                    }}
                    themeOverrides={{
                      peers: {
                        Input: {
                          borderRadius: "0.5rem",
                          color: "transparent"
                        }
                      }
                    }}
                  />
                </div>
                <SidebarSection label="摘要">
                  <NInput
                    class="rounded-md"
                    type="textarea"
                    autosize={{
                      minRows: 2,
                      maxRows: 4
                    }}
                    placeholder="文章摘要"
                    value={data.summary}
                    onInput={(e) => void (data.summary = e)}
                  />
                </SidebarSection>
                <SidebarAddition data={data} />
              </SidebarWrapper>
            </div>
          </>
        }
        footerButtonElement={
          <>
            <button
              onClick={handleOpenDrawer}
              class={isMobile ? "" : "!hidden"}
            >
              <Icon>
                <SlidersHIcon />
              </Icon>
            </button>
          </>
        }
      >
        {/* Drawer  */}
        {isMobile && (
          <TextBaseDrawer
            show={drawerShow.value}
            onUpdateShow={(s) => {
              drawerShow.value = s;
            }}
            data={data}
          >
            <NFormItem label="分类" required path="category">
              <NSelect
                placeholder="请选择"
                value={category.value.id}
                onUpdateValue={(e) => {
                  data.categoryId = e;
                }}
                options={
                  categoryStore.data.value?.map((i) => ({
                    label: i.name,
                    value: i.id,
                    key: i.id
                  })) || []
                }
              />
            </NFormItem>

            <NFormItem label="标签">
              <NDynamicTags
                value={data.tags}
                onUpdateValue={(e) => {
                  data.tags.length = 0;
                  data.tags.push(...e);
                }}
              >
                {{
                  input({ submit }) {
                    const Component = defineComponent({
                      setup() {
                        const tags = ref([] as SelectMixedOption[]);
                        const loading = ref(false);
                        const value = ref("");
                        const selectRef = ref();
                        onMounted(async () => {
                          loading.value = true;
                          // HACK auto focus
                          if (selectRef.value) {
                            selectRef.value.$el.querySelector("input").focus();
                          }
                          const { data } =
                            await RESTManager.api.categories.get<{
                              data: TagModel[];
                            }>({
                              params: { type: "Tag" }
                            });
                          tags.value = data.map((i) => ({
                            label: `${i.name} (${i.count})`,
                            value: i.name,
                            key: i.name
                          }));
                          loading.value = false;
                        });
                        return () => (
                          <NSelect
                            ref={selectRef}
                            size={"small"}
                            value={value.value}
                            clearable
                            loading={loading.value}
                            filterable
                            tag
                            options={tags.value}
                            onUpdateValue={(e) => {
                              void (value.value = e);
                              submit(e);
                            }}
                          />
                        );
                      }
                    });

                    return <Component />;
                  }
                }}
              </NDynamicTags>
            </NFormItem>

            <NFormItem label="关联阅读">
              <NSelect
                maxTagCount={3}
                filterable
                clearable
                loading={postListState.loading.value}
                multiple
                onClear={() => {
                  postListState.refresh();
                }}
                value={data.relatedId}
                onUpdateValue={(values) => {
                  data.relatedId = values;
                }}
                resetMenuOnOptionsChange={false}
                options={postListState.datalist.value.map((item) => ({
                  label: item.title,
                  value: item.id,
                  key: item.id,
                  disabled: item.id == data.id
                }))}
                onScroll={handleFetchNext}
              />
            </NFormItem>

            <NFormItem label="摘要">
              <NInput
                type="textarea"
                autosize={{
                  minRows: 2,
                  maxRows: 4
                }}
                placeholder="文章摘要"
                value={data.summary}
                onInput={(e) => void (data.summary = e)}
              />
            </NFormItem>

            <NFormItem
              label="版权注明"
              labelAlign="right"
              labelPlacement="left"
            >
              <NSwitch
                value={data.copyright}
                onUpdateValue={(e) => void (data.copyright = e)}
              />
            </NFormItem>

            <NFormItem label="置顶" labelAlign="right" labelPlacement="left">
              <NSwitch
                value={!!data.pin}
                onUpdateValue={(e) => {
                  data.pin = e;

                  if (!e) {
                    data.pinOrder = 1;
                  }
                }}
              />
            </NFormItem>

            <NFormItem
              label="置顶顺序"
              labelAlign="right"
              labelPlacement="left"
            >
              <NInputNumber
                disabled={!data.pin}
                value={data.pinOrder}
                onUpdateValue={(e) => void (data.pinOrder = e || 1)}
              />
            </NFormItem>
          </TextBaseDrawer>
        )}
      </EditorLayer>
    </>
  );
});

export default PostWriteView;

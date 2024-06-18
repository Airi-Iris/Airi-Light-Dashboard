import {
  NBadge,
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItemRow,
  NH4,
  NInput,
  NModal,
  NPopconfirm,
  NSpace,
  NTag,
  useMessage
} from "naive-ui";
import { defineComponent, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import type { TagModel } from "~/models/category";
import type { PostModel } from "~/models/post";
import type { Ref } from "vue";

import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { tableRowStyle } from "~/components/table";
import { useStoreRef } from "~/hooks/use-store-ref";
import { CategoryStore } from "~/stores/category";
import { RESTManager } from "~/utils/rest";
import { OffsetHeaderLayout } from "~/layouts";
import { clsxm } from "~/utils/helper";

export const CategoryView = defineComponent((props) => {
  const categoryStore = useStoreRef(CategoryStore);

  const tags = reactive<TagModel[]>([]);
  const loading = ref(true);
  const fetchCategory = categoryStore.fetch;

  const message = useMessage();
  onMounted(async () => {
    loading.value = true;
    await fetchCategory();
    loading.value = false;
    const { data: $tags } = (await RESTManager.api.categories.get({
      params: { type: "tag" }
    })) as any;

    tags.push(...$tags);
  });

  const checkedTag = ref("");
  const checkedTagPosts = reactive<PostModel[]>([]);

  watch(
    () => checkedTag.value,
    async (name) => {
      if (!name) {
        return;
      }
      const res = (await RESTManager.api
        .categories(name)
        .get({ params: { tag: "true" } })) as any;
      checkedTagPosts.length = 0;
      checkedTagPosts.push(...res.data);
    }
  );

  const showDialog = ref<boolean | string>(false);
  const resetState = () => ({ name: "", slug: "" });
  const editCategoryState = ref<CategoryState>(resetState());
  return () => (
    <>
      <div class={"relative"}>
        <div
          class={clsxm(
            "flex flex-wrap items-center justify-between pt-4 lg:mb-5"
          )}
        >
          <div class="flex items-center justify-between">
            <p class="flex items-center text-lg font-medium">
              <span>文稿 · 分类 / 标签</span>
            </p>
          </div>
        </div>
        <div class="pt-[6px]">
          <NH4 prefix="bar" class={"text-zinc-600"}>
            分类
          </NH4>

          {/* Action */}
          <EditCategoryDialog
            show={showDialog}
            onSubmit={async (state) => {
              const { name, slug } = state;
              const id =
                typeof showDialog.value == "string" ? showDialog.value : null;
              if (!id) {
                const payload = (await RESTManager.api.categories.post({
                  data: {
                    name,
                    slug
                  }
                })) as any;
                message.success("创建成功");
                categoryStore.data.value!.push(payload.data);
              } else {
                await RESTManager.api.categories(id).put({
                  data: {
                    name,
                    slug,
                    type: 0
                  }
                });

                message.success("修改成功");

                const index = categoryStore.data.value!.findIndex(
                  (i) => i.id == id
                );
                categoryStore.data.value![index] = {
                  ...categoryStore.data.value![index],
                  ...state
                };
              }
            }}
            initialState={editCategoryState.value}
          />

          <NDataTable
            rowClassName={() => tableRowStyle}
            bordered={false}
            data={categoryStore.data.value || []}
            remote
            loading={loading.value}
            columns={[
              { title: "名称", key: "name", width: 100 },
              { title: "文章数", key: "count", width: 100 },
              { title: "路径", key: "slug", width: 180 },
              {
                width: 100,
                title: "操作",
                fixed: "right",
                key: "id",
                render(row) {
                  return (
                    <NSpace size={12}>
                      <NButton
                        size="tiny"
                        quaternary
                        type="primary"
                        onClick={(e) => {
                          editCategoryState.value = {
                            name: row.name,
                            slug: row.slug
                          };

                          showDialog.value = row.id;
                        }}
                      >
                        编辑
                      </NButton>

                      <NPopconfirm
                        positiveText={"取消"}
                        negativeText="删除"
                        onNegativeClick={async () => {
                          await RESTManager.api.categories(row.id).delete();
                          message.success("删除成功");
                          await categoryStore.fetch(true);
                        }}
                      >
                        {{
                          trigger: () => (
                            <NButton quaternary type="error" size="tiny">
                              移除
                            </NButton>
                          ),

                          default: () => (
                            <span class="max-w-48">
                              确定要删除 {row.title} ?
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

          <NH4 prefix="bar" class={"text-zinc-600"}>
            标签
          </NH4>
          <NSpace size={12}>
            {tags.map((tag) => {
              return (
                <NBadge value={tag.count} key={tag.name}>
                  <NTag
                    class="border border-gray-200 rounded-md"
                    type="primary"
                    checkable
                    bordered
                    round
                    checked={checkedTag.value == tag.name}
                    onUpdateChecked={(check) => {
                      if (check) {
                        checkedTag.value = tag.name;
                      }
                    }}
                  >
                    {tag.name}
                  </NTag>
                </NBadge>
              );
            })}
          </NSpace>

          {checkedTagPosts.length != 0 && (
            <NDataTable
              remote
              class="mt-4"
              data={checkedTagPosts}
              columns={[
                {
                  title: "标题",
                  key: "title",
                  render(row) {
                    return (
                      <RouterLink to={`/posts/edit?id=${row.id}`}>
                        <NButton type="primary" quaternary>
                          {row.title}
                        </NButton>
                      </RouterLink>
                    );
                  }
                },
                {
                  title: "分类",
                  key: "category",
                  render(row) {
                    return row.category.name;
                  }
                }
              ]}
            />
          )}
        </div>
        <OffsetHeaderLayout>
          <RoundedIconButtonBase
            className="bg-accent"
            name={"添加分类/标签"}
            onClick={() => {
              showDialog.value = true;
              editCategoryState.value = resetState();
            }}
            icon={<i class="icon-[mingcute--add-line] text-white" />}
          />
        </OffsetHeaderLayout>
      </div>
    </>
  );
});

type CategoryState = {
  name: string;
  slug: string;
};
const EditCategoryDialog = defineComponent<{
  initialState?: CategoryState;
  onSubmit: (state: CategoryState) => void;
  show: Ref<boolean | string>;
}>((props) => {
  const state = reactive<CategoryState>(
    props.initialState ?? { name: "", slug: "" }
  );

  watch(
    () => props.initialState,
    (n) => {
      if (n) {
        state.name = n.name;
        state.slug = n.slug;
      }
    }
  );
  const message = useMessage();
  const onSubmit = () => {
    if (!state.name || !state.slug) {
      message.error("名字 和 路径 不能为空");
      return;
    }
    props.onSubmit(state);
    props.show.value = false;
  };

  return () => (
    <NModal
      transformOrigin="center"
      show={!!props.show.value}
      onUpdateShow={(s) => {
        props.show.value = s;
      }}
    >
      {{
        default: () => (
          <NCard
            style="width: 500px;max-width: 90vw"
            headerStyle={{ textAlign: "center" }}
            title={props.initialState ? "编辑" : "新建"}
          >
            <NForm
              onSubmit={onSubmit}
              model={state}
              rules={{
                name: {
                  required: true,
                  trigger: ["input", "blur"]
                },
                slug: {
                  required: true,
                  trigger: ["input", "blur"]
                }
              }}
            >
              <NFormItemRow path="name" label="名字">
                <NInput
                  placeholder=""
                  onInput={(e) => {
                    state.name = e;
                  }}
                  value={state.name}
                />
              </NFormItemRow>

              <NFormItemRow path="slug" label="路径">
                <NInput
                  placeholder=""
                  onInput={(e) => {
                    state.slug = e;
                  }}
                  value={state.slug}
                />
              </NFormItemRow>

              <div class="text-center">
                <NSpace size={12} align="center" inline>
                  <NButton type="primary" onClick={onSubmit} round>
                    确定
                  </NButton>
                  <NButton onClick={() => (props.show.value = false)} round>
                    取消
                  </NButton>
                </NSpace>
              </div>
            </NForm>
          </NCard>
        )
      }}
    </NModal>
  );
});

(EditCategoryDialog as any).props = [
  "initialState",
  "onSubmit",
  "show"
] as const;

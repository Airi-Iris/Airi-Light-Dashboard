import {
  HeaderActionButtonWithDesc,
  RoundedIconButtonBase
} from "~/components/button/rounded-button";
import { SentenceType, fetchHitokoto } from "~/external/api/hitokoto";
import { useParsePayloadIntoData } from "~/hooks/use-parse-payload";
import { isString, transform } from "lodash-es";
import { NCard, NForm, NFormItem, NInput, useDialog } from "naive-ui";
import { RouteName } from "~/router/name";
import { RESTManager } from "~/utils";
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRaw
} from "vue";
import { useRoute, useRouter } from "vue-router";
import type { SayModel } from "~/models/say";
import { OffsetHeaderLayout } from "~/layouts";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";

type SayReactiveType = {
  text: string;
  source: string;
  author: string;
};

const EditSay = defineComponent({
  setup() {
    const route = useRoute();
    const router = useRouter();

    const uiStore = useStoreRef(UIStore);
    const isMobile = ref(uiStore.viewport.value.mobile);

    const resetReactive: () => SayReactiveType = () => ({
      text: "",
      author: "",
      source: ""
    });

    const placeholder = ref({} as SayModel);

    onBeforeMount(() => {
      fetchHitokoto([
        SentenceType.原创,
        SentenceType.哲学,
        SentenceType.文学,
        SentenceType.诗词
      ]).then((data) => {
        placeholder.value = {
          source: data.from,
          text: data.hitokoto,
          author: data.from_who || data.creator
        };
      });
    });
    const dialog = useDialog();
    const handlePostHitokoto = async () => {
      const send = async () => {
        await RESTManager.api.says.post({
          data: placeholder.value
        });
        message.success("发布成功");
        router.push({ name: RouteName.ListSay });
      };
      if (data.text || data.author || data.source) {
        dialog.create({
          title: "警告",
          content: "发布一言会覆盖现有的内容，要继续吗",
          type: "warning",
          negativeText: "取消",
          positiveText: "确定",

          onPositiveClick() {
            send();
          }
        });
      } else {
        send();
      }
    };

    const parsePayloadIntoReactiveData = (payload: SayModel) =>
      useParsePayloadIntoData(data)(payload);
    const data = reactive<SayReactiveType>(resetReactive());
    const id = computed(() => route.query.id);

    onMounted(async () => {
      const $id = id.value;
      if ($id && typeof $id == "string") {
        const payload = (await RESTManager.api.says($id).get({})) as any;

        const data = payload.data;
        parsePayloadIntoReactiveData(data as SayModel);
      }
    });

    const handleSubmit = async () => {
      const parseDataToPayload = (): { [key in keyof SayModel]?: any } => {
        try {
          if (!data.text || data.text.trim().length == 0) {
            throw "内容为空";
          }

          return {
            ...transform(
              toRaw(data),
              (res, v, k) => (
                (res[k] =
                  typeof v == "undefined"
                    ? null
                    : typeof v == "string" && v.length == 0
                      ? ""
                      : v),
                res
              )
            ),
            text: data.text.trim()
          };
        } catch (error) {
          message.error(error as any);

          throw error;
        }
      };
      if (id.value) {
        // update
        if (!isString(id.value)) {
          return;
        }
        const $id = id.value as string;
        await RESTManager.api.says($id).put({
          data: parseDataToPayload()
        });
        message.success("修改成功");
      } else {
        // create
        await RESTManager.api.says.post({
          data: parseDataToPayload()
        });
        message.success("发布成功");
      }

      router.push({ name: RouteName.ListSay });
    };

    return () => (
      <>
        <OffsetHeaderLayout className="space-x-2">
          <Fragment>
            {isString(id) ? (
              <RoundedIconButtonBase
                name="更新"
                className="bg-[#2080f0] dark:bg-[#1668dc]"
                onClick={handleSubmit}
                icon={<i class="icon-[mingcute--send-plane-line]" />}
              />
            ) : (
              <>
                <RoundedIconButtonBase
                  name="发布一言"
                  onClick={handlePostHitokoto}
                  className="bg-[#2080f0] dark:bg-[#1668dc]"
                  icon={<i class="icon-[mingcute--chat-2-line]" />}
                />
                <RoundedIconButtonBase
                  name="发布自己说的"
                  onClick={handleSubmit}
                  className="bg-accent size-[30px]"
                  icon={<i class="icon-[mingcute--send-plane-line]" />}
                />
              </>
            )}
          </Fragment>
        </OffsetHeaderLayout>
        <NCard
          class={"mt-16 rounded-md"}
          headerExtra={() => {
            return !isMobile.value ? (
              <>
                <div class="shrink grow" />
                <div class="flex grow-0 items-center gap-4">
                  <div class="flex gap-2">
                    {isString(id) ? (
                      <HeaderActionButtonWithDesc
                        icon={
                          <i class="icon-[mingcute--send-plane-line] size-[16px]" />
                        }
                        variant="primary"
                        class="bg-[#2080f0] dark:bg-[#1668dc]"
                        description="更新"
                        onClick={handleSubmit}
                      />
                    ) : (
                      <>
                        <HeaderActionButtonWithDesc
                          icon={
                            <i class="icon-[mingcute--chat-2-line] size-[16px]" />
                          }
                          variant="secondary"
                          class="rounded-lg"
                          description="发布一言"
                          onClick={handlePostHitokoto}
                        />
                        <HeaderActionButtonWithDesc
                          icon={
                            <i class="icon-[mingcute--send-plane-line] size-[16px]" />
                          }
                          variant="primary"
                          description="发布自己说的"
                          onClick={handleSubmit}
                        />
                      </>
                    )}
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
                      说点什么呢
                    </h1>
                    <h2 class={"opacity-80 text-sm"}>说说 · 说点什么呢</h2>
                  </div>
                </>
              );
            },
            default() {
              return (
                <>
                  <NForm>
                    <NFormItem
                      label="内容"
                      required
                      labelPlacement="left"
                      labelStyle={{ width: "4rem" }}
                    >
                      <NInput
                        type="textarea"
                        autofocus
                        autosize={{ minRows: 6, maxRows: 8 }}
                        placeholder={placeholder.value.text}
                        value={data.text}
                        onInput={(e) => void (data.text = e)}
                        class={"rounded-lg"}
                      />
                    </NFormItem>
                    <NFormItem
                      label="作者"
                      required
                      labelPlacement="left"
                      labelStyle={{ width: "4rem" }}
                    >
                      <NInput
                        placeholder={placeholder.value.author}
                        value={data.author}
                        onInput={(e) => void (data.author = e)}
                        class={"rounded-lg"}
                      />
                    </NFormItem>
                    <NFormItem
                      label="来源"
                      required
                      labelPlacement="left"
                      labelStyle={{ width: "4rem" }}
                    >
                      <NInput
                        placeholder={placeholder.value.source}
                        value={data.source}
                        onInput={(e) => void (data.source = e)}
                        class={"rounded-lg"}
                      />
                    </NFormItem>
                  </NForm>
                </>
              );
            }
          }}
        </NCard>
      </>
    );
  }
});

export default EditSay;

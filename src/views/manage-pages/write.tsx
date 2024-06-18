import { WEB_URL } from "~/constants/env";
import { HeaderActionButtonWithDesc } from "~/components/button/rounded-button";
import { TextBaseDrawer } from "~/components/drawer/text-base-drawer";
import { SlidersHIcon } from "~/components/icons";
import { UnderlineInput } from "~/components/input/underline-input";
import { ParseContentButton } from "~/components/special-button/parse-content";
import { useParsePayloadIntoData } from "~/hooks/use-parse-payload";
import { isString, uniqueId } from "lodash-es";
import { NFormItem, NInputNumber, useMessage } from "naive-ui";
import { RouteName } from "~/router/name";
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

import { Editor } from "~/components/editor/universal";
import {
  HeaderPreviewButton,
  PreviewSplitter
} from "~/components/special-button/preview";
import { EmitKeyMap } from "~/constants/keys";
import type { WriteBaseType } from "~/shared/types/base";
import type { PageModel } from "~/models/page";
import { EditorLayer } from "~/layouts/content/EditorLayer";
import { AdvancedInput } from "~/components/input/AdvancedInput";
import { clsxm } from "~/utils/helper";
import {
  SidebarSection,
  SidebarWrapper
} from "~/components/editor/writing/SidebarBase";
import { SidebarAddition } from "~/components/editor/writing/SidebarAddition";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";

type PageReactiveType = WriteBaseType & {
  subtitle: string;
  slug: string;
  order: number;
};

const PageWriteView = defineComponent(() => {
  const uiStore = useStoreRef(UIStore);
  const isMobile = uiStore.viewport.value.mobile;

  const route = useRoute();

  const resetReactive: () => PageReactiveType = () => ({
    text: "",
    title: "",
    order: 0,
    slug: "",
    subtitle: "",
    allowComment: true,

    id: undefined,
    images: [],
    meta: undefined
  });

  const parsePayloadIntoReactiveData = (payload: PageModel) =>
    useParsePayloadIntoData(data)(payload);
  const data = reactive<PageReactiveType>(resetReactive());
  const id = computed(() => route.query.id);

  onMounted(async () => {
    const $id = id.value;
    if ($id && typeof $id == "string") {
      const payload = (await RESTManager.api.pages($id).get({})) as any;

      const data = payload.data;
      parsePayloadIntoReactiveData(data as PageModel);
    }
  });

  const drawerShow = ref(false);

  const message = useMessage();
  const router = useRouter();

  const handleSubmit = async () => {
    const parseDataToPayload = (): { [key in keyof PageModel]?: any } => {
      try {
        if (!data.title || data.title.trim().length == 0) {
          throw "标题为空";
        }
        if (!data.slug) {
          throw "路径为空";
        }
        return {
          ...toRaw(data),
          title: data.title.trim(),
          slug: data.slug.trim()
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
      await RESTManager.api.pages($id).put({
        data: parseDataToPayload()
      });
      message.success("修改成功");
    } else {
      // create
      await RESTManager.api.pages.post({
        data: parseDataToPayload()
      });
      message.success("发布成功");
    }

    router.push({ name: RouteName.ListPage, hash: "|publish" });
  };
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
        title={id.value ? `编辑「${data.title}」` : "添加页面"}
        headerClass="pt-4"
        actionsElement={
          <>
            <div class="shrink grow" />
            <div class="flex grow-0 items-center gap-4">
              <div class="flex gap-2">
                <ParseContentButton
                  data={data}
                  onHandleYamlParsedMeta={(meta) => {
                    const { title, slug, subtitle, ...rest } = meta;
                    data.title = title ?? data.title;
                    data.slug = slug ?? data.slug;
                    data.subtitle = subtitle ?? data.subtitle;

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
              label={`希望你有个好心情~`}
              labelPlacement="inside"
              labelClassNames="text-xs"
              inputClassNames="text-base font-medium"
              value={data.title}
              onChange={(e) => {
                data.title = e;
              }}
            />
            <div class={"pt-2 text-gray-700 dark:text-gray-300"}>
              <span class="text-[14px]">副标题：</span>
              <UnderlineInput
                value={data.subtitle}
                onChange={(e) => void (data.subtitle = e)}
              />
            </div>

            <div class={"my-3 flex items-center text-sm text-gray-500"}>
              <label class="prefix text-base-content" id={lId}>
                地址：{`${WEB_URL}/`}
              </label>

              <UnderlineInput
                id={lId}
                value={data.slug}
                onChange={(e) => {
                  data.slug = e;
                }}
              />
            </div>
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
                <SidebarSection label="页面顺序">
                  <NInputNumber
                    placeholder=""
                    value={data.order}
                    onUpdateValue={(e) => void (data.order = e ?? 0)}
                    themeOverrides={{
                      peers: {
                        Input: {
                          borderRadius: "0.5rem"
                        }
                      }
                    }}
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
              onClick={() => {
                drawerShow.value = true;
              }}
              class={isMobile ? "" : "!hidden"}
            >
              <Icon>
                <SlidersHIcon />
              </Icon>
            </button>
          </>
        }
      >
        {isMobile && (
          <TextBaseDrawer
            disabledItem={["date-picker"]}
            onUpdateShow={(s) => {
              drawerShow.value = s;
            }}
            data={data}
            show={drawerShow.value}
          >
            <NFormItem label="页面顺序">
              <NInputNumber
                placeholder=""
                value={data.order}
                onUpdateValue={(e) => void (data.order = e ?? 0)}
              ></NInputNumber>
            </NFormItem>
          </TextBaseDrawer>
        )}
      </EditorLayer>
    </>
  );
});

export default PageWriteView;

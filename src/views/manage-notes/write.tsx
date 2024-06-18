import { WEB_URL } from "~/constants/env";
import { MOOD_SET, WEATHER_SET } from "~/constants/note";
import type { AggregateRoot } from "@mx-space/api-client";
import {
  HeaderActionButtonWithDesc,
  VanillaButton
} from "~/components/button/rounded-button";
import { TextBaseDrawer } from "~/components/drawer/text-base-drawer";
import { SlidersHIcon } from "~/components/icons";

import { GetLocationButton } from "~/components/location/get-location-button";
import { SearchLocationButton } from "~/components/location/search-button";
import { ParseContentButton } from "~/components/special-button/parse-content";
import { add } from "date-fns";
import { useAutoSave, useAutoSaveInEditor } from "~/hooks/use-auto-save";
import { useParsePayloadIntoData } from "~/hooks/use-parse-payload";

import { isString, uniqueId } from "lodash-es";
import {
  NButton,
  NButtonGroup,
  NDatePicker,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NSwitch,
  SelectProps,
  useMessage
} from "naive-ui";
import { RouteName } from "~/router/name";
import { RESTManager } from "~/utils/rest";
import { getDayOfYear } from "~/utils/time";
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  reactive,
  ref,
  toRaw,
  watch
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
import type { PaginateResult } from "@mx-space/api-client";
import type { Coordinate, NoteModel } from "~/models/note";
import type { TopicModel } from "~/models/topic";
import type { WriteBaseType } from "~/shared/types/base";
import { EditorLayer } from "~/layouts/content/EditorLayer";
import { AdvancedInput } from "~/components/input/AdvancedInput";
import { clsxm } from "~/utils/helper";
import {
  SidebarSection,
  SidebarWrapper
} from "~/components/editor/writing/SidebarBase";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { SidebarAddition } from "~/components/editor/writing/SidebarAddition";
import { CopyTextButton } from "~/components/special-button/copy-text-button";

const CrossBellConnectorIndirector = defineAsyncComponent({
  loader: () =>
    import("~/components/xlog-connect").then(
      (mo) => mo.CrossBellConnectorIndirector
    ),
  suspensible: true
});

const selectionOverrides: NonNullable<SelectProps["themeOverrides"]> = {
  peers: {
    InternalSelection: {
      borderRadius: "0.5rem",
      color: "transparent"
    }
  }
};

type NoteReactiveType = {
  hide: boolean;
  mood: string;
  weather: string;
  password: string | null;
  publicAt: Date | null;
  bookmark: boolean;

  location: null | string;
  coordinates: null | Coordinate;
  topicId: string | null | undefined;
} & WriteBaseType;

const useNoteTopic = () => {
  const topics = ref([] as TopicModel[]);

  const fetchTopic = async () => {
    const { data } = await RESTManager.api.topics.get<
      PaginateResult<TopicModel>
    >({
      params: {
        // TODO
        size: 50
      }
    });

    topics.value = data;
  };

  return {
    topics,
    fetchTopic
  };
};

const NoteWriteView = defineComponent(() => {
  const uiStore = useStoreRef(UIStore);
  const isMobile = uiStore.viewport.value.mobile;

  const route = useRoute();

  const defaultTitle = ref("写点什么呢");
  const id = computed(() => route.query.id);

  onBeforeMount(() => {
    if (id.value) {
      return;
    }
    const currentTime = new Date();
    defaultTitle.value = `记录 ${currentTime.getFullYear()} 年第 ${getDayOfYear(
      currentTime
    )} 天`;
  });

  const resetReactive: () => NoteReactiveType = () => ({
    text: "",
    title: "",
    hide: false,
    bookmark: false,
    mood: "",

    password: null,
    publicAt: null,
    weather: "",
    location: "",
    coordinates: null,
    allowComment: true,

    id: undefined,
    topicId: undefined,
    images: [],
    meta: undefined,
    created: undefined
  });

  const parsePayloadIntoReactiveData = (payload: NoteModel) =>
    useParsePayloadIntoData(data)(payload);
  const data = reactive<NoteReactiveType>(resetReactive());
  const nid = ref<number>();

  const loading = computed(
    () => !!(id.value && typeof data.id === "undefined")
  );

  const autoSaveHook = useAutoSave(`note-${id.value || "new"}`, 3000, () => ({
    text: data.text,
    title: data.title
  }));

  const autoSaveInEditor = useAutoSaveInEditor(data, autoSaveHook);

  const disposer = watch(
    () => loading.value,
    (loading) => {
      if (loading) {
        return;
      }

      autoSaveInEditor.enable();
      requestAnimationFrame(() => {
        disposer();
      });
    },
    { immediate: true }
  );

  onMounted(async () => {
    const $id = id.value;
    if ($id && typeof $id == "string") {
      const payload = (await RESTManager.api.notes($id).get({
        params: {
          single: true
        }
      })) as any;

      const data = payload.data;

      if (data.topic) {
        topics.value.push(data.topic);
      }

      nid.value = data.nid;
      data.secret = data.secret ? new Date(data.secret) : null;

      const created = new Date((data as any).created);
      defaultTitle.value = `记录 ${created.getFullYear()} 年第 ${getDayOfYear(
        created
      )} 天`;

      parsePayloadIntoReactiveData(data as NoteModel);
    }
  });

  const drawerShow = ref(false);

  const message = useMessage();
  const router = useRouter();

  const enablePassword = computed(() => typeof data.password === "string");

  const handleSubmit = async () => {
    const parseDataToPayload = (): { [key in keyof NoteModel]?: any } => {
      return {
        ...toRaw(data),
        title:
          data.title && data.title.trim()
            ? data.title.trim()
            : defaultTitle.value,
        password:
          data.password && data.password.length > 0 ? data.password : null,
        publicAt: data.publicAt
          ? (() => {
              const date = new Date(data.publicAt);
              if (+date - Date.now() <= 0) {
                return null;
              } else {
                return date;
              }
            })()
          : null
      };
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
      const response = await RESTManager.api.notes($id).put<NoteModel>({
        data: parseDataToPayload()
      });
      message.success("修改成功");

      await CrossBellConnector.createOrUpdate(response);
    } else {
      const data = parseDataToPayload();
      // create
      const response = await RESTManager.api.notes.post<NoteModel>({
        data
      });
      message.success("发布成功");

      await CrossBellConnector.createOrUpdate(response);
    }

    await router.push({ name: RouteName.ViewNote, hash: "|publish" });
    autoSaveInEditor.clearSaved();
  };
  const { fetchTopic, topics } = useNoteTopic();

  const getData = () => ({
    ...data,
    nid: (data as any).nid || Math.floor(Math.random() * 1000 + 10000)
  });
  watch(
    () => data,
    () => {
      window.dispatchEvent(new CustomEvent(EmitKeyMap.EditDataUpdate));
    },
    { deep: true }
  );

  const latestNid = ref(0);
  onMounted(async () => {
    const lastNote = await RESTManager.api
      .aggregate()
      .get<AggregateRoot>({ data })
      .then((res) => {
        return res.latestNoteId;
      });

    latestNid.value = lastNote.nid;
  });

  const lId = uniqueId(":l").concat(":");
  return () => (
    <>
      <EditorLayer
        title={id.value ? `编辑「${data.title}」` : "记录生活点滴"}
        headerClass="pt-4"
        actionsElement={
          <>
            <div class="shrink grow" />
            <div class="flex grow-0 items-center gap-4">
              <div class="flex gap-2">
                <ParseContentButton
                  data={data}
                  onHandleYamlParsedMeta={(meta) => {
                    const { title, mood, weather, ...rest } = meta;
                    data.title = title ?? data.title;
                    data.mood = mood ?? data.mood;
                    data.weather = weather ?? data.weather;

                    data.meta = { ...rest };
                  }}
                />
                <HeaderPreviewButton getData={getData} iframe />
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
              label={defaultTitle.value}
              labelPlacement="inside"
              labelClassNames={clsxm(data.title.length ? "text-xs" : "")}
              focusClassNames="text-xs"
              inputClassNames="text-base font-medium"
              value={data.title}
              onChange={(e) => {
                data.title = e;
              }}
            />

            <div class={"my-3 flex items-center pl-2 text-sm text-gray-500"}>
              <label class="prefix text-base-content" id={lId}>
                地址：
                {`${WEB_URL}/notes/${nid.value || (latestNid?.value ? latestNid.value + 1 : "")}`}
              </label>
              {nid.value ||
                ((latestNid?.value ? latestNid.value + 1 : "") && (
                  <CopyTextButton
                    text={`${WEB_URL}/notes/${nid.value || (latestNid?.value ? latestNid.value + 1 : "")}`}
                  />
                ))}
              {data.text.length > 0 && <AiHelperButton reactiveData={data} />}
            </div>
            <CrossBellConnectorIndirector />
            <PreviewSplitter>
              <Editor
                key={data.id}
                loading={loading.value}
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
                <SidebarSection label="心情">
                  <NSelect
                    clearable
                    value={data.mood}
                    filterable
                    tag
                    options={MOOD_SET.map((i) => ({ label: i, value: i }))}
                    onUpdateValue={(e) => void (data.mood = e)}
                    themeOverrides={{
                      peers: {
                        InternalSelection: {
                          borderRadius: "0.5rem"
                        }
                      }
                    }}
                  />
                </SidebarSection>
                <SidebarSection label="天气">
                  <NSelect
                    clearable
                    value={data.weather}
                    filterable
                    tag
                    options={WEATHER_SET.map((i) => ({ label: i, value: i }))}
                    onUpdateValue={(e) => void (data.weather = e)}
                    themeOverrides={{
                      peers: {
                        InternalSelection: {
                          borderRadius: "0.5rem"
                        }
                      }
                    }}
                  />
                </SidebarSection>
                <SidebarSection label="专栏">
                  <NSelect
                    options={topics.value.map((topic) => ({
                      label: topic.name,
                      value: topic.id!,
                      key: topic.id
                    }))}
                    value={data.topicId}
                    onUpdateValue={(value) => {
                      data.topicId = value;
                    }}
                    onFocus={() => {
                      fetchTopic();
                    }}
                    themeOverrides={selectionOverrides}
                  />
                </SidebarSection>
                <div class="flex flex-col">
                  <div class="flex items-center justify-between space-x-2 text-[1em]">
                    <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      获取当前地址
                    </label>
                    <div class="inline-flex center space-x-2">
                      <GetLocationButton
                        onChange={(amap, coordinates) => {
                          data.location = amap.formattedAddress;
                          data.coordinates = {
                            longitude: coordinates[0],
                            latitude: coordinates[1]
                          };
                        }}
                      />
                      <SearchLocationButton
                        placeholder={data.location}
                        onChange={(locationName, coo) => {
                          data.location = locationName;
                          data.coordinates = coo;
                        }}
                      />

                      <VanillaButton
                        disabled={!data.location}
                        variant="secondary"
                        onClick={() => {
                          data.location = "";
                          data.coordinates = null;
                        }}
                      >
                        <div class="inline-flex center space-x-2">
                          <i class="icon-[mingcute--broom-line] size-[18px]" />
                          <span>清除</span>
                        </div>
                      </VanillaButton>
                    </div>
                  </div>
                  {data.location && (
                    <div class="inline-flex items-center space-x-4">
                      <span class="inline-flex center">
                        <i class="icon-[mingcute--aiming-2-line] size-[16px] mr-1" />
                        {data.location}
                      </span>
                      {data.coordinates && (
                        <span class="inline-flex center">
                          <i class="icon-[mingcute--earth-2-line] size-[16px] mr-1" />
                          {data.coordinates.longitude},{" "}
                          {data.coordinates.latitude}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    隐藏
                  </label>
                  <NSwitch
                    value={data.hide}
                    onUpdateValue={(e) => void (data.hide = e)}
                  />
                </div>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    设定密码?
                  </label>
                  <NSwitch
                    value={enablePassword.value}
                    onUpdateValue={(e) => {
                      if (e) {
                        data.password = "";
                      } else {
                        data.password = null;
                      }
                    }}
                  />
                </div>
                {enablePassword.value && (
                  <div class="flex items-center justify-between space-x-2 text-[1em]">
                    <label class="text-[0.9em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[30px]">
                      密码
                    </label>
                    <NInput
                      class="rounded-md"
                      disabled={!enablePassword.value}
                      show-password-on="click"
                      placeholder=""
                      type="password"
                      value={data.password}
                      inputProps={{
                        name: "note-password",
                        autocapitalize: "off",
                        autocomplete: "new-password"
                      }}
                      onInput={(e) => void (data.password = e)}
                    />
                  </div>
                )}
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    公开时间
                  </label>
                  <NDatePicker
                    type="datetime"
                    isDateDisabled={(ts: number) =>
                      +new Date(ts) - Date.now() < 0
                    }
                    placeholder="选择时间"
                    clearable
                    value={data.publicAt ? +new Date(data.publicAt) : undefined}
                    onUpdateValue={(e) => {
                      data.publicAt = e ? new Date(e) : null;
                    }}
                    themeOverrides={{
                      peers: {
                        Input: {
                          borderRadius: "0.5rem"
                        }
                      }
                    }}
                  >
                    {{
                      footer: () => {
                        const date = new Date();
                        return (
                          <div class="flex flex-wrap h-[31.5px] space-x-1">
                            <VanillaButton
                              variant="secondary"
                              class="dark:from-zinc-900/0 dark:to-zinc-800/0 dark:bg-accent dark:text-black"
                              onClick={() => {
                                data.publicAt = add(date, { days: 1 });
                              }}
                            >
                              一天后
                            </VanillaButton>
                            <VanillaButton
                              variant="secondary"
                              class="dark:from-zinc-900/0 dark:to-zinc-800/0 dark:bg-accent dark:text-black"
                              onClick={() => {
                                data.publicAt = add(date, { weeks: 1 });
                              }}
                            >
                              一周后
                            </VanillaButton>
                            <VanillaButton
                              variant="secondary"
                              class="dark:from-zinc-900/0 dark:to-zinc-800/0 dark:bg-accent dark:text-black"
                              onClick={() => {
                                data.publicAt = add(date, { days: 14 });
                              }}
                            >
                              半个月后
                            </VanillaButton>
                            <VanillaButton
                              variant="secondary"
                              class="dark:from-zinc-900/0 dark:to-zinc-800/0 dark:bg-accent dark:text-black"
                              onClick={() => {
                                data.publicAt = add(date, { months: 1 });
                              }}
                            >
                              一个月后
                            </VanillaButton>
                          </div>
                        );
                      }
                    }}
                  </NDatePicker>
                </div>
                <div class="flex items-center justify-between space-x-2 text-[1em]">
                  <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    标记为回忆项
                  </label>
                  <NSwitch
                    value={data.bookmark}
                    onUpdateValue={(e) => void (data.bookmark = e)}
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
                    placeholder="选择时间"
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
                          borderRadius: "0.5rem"
                        }
                      }
                    }}
                  />
                </div>
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
            data={data}
            show={drawerShow.value}
            onUpdateShow={(s) => {
              drawerShow.value = s;
            }}
          >
            <NFormItem label="心情" required>
              <NSelect
                clearable
                value={data.mood}
                filterable
                tag
                options={MOOD_SET.map((i) => ({ label: i, value: i }))}
                onUpdateValue={(e) => void (data.mood = e)}
              />
            </NFormItem>
            <NFormItem label="天气" required>
              <NSelect
                clearable
                value={data.weather}
                filterable
                tag
                options={WEATHER_SET.map((i) => ({ label: i, value: i }))}
                onUpdateValue={(e) => void (data.weather = e)}
              />
            </NFormItem>

            <NFormItem label="专栏">
              <NSelect
                options={topics.value.map((topic) => ({
                  label: topic.name,
                  value: topic.id!,
                  key: topic.id
                }))}
                value={data.topicId}
                onUpdateValue={(value) => {
                  data.topicId = value;
                }}
                onFocus={() => {
                  fetchTopic();
                }}
              />
            </NFormItem>

            <NFormItem label="获取当前地址" labelPlacement="left">
              <NSpace vertical>
                <NButtonGroup>
                  <GetLocationButton
                    onChange={(amap, coordinates) => {
                      data.location = amap.formattedAddress;
                      data.coordinates = {
                        longitude: coordinates[0],
                        latitude: coordinates[1]
                      };
                    }}
                  />
                  <SearchLocationButton
                    placeholder={data.location}
                    onChange={(locationName, coo) => {
                      data.location = locationName;
                      data.coordinates = coo;
                    }}
                  />

                  <NButton
                    round
                    disabled={!data.location}
                    onClick={() => {
                      data.location = "";
                      data.coordinates = null;
                    }}
                  >
                    清除
                  </NButton>
                </NButtonGroup>

                <NSpace vertical>
                  <span>{data.location}</span>
                  {data.coordinates && (
                    <span>
                      {data.coordinates.longitude}, {data.coordinates.latitude}
                    </span>
                  )}
                </NSpace>
              </NSpace>
            </NFormItem>

            <NFormItem
              label="设定密码?"
              labelAlign="right"
              labelPlacement="left"
            >
              <NSwitch
                value={enablePassword.value}
                onUpdateValue={(e) => {
                  if (e) {
                    data.password = "";
                  } else {
                    data.password = null;
                  }
                }}
              />
            </NFormItem>
            {enablePassword.value && (
              <NFormItem label="输入密码">
                <NInput
                  disabled={!enablePassword.value}
                  placeholder=""
                  type="password"
                  value={data.password}
                  inputProps={{
                    name: "note-password",
                    autocapitalize: "off",
                    autocomplete: "new-password"
                  }}
                  onInput={(e) => void (data.password = e)}
                />
              </NFormItem>
            )}
            <NFormItem
              label="公开时间"
              labelAlign="right"
              labelPlacement="left"
            >
              <NDatePicker
                type="datetime"
                isDateDisabled={(ts: number) => +new Date(ts) - Date.now() < 0}
                placeholder="选择时间"
                clearable
                value={data.publicAt ? +new Date(data.publicAt) : undefined}
                onUpdateValue={(e) => {
                  data.publicAt = e ? new Date(e) : null;
                }}
              >
                {{
                  footer: () => {
                    const date = new Date();
                    return (
                      <NSpace>
                        <NButton
                          round
                          type="default"
                          size="small"
                          onClick={() => {
                            data.publicAt = add(date, { days: 1 });
                          }}
                        >
                          一天后
                        </NButton>
                        <NButton
                          round
                          type="default"
                          size="small"
                          onClick={() => {
                            data.publicAt = add(date, { weeks: 1 });
                          }}
                        >
                          一周后
                        </NButton>
                        <NButton
                          round
                          type="default"
                          size="small"
                          onClick={() => {
                            data.publicAt = add(date, { days: 14 });
                          }}
                        >
                          半个月后
                        </NButton>
                        <NButton
                          round
                          type="default"
                          size="small"
                          onClick={() => {
                            data.publicAt = add(date, { months: 1 });
                          }}
                        >
                          一个月后
                        </NButton>
                      </NSpace>
                    );
                  }
                }}
              </NDatePicker>
            </NFormItem>

            <NFormItem label="隐藏" labelAlign="right" labelPlacement="left">
              <NSwitch
                value={data.hide}
                onUpdateValue={(e) => void (data.hide = e)}
              />
            </NFormItem>

            <NFormItem
              label="标记为回忆项"
              labelAlign="right"
              labelPlacement="left"
            >
              <NSwitch
                value={data.bookmark}
                onUpdateValue={(e) => void (data.bookmark = e)}
              />
            </NFormItem>
          </TextBaseDrawer>
        )}
      </EditorLayer>
    </>
  );
});

export default NoteWriteView;

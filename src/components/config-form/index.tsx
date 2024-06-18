import { get, set } from "lodash-es";
import { marked } from "marked";
import {
  NCol,
  NCollapse,
  NCollapseItem,
  NDynamicTags,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NRow,
  NSelect,
  NSpace,
  NSwitch,
  NText
} from "naive-ui";
import type { ComputedRef, InjectionKey, PropType, Ref, VNode } from "vue";

import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { uuid } from "~/utils";
import { clsxm } from "~/utils/helper";
import { SettingDivider } from "~/views/setting/tabs/user";

const NFormPrefixCls = "mt-6";
const NFormBaseProps = {
  class: NFormPrefixCls,
  labelPlacement: "left",
  labelAlign: "right",
  labelWidth: 150,

  autocomplete: "do-not-autofill"
};

const SysNFormBaseProps = {
  labelPlacement: "left",
  labelAlign: "right",
  labelWidth: 150,

  autocomplete: "do-not-autofill"
};

export const JSONSchemaFormInjectKey: InjectionKey<{
  schema: KV;
  definitions: ComputedRef<Map<string, any>>;
  getKey: (key: string) => string;
}> = Symbol("JSONSchemaFormInject");

export const SystemConfigForm = defineComponent({
  props: {
    schema: {
      type: Object as PropType<KV>,
      required: true
    },
    onValueChange: {
      type: Function as PropType<(val: any) => any>,
      required: false
    },
    initialValue: {
      type: Object as PropType<KV>,
      required: true
    },

    getKey: {
      type: Function as PropType<(key: string) => string>,
      required: false,
      default: (key: string) => key
    },

    extendConfigView: {
      type: Object as PropType<{
        [key: string]: VNode;
      }>
    }
  },

  setup(props, { slots }) {
    const formData = ref(props.initialValue);

    watchEffect(
      () => {
        props.onValueChange?.(formData.value);
      },
      {
        flush: "post"
      }
    );

    const definitions = computed(() => props.schema.definitions);
    const defintionMap = computed(
      () => new Map(Object.entries(props.schema.definitions))
    );

    provide(JSONSchemaFormInjectKey, {
      schema: props.schema,
      definitions: defintionMap,
      getKey: props.getKey
    });

    const definitionsKeys = computed(() => Object.keys(definitions.value));

    const uiStore = useStoreRef(UIStore);

    const formProps = reactive(SysNFormBaseProps) as any;
    watch(
      () => uiStore.viewport.value.mobile,
      (n) => {
        if (n) {
          formProps.labelPlacement = "top";
          formProps.labelAlign = "left";
        } else {
          formProps.labelPlacement = "left";
          formProps.labelAlign = "right";
        }
      },
      { immediate: true }
    );

    const renderConfigBlock = (
      item: string,
      schema: any,
      formData: any,
      props: any
    ) => {
      switch (item) {
        case "UrlDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改网站相关的设定如 博客地址,
                  <br />
                  管理后台地址, API地址以及Gateway地址
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "SeoDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改SEO中的相关设定, 如
                  <br />
                  网站标题,网站描述以及关键词等相关的设定
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "AdminExtraDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改后台附加项目的相关的设定,
                  <br />
                  如后台反代, 后台管理的副标题以及登录页背景,
                  <br />
                  以及高德地图的查询 API Key
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "TextOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里设置 <strong>文本宏替换</strong> 功能是否开启
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "MailOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改邮件通知相关的设定,如是否开启邮件通知,
                  <br />
                  发件邮箱的地址,端口,密码,Host以及
                  <br />
                  是否使用SSL/TLS
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "CommentOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改评论相关的设定,如是否开启反垃圾评论,
                  <br />
                  是否禁止全站评论以及添加自定义屏蔽关键词等
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "BarkOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改 Bark通知相关的设定,如是否开启Bark通知
                  <br />
                  修改设备Key, 服务器URL等
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "FriendLinkOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>您可以在这里修改友链相关的设定，如是否允许申请友链</p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "BackupOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改备份相关的设定,如是否开启自动备份
                  <br />
                  Amazon S3服务端点,SecretID,SecretKey,Bucket
                  <br />
                  以及地域 Region等设置
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "BaiduSearchOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改百度推送相关的设定,如Token,
                  <br />
                  是否开启推送等
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "AlgoliaSearchOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改Algolia Search相关的设定, 如API Key,
                  <br />
                  APP ID, IndexName以及是否开启搜索功能等
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "ClerkOptionsDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改Clerk鉴权绑定相关的设定,如Clerk User ID,
                  <br />
                  JWT PEM Key, Secret Key以及是否开启鉴权等设置
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "FeatureListDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>您可以在这里修改如邮件推送订阅等相关功能等设定</p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "ThirdPartyServiceIntegrationDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改第三方服务的相关的设定
                  <br />
                  如xLog（开源创作社区）的xLog SiteId
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
              <SettingDivider />
            </NRow>
          );
        case "AIDto":
          return (
            <NRow
              class="justify-center !my-4"
              data-schema={JSON.stringify(schema)}
            >
              <NCol span="6">
                <h4 class="text-2xl font-semibold">{schema.title}</h4>
                <p>
                  您可以在这里修改AI 相关的设定, 如OpenAI key, Endpoint
                  <br />
                  以及是否可以调用AI生成摘要, 以及是否自动生成摘要
                </p>
              </NCol>
              <NCol span="6">
                <NForm {...formProps}>
                  <ConfigSchemaSection
                    dataKey={props.getKey(item)}
                    formData={formData}
                    schema={schema}
                    property={item}
                  />
                </NForm>
              </NCol>
            </NRow>
          );
        default:
          return null;
      }
    };

    return () => {
      const { schema } = props;
      return (
        <>
          <div class={"h-fit flex flex-col"}>
            {definitionsKeys.value.map((key) => {
              const schema = definitions.value[key];

              if (!schema.title) {
                return null;
              }

              const uiOptions = schema?.["ui:options"] || {};

              switch (uiOptions?.type) {
                case "hidden":
                  return null;
              }

              return renderConfigBlock(key, schema, formData, props);
            })}
          </div>
          {slots.default?.()}
          {schema.ps.length ? (
            <NSpace vertical>
              {schema.ps.map((text) => {
                return (
                  <NText class="ml-4 mt-8 mb-4 inline-block text-xs" depth={3}>
                    {text}
                  </NText>
                );
              })}
            </NSpace>
          ) : null}
        </>
      );
    };
  }
});

const ConfigSchemaSection = defineComponent({
  props: {
    schema: {
      type: Object as PropType<any>,
      required: true
    },
    formData: {
      type: Object as PropType<Ref<any>>,
      required: true
    },
    dataKey: {
      type: String as PropType<string>,
      required: true
    },
    property: {
      type: String as PropType<string>
    }
  },
  setup(props) {
    const { definitions, getKey } = inject(JSONSchemaFormInjectKey, {} as any);

    return () => {
      const { schema, formData, dataKey: key, property } = props;

      if (!schema) {
        return null;
      }

      return (
        <>
          {Object.keys(schema.properties).map((property) => {
            const current = schema.properties[property];

            if (current.$ref) {
              const nestSchmea = definitions.value.get(
                current.$ref.split("/").at(-1)
              );

              return (
                <ConfigSchemaSection
                  dataKey={`${getKey(key)}.${property}`}
                  formData={formData}
                  schema={nestSchmea}
                  property={property}
                />
              );
            }

            return (
              <ConfigScheamFormItem
                value={get(
                  formData.value,
                  `${getKey(key)}.${property}`,
                  undefined
                )}
                onUpdateValue={(val) => {
                  if (get(formData.value, getKey(key))) {
                    set(formData.value, `${getKey(key)}.${property}`, val);
                  } else {
                    set(formData.value, getKey(key), {
                      ...get(formData.value, getKey(key), {}),
                      [property]: val
                    });
                  }
                }}
                title={current.title}
                type={current.type}
                options={current?.["ui:options"]}
                description={current.description}
              />
            );
          })}
        </>
      );
    };
  }
});

const ConfigScheamFormItem = defineComponent({
  props: {
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    options: {
      type: Object,
      default: () => ({})
    },

    value: {
      type: null,
      required: true
    },
    onUpdateValue: {
      type: Function as PropType<(value: any) => void>,
      required: true
    }
  },
  setup(props) {
    const innerValue = ref(props.value);

    watchEffect(() => {
      props.onUpdateValue(innerValue.value);
    });

    const renderComponent = () => {
      const { options } = props;

      switch (props.type) {
        case "url":
        case "string": {
          const { type: uiType } = options;

          switch (uiType) {
            case "select":
              const { values } = options as {
                values: { label: string; value: string }[];
              };
              return (
                <NSelect
                  value={innerValue.value}
                  onUpdateValue={(val) => {
                    innerValue.value = val;
                  }}
                  options={values}
                  filterable
                  themeOverrides={{
                    peers: {
                      InternalSelection: {
                        borderRadius: "0.5rem"
                      }
                    }
                  }}
                />
              );
            default:
              return (
                <NInput
                  class={"rounded-lg"}
                  inputProps={{
                    id: uuid()
                  }}
                  value={innerValue.value}
                  onUpdateValue={(val) => {
                    innerValue.value = val;
                  }}
                  type={uiType || "text"}
                  showPasswordOn="click"
                  autosize={
                    uiType == "textarea"
                      ? {
                          maxRows: 5,
                          minRows: 3
                        }
                      : undefined
                  }
                  clearable
                />
              );
          }
        }
        case "array": {
          return (
            <NDynamicTags
              value={innerValue.value}
              onUpdateValue={(val) => {
                innerValue.value = val;
              }}
            >
              {{
                trigger(e) {
                  const AddIcon = defineComponent({
                    setup() {
                      return () => (
                        <button onClick={e.activate}>
                          <div
                            class={clsxm(
                              "border-foreground-400/80 w-fit items-center justify-center !text-[#2080f0] inline-flex space-x-1",
                              "transition-colors ease-in-out duration-300 hover:!text-[#4098fc]"
                            )}
                          >
                            <i class="icon-[mingcute--add-line] size-4" />
                            <span>添加</span>
                          </div>
                        </button>
                      );
                    }
                  });
                  return <AddIcon />;
                }
              }}
            </NDynamicTags>
          );
        }
        case "boolean": {
          return (
            <NSwitch
              value={innerValue.value}
              onUpdateValue={(val) => {
                innerValue.value = val;
              }}
            />
          );
        }

        case "integer": {
          return (
            <NInputNumber
              value={innerValue.value}
              onUpdateValue={(val) => {
                innerValue.value = val;
              }}
            />
          );
        }
        default:
          return null;
      }
    };

    return () => {
      const { title, options, description } = props;

      const base = (
        <>
          <NFormItem label={title}>
            {description ? (
              <NSpace class={"w-full"} vertical>
                {renderComponent()}

                <NText class="text-xs" depth={3}>
                  <span innerHTML={marked.parse(description) as string} />
                </NText>
              </NSpace>
            ) : (
              renderComponent()
            )}
          </NFormItem>
        </>
      );

      return base;
    };
  }
});

export const ConfigForm = defineComponent({
  props: {
    schema: {
      type: Object as PropType<KV>,
      required: true
    },
    onValueChange: {
      type: Function as PropType<(val: any) => any>,
      required: false
    },
    initialValue: {
      type: Object as PropType<KV>,
      required: true
    },

    getKey: {
      type: Function as PropType<(key: string) => string>,
      required: false,
      default: (key: string) => key
    },

    extendConfigView: {
      type: Object as PropType<{
        [key: string]: VNode;
      }>
    }
  },

  setup(props, { slots }) {
    const formData = ref(props.initialValue);

    watchEffect(
      () => {
        props.onValueChange?.(formData.value);
      },
      {
        flush: "post"
      }
    );

    const definitions = computed(() => props.schema.definitions);
    const defintionMap = computed(
      () => new Map(Object.entries(props.schema.definitions))
    );

    provide(JSONSchemaFormInjectKey, {
      schema: props.schema,
      definitions: defintionMap,
      getKey: props.getKey
    });

    const definitionsKeys = computed(() => Object.keys(definitions.value));

    const expandedNames = ref<string[]>([definitionsKeys.value[0]]);
    const uiStore = useStoreRef(UIStore);

    const formProps = reactive(NFormBaseProps) as any;
    watch(
      () => uiStore.viewport.value.mobile,
      (n) => {
        if (n) {
          formProps.labelPlacement = "top";
          formProps.labelAlign = "left";
        } else {
          formProps.labelPlacement = "left";
          formProps.labelAlign = "right";
        }
      },
      { immediate: true }
    );

    return () => {
      const { schema } = props;
      return (
        <>
          <NCollapse
            accordion
            defaultExpandedNames={expandedNames.value}
            displayDirective="if"
          >
            {definitionsKeys.value.map((key) => {
              const schema = definitions.value[key];

              if (!schema.title) {
                return null;
              }

              const uiOptions = schema?.["ui:options"] || {};

              switch (uiOptions?.type) {
                case "hidden":
                  return null;
              }

              return (
                <NCollapseItem
                  title={schema.title}
                  data-schema={JSON.stringify(schema)}
                >
                  <NForm {...formProps}>
                    <SchemaSection
                      dataKey={props.getKey(key)}
                      formData={formData}
                      schema={schema}
                      property={key}
                    />
                    {props.extendConfigView?.[key]}
                    {slots[key]?.()}
                  </NForm>
                </NCollapseItem>
              );
            })}
          </NCollapse>
          {schema.ps.length ? (
            <NSpace vertical>
              {schema.ps.map((text) => {
                return (
                  <NText class="ml-4 mt-8 inline-block text-xs" depth={3}>
                    {text}
                  </NText>
                );
              })}
            </NSpace>
          ) : null}
        </>
      );
    };
  }
});

const SchemaSection = defineComponent({
  props: {
    schema: {
      type: Object as PropType<any>,
      required: true
    },
    formData: {
      type: Object as PropType<Ref<any>>,
      required: true
    },
    dataKey: {
      type: String as PropType<string>,
      required: true
    },
    property: {
      type: String as PropType<string>
    }
  },
  setup(props) {
    const { definitions, getKey } = inject(JSONSchemaFormInjectKey, {} as any);

    return () => {
      const { schema, formData, dataKey: key, property } = props;

      if (!schema) {
        return null;
      }

      return (
        <>
          {Object.keys(schema.properties).map((property) => {
            const current = schema.properties[property];

            if (current.$ref) {
              const nestSchmea = definitions.value.get(
                current.$ref.split("/").at(-1)
              );

              return (
                <SchemaSection
                  dataKey={`${getKey(key)}.${property}`}
                  formData={formData}
                  schema={nestSchmea}
                  property={property}
                />
              );
            }

            return (
              <ScheamFormItem
                value={get(
                  formData.value,
                  `${getKey(key)}.${property}`,
                  undefined
                )}
                onUpdateValue={(val) => {
                  if (get(formData.value, getKey(key))) {
                    set(formData.value, `${getKey(key)}.${property}`, val);
                  } else {
                    set(formData.value, getKey(key), {
                      ...get(formData.value, getKey(key), {}),
                      [property]: val
                    });
                  }
                }}
                title={current.title}
                type={current.type}
                options={current?.["ui:options"]}
                description={current.description}
              />
            );
          })}
        </>
      );
    };
  }
});

const ScheamFormItem = defineComponent({
  props: {
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    options: {
      type: Object,
      default: () => ({})
    },

    value: {
      type: Object as any,
      required: true
    },
    onUpdateValue: {
      type: Function as PropType<(value: any) => void>,
      required: true
    }
  },
  setup(props) {
    const innerValue = ref(props.value);

    watchEffect(() => {
      props.onUpdateValue(innerValue.value);
    });

    const renderComponent = () => {
      const { options } = props;

      switch (props.type) {
        case "url":
        case "string": {
          const { type: uiType } = options;

          switch (uiType) {
            case "select":
              const { values } = options as {
                values: { label: string; value: string }[];
              };
              return (
                <NSelect
                  value={innerValue.value}
                  onUpdateValue={(val) => {
                    innerValue.value = val;
                  }}
                  options={values}
                  filterable
                />
              );
            default:
              return (
                <NInput
                  inputProps={{
                    id: uuid()
                  }}
                  value={innerValue.value}
                  onUpdateValue={(val) => {
                    innerValue.value = val;
                  }}
                  type={uiType || "text"}
                  showPasswordOn="click"
                  autosize={
                    uiType == "textarea"
                      ? {
                          maxRows: 5,
                          minRows: 3
                        }
                      : undefined
                  }
                  clearable
                />
              );
          }
        }
        case "array": {
          return (
            <NDynamicTags
              value={innerValue.value}
              onUpdateValue={(val) => {
                innerValue.value = val;
              }}
            />
          );
        }
        case "boolean": {
          return (
            <NSwitch
              value={innerValue.value}
              onUpdateValue={(val) => {
                innerValue.value = val;
              }}
            />
          );
        }

        case "integer": {
          return (
            <NInputNumber
              value={innerValue.value}
              onUpdateValue={(val) => {
                innerValue.value = val;
              }}
            />
          );
        }
        default:
          return null;
      }
    };

    const uiStore = useStoreRef(UIStore);
    const gridCols = computed(() => (uiStore.viewport.value.mobile ? 1 : 2));
    return () => {
      const { title, options, description } = props;

      const base = (
        <>
          <NFormItem label={title}>
            {description ? (
              <NSpace class={"w-full"} vertical>
                {renderComponent()}

                <NText class="text-xs" depth={3}>
                  <span innerHTML={marked.parse(description) as string} />
                </NText>
              </NSpace>
            ) : (
              renderComponent()
            )}
          </NFormItem>
        </>
      );

      if (options.halfGrid && gridCols.value === 2) {
        return <div class={"inline-block w-1/2"}>{base}</div>;
      }

      return base;
    };
  }
});

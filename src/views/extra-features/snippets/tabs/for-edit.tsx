import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { KVEditor } from "~/components/kv-editor";
import { dump, load } from "js-yaml";
import JSON5 from "json5";
import { TwoColGridLayout } from "~/layouts/two-col";
import { omit } from "lodash-es";
import {
  NForm,
  NFormItem,
  NGi,
  NInput,
  NP,
  NPopover,
  NSelect,
  NSwitch,
  NText,
  useMessage
} from "naive-ui";
import { RESTManager } from "~/utils";
import { useRoute, useRouter } from "vue-router";

import { useStorage } from "@vueuse/core";

import {
  SnippetModel,
  SnippetType,
  SnippetTypeToLanguage,
  defaultServerlessFunction
} from "../../../../models/snippet";
import { CodeEditorForSnippet } from "../components/code-editor";
import { InstallDependencyButton } from "../components/install-dep-button";
import { OffsetHeaderLayout } from "~/layouts";

export const Tab2ForEdit = defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    const editId = computed(() => route.query.id as string);

    const data = useStorage<SnippetModel>(
      editId.value ? `snippet-${editId.value}` : "snippet",
      new SnippetModel(),

      editId.value ? localStorage : sessionStorage
    );

    const typeToValueMap = reactive<Record<SnippetType, string>>(
      // 有 Id 的情况下，避免闪白，留空数据
      editId.value
        ? { json: "", yaml: "", text: "", function: "", json5: "" }
        : {
            json: JSON.stringify({ name: "hello world" }, null, 2),
            text: "",
            yaml: `name: hello world`,
            function: defaultServerlessFunction,
            json5: JSON5.stringify({ name: "hello world" }, null, 2)
          }
    );

    let jsonFormatBeforeType: SnippetType = SnippetType.JSON;
    // 监听 type 变化，实时同时 typeToValueMap 中的值 到 data.raw
    watch(
      () => data.value.type,
      (type, beforeType) => {
        if (type === "function" || type === "text") {
          data.value.raw = typeToValueMap[type];

          if (type != "text") {
            data.value.method ??= "GET";
            data.value.enable ??= true;
          }

          return;
        }

        if (beforeType !== "function" && beforeType !== "text") {
          jsonFormatBeforeType = beforeType;
        }

        const object = (() => {
          switch (jsonFormatBeforeType) {
            case "json": {
              return JSON.parse(typeToValueMap.json);
            }
            case "yaml": {
              return load(typeToValueMap.yaml);
            }

            case "json5": {
              return JSON5.parse(typeToValueMap.json5);
            }

            case "function": {
              // FIXME
              delete data.value.method;
              delete data.value.enable;
              return "";
            }
          }
        })();

        const current = (() => {
          switch (type) {
            case "json": {
              return JSON.stringify(object, null, 2);
            }
            case "yaml": {
              return dump(object);
            }

            case "json5": {
              return JSON5.stringify(object, null, 2);
            }
          }
        })();

        data.value.raw = current || "";
        typeToValueMap[type] = current || "";
      }
    );

    watch(
      () => [data.value.type, data.value.schema],
      ([type, schema]) => {
        if (type === SnippetType.JSON) {
          if (!data.value.schema) {
            import("monaco-editor").then((monaco) => {
              monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: false
              });
            });
            return;
          }
          const schemaUrl = data.value.schema;
          fetch(schemaUrl)
            .then((res) => res.text())
            .then((schema) => {
              import("monaco-editor").then((monaco) => {
                monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                  validate: true,
                  schemas: [
                    {
                      uri: schemaUrl,
                      fileMatch: ["*"],
                      schema: JSON.parse(schema)
                    }
                  ]
                });
              });
            });
        }
      }
    );

    onMounted(async () => {
      if (!editId.value) {
        return;
      }
      const _data = await RESTManager.api
        .snippets(editId.value)
        .get<SnippetModel>();
      switch (_data.type) {
        case SnippetType.JSON: {
          _data.raw = JSON.stringify(JSON5.parse(_data.raw), null, 2);

          break;
        }
      }
      data.value = _data;

      jsonFormatBeforeType = _data.type;

      // 同时更新 typeToValueMap 中的值
      typeToValueMap[_data.type] = _data.raw;
    });

    const message = useMessage();
    const handleUpdateOrCreate = async (routePushAfterDone = true) => {
      const tinyJson = (text: string) => {
        try {
          return JSON.stringify(JSON.parse(text), null, 0);
        } catch {
          message.error("JSON 格式错误");
        }
      };

      const handleRawText = () => {
        const currentTypeText = typeToValueMap[data.value.type];
        switch (data.value.type) {
          case SnippetType.JSON: {
            return tinyJson(currentTypeText);
          }
          case SnippetType.YAML: {
            try {
              load(currentTypeText);
            } catch {
              message.error("YAML 格式错误");
            }
            return currentTypeText;
          }

          case SnippetType.Function: {
            // TODO 验证，暂时不验证，服务端验证
            return currentTypeText;
          }
          default: {
            return currentTypeText;
          }
        }
      };

      const omitData = omit(data.value, ["_id", "id", "created", "data"]);
      const finalData = { ...omitData, raw: handleRawText() };

      if (!finalData.metatype) {
        delete finalData.metatype;
      }

      if (editId.value) {
        await RESTManager.api.snippets(editId.value).put({
          data: finalData
        });
      } else {
        await RESTManager.api.snippets.post({
          data: finalData
        });
      }

      message.success(`${editId.value ? "更新" : "创建"}成功`);
      routePushAfterDone &&
        router.replace({
          query: {
            ...route.query,
            tab: 0
          }
        });
    };

    const isFunctionType = computed(
      () => data.value.type === SnippetType.Function
    );

    const isBuiltFunction = computed(
      () =>
        data.value.type === SnippetType.Function &&
        data.value.builtIn &&
        !!editId.value
    );

    return () => (
      <>
        <OffsetHeaderLayout className="space-x-2">
          <InstallDependencyButton />
          <RoundedIconButtonBase
            icon={<i class="icon-[mingcute--check-circle-line] size-4" />}
            className="bg-emerald-500"
            onClick={() => handleUpdateOrCreate()}
          />
        </OffsetHeaderLayout>
        <div class={"pb-5"}>
          <TwoColGridLayout>
            <NGi span={12} class={"h-[calc(100vh-26rem)]"}>
              <NForm>
                {isBuiltFunction.value && (
                  <NP>
                    这是一个内置函数，无法修改元信息。但是你可以自定义函数实现。
                  </NP>
                )}
                <NFormItem label="名称" required>
                  <NInput
                    class={"rounded-lg"}
                    onUpdateValue={(e) => void (data.value.name = e)}
                    value={data.value.name}
                    disabled={isBuiltFunction.value}
                  />
                </NFormItem>

                <NFormItem label="引用" required>
                  <NInput
                    class={"rounded-lg"}
                    value={data.value.reference}
                    onUpdateValue={(e) => void (data.value.reference = e)}
                    defaultValue={"root"}
                    disabled={isBuiltFunction.value}
                  />
                </NFormItem>

                {!isFunctionType.value && (
                  <NFormItem label="元类型">
                    <NInput
                      class={"rounded-lg"}
                      value={data.value.metatype}
                      onUpdateValue={(e) => void (data.value.metatype = e)}
                    />
                  </NFormItem>
                )}

                <NFormItem label="数据类型">
                  <NPopover>
                    {{
                      default() {
                        return "设定为 Function 类型无法再更改其类型";
                      },
                      trigger() {
                        return (
                          <NSelect
                            value={data.value.type}
                            defaultValue={SnippetType.JSON}
                            onUpdateValue={(val) =>
                              void (data.value.type = val)
                            }
                            options={Object.entries(SnippetType).map(
                              ([k, v]) => {
                                return {
                                  label: k,
                                  value: v
                                };
                              }
                            )}
                            disabled={!!(editId.value && isFunctionType.value)}
                            themeOverrides={{
                              peers: {
                                InternalSelection: {
                                  borderRadius: "0.5rem"
                                }
                              }
                            }}
                          />
                        );
                      }
                    }}
                  </NPopover>
                </NFormItem>
                {isFunctionType.value && (
                  <>
                    <NFormItem label="启用" labelPlacement={"left"}>
                      <NSwitch
                        class={"flex w-full justify-end"}
                        value={data.value.enable}
                        onUpdateValue={(value) => {
                          data.value.enable = value;
                        }}
                        disabled={isBuiltFunction.value}
                      />
                    </NFormItem>

                    <NFormItem label="请求方式">
                      <NSelect
                        disabled={isBuiltFunction.value}
                        options={[
                          "GET",
                          "POST",
                          "PUT",
                          "DELETE",
                          "PATCH",
                          "ALL"
                        ].map((v) => {
                          return {
                            label: v,
                            value: v
                          };
                        })}
                        value={data.value.method}
                        onUpdateValue={(value) => {
                          data.value.method = value;
                        }}
                        themeOverrides={{
                          peers: {
                            InternalSelection: {
                              borderRadius: "0.5rem"
                            }
                          }
                        }}
                      />
                    </NFormItem>

                    <NFormItem label="Secret">
                      <KVEditor
                        key={data.value.id}
                        plainKeyInput
                        onChange={(kv) => {
                          data.value.secret = kv;
                        }}
                        value={data.value.secret || {}}
                      />
                    </NFormItem>
                  </>
                )}

                {!isFunctionType.value && (
                  <NFormItem label="Schema">
                    <NInput
                      class={"rounded-lg"}
                      value={data.value.schema}
                      onUpdateValue={(e) => void (data.value.schema = e)}
                    />
                  </NFormItem>
                )}
                <NFormItem label="公开" labelPlacement="left">
                  <NSwitch
                    disabled={isBuiltFunction.value}
                    class={"flex w-full justify-end"}
                    value={!data.value.private}
                    onUpdateValue={(val) => void (data.value.private = !val)}
                  />
                </NFormItem>
                <NFormItem label="备注">
                  <NInput
                    class={"rounded-lg"}
                    resizable={false}
                    value={data.value.comment}
                    onUpdateValue={(val) => void (data.value.comment = val)}
                    type="textarea"
                    rows={4}
                  />
                </NFormItem>
              </NForm>
              <NText class="ml-4 inline-block text-xs" depth={3}>
                # 云函数是 Mix Space 中的一个重要功能，它极大地辅助了使用者在
                Mix Space 中的体验。通过云函数，Mix Space
                可以额外实现实现歌单解析，追番列表等等的功能
              </NText>
            </NGi>

            <NGi span={24} class={"h-[calc(100vh-26rem)]"}>
              <CodeEditorForSnippet
                onSave={async () => {
                  await handleUpdateOrCreate(false);
                  message.success("Saved!");
                }}
                language={SnippetTypeToLanguage[data.value.type]}
                value={typeToValueMap[data.value.type]}
                onChange={(value) => {
                  typeToValueMap[data.value.type] = value;
                }}
              />
            </NGi>
          </TwoColGridLayout>
        </div>
      </>
    );
  }
});

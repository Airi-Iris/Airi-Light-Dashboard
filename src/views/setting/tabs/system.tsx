import { camelCase, cloneDeep, isEmpty, merge } from "lodash-es";
import { NButton, NCol, NRow, NSpace } from "naive-ui";
import { defineComponent, reactive, ref, toRaw, watch } from "vue";

import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { ConfigForm, SystemConfigForm } from "~/components/config-form";
import { useStoreRef } from "~/hooks/use-store-ref";
import { useLayout } from "~/layouts/content";
import { UIStore } from "~/stores/ui";
import { deepDiff, RESTManager } from "~/utils";
import styles from "./user.module.css";
import { OffsetHeaderLayout } from "~/layouts";
import { SettingDivider } from "./user";

const NFormPrefixCls = "mt-6";
const NFormBaseProps = {
  class: NFormPrefixCls,
  labelPlacement: "left",
  labelAlign: "right",
  labelWidth: 150,
  autocomplete: "chrome-off"
};

export const autosizeableProps = {
  autosize: true,
  clearable: true,
  style: "min-width: 300px; max-width: 100%"
} as const;
export const TabSystem = defineComponent(() => {
  const { setHeaderButtons: setHeaderButton } = useLayout();
  const isReady = ref(false);
  const isReadyForSave = ref(false);

  const schema = ref();

  onBeforeMount(async () => {
    schema.value = await RESTManager.api.config.jsonschema.get({
      transform: false
    });
    await fetchConfig().then(() => {
      isReady.value = true;
    });
  });

  let originConfigs: any = {};
  const configs = reactive({});
  const diff = ref({} as any);

  watch(
    () => configs,
    (n) => {
      diff.value = deepDiff(originConfigs, toRaw(n));
    },
    { deep: true }
  );
  watch(
    () => diff.value,
    (n) => {
      if (isEmpty(n)) {
        isReadyForSave.value = false;
      } else {
        isReadyForSave.value = true;
      }
    }
  );

  async function save() {
    if (isEmpty(diff.value)) {
      return;
    }

    const entries = Object.entries(diff.value) as [string, any][];

    for await (const [key, value] of entries) {
      const val = Object.fromEntries(
        Object.entries(value).map(([k, v]) => {
          if (Array.isArray(v)) {
            return [k, configs[key][k]];
          }
          return [k, v];
        })
      );

      await RESTManager.api.options(key).patch({
        data: val
      });
    }

    await fetchConfig().then(() => {
      isReady.value = true;
    });
    message.success("修改成功");
  }

  const fetchConfig = async () => {
    let response = (await RESTManager.api.options.get()) as any;
    response = merge(schema.value.default, response) as any;

    originConfigs = cloneDeep(response);

    Object.assign(configs, response);
  };

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

  const isMobile = uiStore.viewport.value.mobile;

  return () =>
    !isMobile ? (
      <Fragment>
        <OffsetHeaderLayout>
          <RoundedIconButtonBase
            icon={<i class="icon-[mingcute--archive-line]" />}
            className="bg-accent size-[28px]"
            name="保存当前设置"
            disabled={!isReadyForSave.value}
            onClick={save}
          />
        </OffsetHeaderLayout>
        <div
          class={[
            "flex flex-col w-full justify-center h-full transition-all duration-200",
            styles["settings"]
          ]}
        >
          {isReady.value && schema.value && (
            <>
              <SystemConfigForm
                initialValue={configs}
                getKey={(key) => {
                  return key
                    .split(".")
                    .map((kk) => camelCase(kk))
                    .join(".")
                    .replace("Dto", "");
                }}
                schema={schema.value}
              >
                <SettingDivider />
                <NRow class="justify-center !my-2">
                  <NCol span="6">
                    <NSpace class="justify-center !my-2">
                      <NButton
                        type="primary"
                        color="#0960bd"
                        class={"dark:text-[#f0f8ff] !h-[31px] rounded-md"}
                        disabled={!isReadyForSave.value}
                        onClick={save}
                        themeOverrides={{
                          textColorHoverPrimary: "#f0f8ff"
                        }}
                      >
                        保存当前设置
                      </NButton>
                      <NButton
                        secondary
                        class={"!h-[31px] rounded-md"}
                        disabled={!isReadyForSave.value}
                        onClick={() => {
                          location.reload();
                        }}
                      >
                        取消
                      </NButton>
                    </NSpace>
                  </NCol>
                  <NCol span="6" />
                </NRow>
              </SystemConfigForm>
            </>
          )}
        </div>
      </Fragment>
    ) : (
      <Fragment>
        <OffsetHeaderLayout>
          <RoundedIconButtonBase
            icon={<i class="icon-[mingcute--archive-line]" />}
            className="bg-accent size-[28px]"
            name="保存当前设置"
            disabled={!isReadyForSave.value}
            onClick={save}
          />
        </OffsetHeaderLayout>
        <div class={"p-8 pt-0"}>
          {schema.value && (
            <ConfigForm
              initialValue={configs}
              getKey={(key) => {
                return key
                  .split(".")
                  .map((kk) => camelCase(kk))
                  .join(".")
                  .replace("Dto", "");
              }}
              schema={schema.value}
            >
              {/* {{
            AdminExtraDto() {
              return (
                <>
                  <NFormItem label={"主题色"}>
                    <AppColorSetter />
                  </NFormItem>
                </>
              );
            }
          }} */}
            </ConfigForm>
          )}
        </div>
      </Fragment>
    );
});

// const AppColorSetter = defineComponent({
//   setup() {
//     const vars = useThemeVars();

//     const $style = document.createElement("style");
//     $style.innerHTML = `* { transition: none !important; }`;

//     return () => (
//       <div class={"flex items-center gap-2"}>
//         <NColorPicker
//           class={"w-36"}
//           value={vars.value.primaryColor}
//           onUpdateValue={(value) => {
//             document.head.appendChild($style);

//             Object.assign(colorRef.value, defineColors(value));
//             setTimeout(() => {
//               document.head.removeChild($style);
//             });
//           }}
//         ></NColorPicker>

//         <NButton
//           size="small"
//           ghost
//           onClick={() => {
//             Object.assign(colorRef.value, ThemeColorConfig);
//           }}
//         >
//           <span>重置</span>
//         </NButton>
//       </div>
//     );
//   }
// });

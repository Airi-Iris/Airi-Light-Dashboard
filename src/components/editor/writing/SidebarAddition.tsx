import { isURL } from "class-validator";
import { JSONHighlight } from "~/components/json-highlight";
import { isObject, isUndefined } from "lodash-es";
import {
  NCollapse,
  NCollapseItem,
  NDynamicInput,
  NImage,
  NInput,
  NModal,
  NPopover,
  NSelect,
  NTooltip
} from "naive-ui";
import { JSONParseReturnOriginal } from "~/utils/json";
import type { Image } from "@mx-space/api-client";
import type { SelectOption } from "naive-ui";
import type { PropType } from "vue";
import { ImageDetailSection } from "~/components/drawer/components/image-detail-section";
import { JSONEditor } from "~/components/drawer/components/json-editor";
import { Divider } from "~/components/header/divider";
import { VanillaButton } from "~/components/button/rounded-button";

export const SidebarAddition = defineComponent({
  props: {
    data: {
      type: Object as PropType<any>,
      required: true
    },

    labelWidth: {
      type: Number,
      required: false
    }
  },
  setup(props, { slots }) {
    const showJSONEditorModal = ref(false);
    const handleEdit = () => {
      showJSONEditorModal.value = true;
    };

    const keyValuePairs = ref([] as { key: string; value: string }[]);

    let inUpdatedKeyValue = false;

    watch(
      () => keyValuePairs.value,
      () => {
        inUpdatedKeyValue = true;
        props.data.meta = keyValuePairs.value.reduce((acc, { key, value }) => {
          return isUndefined(value) || value === ""
            ? acc
            : { ...acc, [key]: JSONParseReturnOriginal(value) };
        }, {});
      }
    );

    watch(
      () => props.data.meta,
      () => {
        if (inUpdatedKeyValue) {
          inUpdatedKeyValue = false;
          return;
        }

        if (props.data.meta && isObject(props.data.meta)) {
          keyValuePairs.value = Object.entries(props.data.meta).reduce(
            (acc, [key, value]): any => {
              return [
                ...acc,
                {
                  key,
                  value: JSON.stringify(value)
                }
              ];
            },
            []
          );
        }
      },
      {
        flush: "post",
        deep: true
      }
    );
    return () => (
      <>
        <>
          {slots.default?.()}

          <Divider className="my-2" />

          <ImageCoverItem
            images={props.data.images}
            onChange={(src) => {
              if (!props.data.meta) props.data.meta = {};
              if (src === null) {
                delete props.data.meta.cover;
                return;
              }
              props.data.meta.cover = src;
            }}
            value={props.data.meta?.cover}
          />

          <ImageDetailSection
            text={props.data.text}
            images={props.data.images}
            extraImages={
              props.data.meta?.cover ? [props.data.meta.cover] : undefined
            }
            onChange={(images) => {
              props.data.images = images;
            }}
          />

          <Divider className="my-4" />

          <div class="flex items-center justify-between space-x-2 text-[1em]">
            <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              附加字段
            </label>
            <VanillaButton onClick={handleEdit} variant="secondary">
              编辑
            </VanillaButton>
          </div>

          <NDynamicInput
            preset="pair"
            value={keyValuePairs.value}
            keyPlaceholder="附加字段名"
            valuePlaceholder="附加字段值"
            onUpdateValue={(value: any[]) => {
              keyValuePairs.value = value;
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

          {props.data.meta && (
            <NCollapse accordion class="mt-4">
              <NCollapseItem title="预览">
                <JSONHighlight
                  class="max-w-full overflow-auto"
                  code={JSON.stringify(props.data.meta, null, 2)}
                />
              </NCollapseItem>
            </NCollapse>
          )}
        </>
        <NModal
          show={showJSONEditorModal.value}
          onUpdateShow={(e) => {
            showJSONEditorModal.value = e;
          }}
          zIndex={2222}
          preset="card"
          closable
          closeOnEsc={false}
          title="编辑附加字段"
          onClose={() => {
            showJSONEditorModal.value = false;
          }}
          class="w-[unset]"
        >
          <JSONEditor
            value={
              props.data.meta ? JSON.stringify(props.data.meta, null, 2) : ""
            }
            onFinish={(jsonString) => {
              try {
                inUpdatedKeyValue = false;
                const parsed = JSON.parse(jsonString);

                // console.log(parsed)
                props.data.meta = parsed;

                showJSONEditorModal.value = false;
              } catch (error: any) {
                message.error(error.message);
              }
            }}
          />
        </NModal>
      </>
    );
  }
});

const ImageCoverItem = defineComponent({
  props: {
    images: {
      type: Array as PropType<Image[]>,
      required: true
    },
    onChange: {
      type: Function as PropType<(image: string | null) => void>,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const isValidated = ref(true);
    const validateAndCallback = (value: string) => {
      if (!value) {
        isValidated.value = true;
        props.onChange(null);
        return;
      }
      if (isURL(value)) isValidated.value = true;
      else isValidated.value = false;

      props.onChange(value);
    };
    const show = ref(false);
    return () => (
      <div class="flex items-center justify-between space-x-2 text-[1em] w-full">
        <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[120px]">
          文章缩略图
        </label>
        <NPopover
          placement="left"
          show={show.value}
          onUpdateShow={(newValue) => {
            if (newValue && !props.value) return;
            show.value = newValue;
          }}
        >
          {{
            trigger() {
              return props.images.length > 0 ? (
                <NSelect
                  status={isValidated.value ? undefined : "error"}
                  value={props.value}
                  onUpdateValue={validateAndCallback}
                  options={(props.images as Image[]).map((image) => ({
                    label: image.src,
                    value: image.src
                  }))}
                  filterable
                  tag
                  clearable
                  maxTagCount={1}
                  renderOption={({
                    node,
                    option
                  }: {
                    node: VNode;
                    option: SelectOption;
                  }) =>
                    h(
                      NTooltip,
                      { placement: "left" },
                      {
                        trigger: () => node,
                        default: () => (
                          <NImage
                            src={option.value as string}
                            alt="popover"
                            width={400}
                          />
                        )
                      }
                    )
                  }
                  themeOverrides={{
                    peers: {
                      InternalSelection: {
                        borderRadius: "0.5rem"
                      }
                    }
                  }}
                />
              ) : (
                <NInput
                  value={props.value}
                  status={isValidated.value ? undefined : "error"}
                  onUpdateValue={validateAndCallback}
                  placeholder={"https?://..."}
                  themeOverrides={{
                    borderRadius: "0.5rem"
                  }}
                />
              );
            },
            default() {
              if (!props.value) return null;
              return <NImage src={props.value} alt="cover" width={400} />;
            }
          }}
        </NPopover>
      </div>
    );
  }
});

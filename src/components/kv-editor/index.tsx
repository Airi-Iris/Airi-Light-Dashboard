import { isEmpty } from "lodash-es";
import { NDynamicInput, NInput, NSelect } from "naive-ui";
import type { SelectMixedOption } from "naive-ui/lib/select/src/interface";
import type { PropType } from "vue";

export const KVEditor = defineComponent({
  props: {
    value: {
      type: Object as PropType<Record<string, string | boolean | number>>,
      required: true
    },
    onChange: {
      type: Function as PropType<(value: Record<string, string>) => void>,
      required: true
    },
    options: {
      type: Array as PropType<SelectMixedOption[]>,
      required: false
    },
    plainKeyInput: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const KVArray = ref<{ key: string; value: string }[]>([]);

    const keySet = ref(new Set<string>());
    onMounted(() => {
      if (!isEmpty(props.value)) {
        const arr = Object.entries(props.value).map(([k, v]) => {
          keySet.value.add(k);
          return {
            key: k,
            value: v.toString()
          };
        });
        KVArray.value = arr;
      }
    });
    watch(
      () => KVArray.value,
      (newValue) => {
        const record = newValue.reduce(
          (acc, cur) => {
            // filter empty key value
            if (cur.key === "" && cur.value === "") {
              return acc;
            }
            acc[cur.key] = cur.value.toString();
            return acc;
          },
          {} as { [key: string]: string }
        );
        props.onChange(record);
      },
      { deep: true }
    );

    watch(
      () => KVArray.value,
      (newValue) => {
        keySet.value.clear();
        newValue.forEach((item) => {
          keySet.value.add(item.key);
        });
      },
      { deep: true }
    );

    return () => (
      <NDynamicInput
        value={KVArray.value}
        onUpdateValue={(e: any[]) => {
          KVArray.value = (() => {
            // FIXME: naive ui will gave a  null value on insert pos
            const nullIdx = e.indexOf(null);
            if (nullIdx !== -1) {
              e.splice(nullIdx, 1, { key: "", value: "" });
            }

            return e;
          })();
        }}
        createButtonProps={{
          secondary: true,
          type: "info",
          ghost: false,
          bordered: true,
          quaternary: false
        }}
      >
        {{
          default(rowProps: {
            index: number;
            value: (typeof KVArray.value)[0];
          }) {
            return (
              <div class="flex w-full items-center">
                {props.plainKeyInput ? (
                  <NInput
                    class="mr-4"
                    placeholder={"请输入"}
                    value={rowProps.value.key}
                    onUpdateValue={(key) => {
                      rowProps.value.key = key;
                    }}
                  />
                ) : (
                  <NSelect
                    class="mr-4"
                    filterable
                    tag
                    placeholder="请选择"
                    value={rowProps.value.key}
                    onUpdateValue={(key) => {
                      rowProps.value.key = key;
                    }}
                    options={props.options?.map((option) => ({
                      ...option,
                      disabled: keySet.value.has(option.value as string)
                    }))}
                  />
                )}
                <NInput
                  value={rowProps.value.value.toString()}
                  onUpdateValue={(id) => {
                    rowProps.value.value = id;
                  }}
                />
              </div>
            );
          }
        }}
      </NDynamicInput>
    );
  }
});

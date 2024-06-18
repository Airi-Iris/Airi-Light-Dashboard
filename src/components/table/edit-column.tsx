import { useStoreRef } from "~/hooks/use-store-ref";
import { NInput, NSelect, useMessage } from "naive-ui";
import { CategoryStore } from "~/stores/category";
import { defineComponent, ref, watch } from "vue";
import type { SelectMixedOption } from "naive-ui/lib/select/src/interface";
import type { PropType } from "vue";

export const EditColumn = defineComponent({
  props: {
    initialValue: {
      type: String,
      required: true
    },
    onSubmit: {
      type: Function as PropType<(value: string) => void>,
      required: true
    },
    placeholder: {
      type: String
    },

    type: {
      type: String as PropType<"input" | "select">,
      default: "input"
    },
    options: {
      type: Array as PropType<SelectMixedOption[]>,
      default: () => []
    },
    returnToConfrim: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const value = ref(props.initialValue);

    watch(
      () => props.initialValue,
      (n) => {
        value.value = n;
      }
    );

    const isEdit = ref(false);
    const inputRef = ref<HTMLInputElement>();
    const message = useMessage();
    watch(
      () => isEdit.value,
      (n) => {
        if (!props.returnToConfrim) {
          return;
        }
        if (n) {
          message.info("回车以完成修改", { duration: 1500 });
          requestAnimationFrame(() => {
            inputRef.value?.focus();
          });
        }
      }
    );
    const handleSubmit = () => {
      props.onSubmit(value.value);
      isEdit.value = false;
    };
    const categoryStore = useStoreRef(CategoryStore);
    return () => (
      <>
        {isEdit.value ? (
          <div class="relative flex w-full flex-nowrap items-center">
            {(() => {
              switch (props.type) {
                case "input": {
                  return (
                    <NInput
                      onKeydown={(e) => {
                        if (e.key == "Enter") {
                          handleSubmit();
                        }
                      }}
                      class="w-3/4"
                      value={value.value}
                      placeholder={props.placeholder ?? props.initialValue}
                      size="tiny"
                      autofocus
                      ref={inputRef}
                      onBlur={() => {
                        isEdit.value = false;
                      }}
                      onInput={(e) => {
                        value.value = e;
                      }}
                    />
                  );
                }
                case "select": {
                  return (
                    <NSelect
                      class="w-full"
                      placeholder={props.placeholder ?? props.initialValue}
                      value={value.value}
                      onUpdateValue={(e) => {
                        value.value = e;
                        handleSubmit();
                      }}
                      onBlur={() => {
                        isEdit.value = false;
                      }}
                      options={props.options}
                    />
                  );
                }
              }
            })()}
          </div>
        ) : (
          <button
            class="w-full text-left"
            onClick={() => {
              isEdit.value = true;
            }}
          >
            {props.initialValue}&nbsp;
          </button>
        )}
      </>
    );
  }
});

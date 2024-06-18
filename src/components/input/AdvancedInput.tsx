import { defineComponent, onMounted, ref } from "vue";

import { inputBaseProps } from "./base";
import { clsxm } from "~/utils/helper";
import { uniqueId } from "lodash-es";
import { Label } from "../label/Label";
import clsx from "clsx";

export const AdvancedInput = defineComponent({
  props: {
    ...inputBaseProps,
    label: {
      type: String,
      required: true
    },
    labelPlacement: {
      type: String as PropType<"top" | "left" | "inside">
    },
    labelClassNames: {
      type: String
    },
    inputClassNames: {
      type: String
    },
    focusClassNames: {
      type: String
    }
  },
  emits: ["compositionend", "compositionstart"],
  setup(props, { emit }) {
    const inputRef = ref<HTMLInputElement>();
    const isFocused = ref(false);

    const handleFocus = () => {
      isFocused.value = true;
    };

    const handleBlur = () => {
      isFocused.value = false;
    };
    const id = uniqueId(":rx").concat(":");
    onMounted(() => {
      if (!inputRef.value) {
        return;
      }
      inputRef.value.addEventListener("compositionstart", () => {
        emit("compositionstart");
      });

      inputRef.value.addEventListener("compositionend", () => {
        emit("compositionend");
      });
    });

    return () => (
      <>
        <div
          class={clsxm(
            {
              "flex flex-col": props.labelPlacement === "top",
              "flex grow flex-row items-center": props.labelPlacement === "left"
            },
            "peer relative",
            props.className
          )}
        >
          {props.label && (
            <>
              <Label
                id={id}
                class={clsx(
                  {
                    "mr-4": props.labelPlacement === "left",
                    "mb-2 flex": props.labelPlacement === "top"
                  },
                  props.labelPlacement === "inside" && {
                    "absolute left-3 top-2 z-[1] select-none duration-200":
                      true,
                    "text-primary": isFocused.value,
                    "bottom-2 top-2 flex items-center text-lg":
                      !props.value && !isFocused.value
                  },
                  isFocused.value ? props.focusClassNames : "",
                  props.labelClassNames
                )}
              >
                {props.label}
              </Label>
            </>
          )}
          <div class={"relative grow"}>
            <input
              id={id}
              required
              ref={inputRef}
              type={props.type ?? "text"}
              value={props.value}
              onInput={(e) => props.onChange((e.target as any).value)}
              onBlur={(e) => {
                handleBlur();
                props.onBlur?.(e.target as any);
              }}
              onFocus={(e) => {
                handleFocus();
                props.onFocus?.(e.target as any);
              }}
              class={clsxm(
                "flex h-10 w-full rounded-md border px-3 py-2 text-sm caret-primary",
                "focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
                "border-zinc-200 bg-white placeholder:text-slate-500 focus-visible:border-primary dark:border-neutral-800 dark:bg-zinc-900",
                // 'placeholder:text-muted-foreground   border-base-200 bg-base-100 focus-visible:border-primary ',
                props.labelPlacement === "inside" && "h-auto pb-2 pt-8",
                props.inputClassNames
              )}
            />
          </div>
        </div>
      </>
    );
  }
});

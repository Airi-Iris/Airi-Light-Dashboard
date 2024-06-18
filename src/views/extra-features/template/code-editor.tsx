import { CenterSpin } from "~/components/spin";
import {
  useAsyncLoadMonaco,
  usePropsValueToRef
} from "~/hooks/use-async-monaco";
import type { PropType } from "vue";
import { clsxm } from "~/utils/helper";

export const CodeEditorForTemplateEditing = defineComponent({
  props: {
    value: {
      type: String,
      required: true
    },
    onChange: {
      type: Function as PropType<(str: string) => void>,
      required: true
    }
  },
  setup(props) {
    const editorRef = ref();
    const value = usePropsValueToRef(props);

    const obj = useAsyncLoadMonaco(editorRef, value, props.onChange, {
      language: "html"
    });

    return () => (
      <div class={"relative h-full w-full custom-ef-mst"}>
        <div
          ref={editorRef}
          class={clsxm(
            "grow overflow-auto rounded-xl border p-3 duration-200 focus-within:border-accent relative h-full w-full functionEditor",
            "border-zinc-200 bg-white placeholder:text-slate-500 focus-visible:border-accent dark:border-neutral-800 dark:bg-zinc-900"
          )}
        />
        {!obj.loaded.value && (
          <CenterSpin description="Monaco 体积较大耐心等待加载完成..." />
        )}
      </div>
    );
  }
});

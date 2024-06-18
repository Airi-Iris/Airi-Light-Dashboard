import { render } from "ejs";
import type { PropType } from "vue";

export const EJSRender = defineComponent({
  props: {
    template: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    onError: {
      type: Function as PropType<(err: Error) => void>
    }
  },
  setup(props) {
    const html = ref("");
    watch(
      () => props.template,
      async () => {
        html.value = await render(props.template, props.data, {
          async: true
        }).catch((error) => {
          props.onError?.(error);

          console.error(error);

          return html.value;
        });
      },
      { immediate: true }
    );

    return () => (
      <div class="flex center h-full overflow-auto dark:bg-white rounded-lg">
        <div innerHTML={html.value}></div>
      </div>
    );
  }
});

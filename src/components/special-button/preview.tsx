import { debounce } from "lodash-es";

import { RESTManager } from "~/utils";

import { HeaderActionButtonWithDesc } from "../button/rounded-button";
import { useUIStore } from "~/stores/ui";
import { NSplit } from "naive-ui";

export type PreviewButtonExposed = {
  getWindow: () => Window | null;
};

const iframeRef = ref<HTMLIFrameElement | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);

export const HeaderPreviewButton = defineComponent({
  props: {
    getData: {
      type: Function as PropType<() => any>,
      required: true
    },

    iframe: {
      type: Boolean,
      default: false
    }
  },
  expose: ["getWindow"],
  setup(props, { expose }) {
    let previewKey = "";
    const PREVIEW_HASH = Math.random().toString(36).substring(2);

    onBeforeUnmount(() => {
      if (previewKey) {
        localStorage.removeItem(previewKey);
      }
    });
    let webUrl = "";

    let isInPreview = false;
    let previewWindowOrigin = "";
    let previewWindow = null as null | Window;

    expose({
      getWindow: () => previewWindow
    });

    const uiStore = useUIStore();

    const handlePreview = async () => {
      const { getData } = props;
      const data = getData();
      const { id } = data;
      if (!webUrl) {
        const res = await RESTManager.api.options.url
          .get<any>()
          .then((data) => data.data);
        webUrl = res.webUrl;
      }

      let url: URL;
      if (import.meta.env.DEV) {
        url = new URL("/preview", "http://localhost:2323");
      } else {
        url = new URL("/preview", webUrl);
      }

      const storageKey = `mx-preview-${id ?? "new"}`;

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          ...data,
          id: `preview-${id ?? "new"}`
        })
      );

      url.searchParams.set("storageKey", storageKey);
      url.searchParams.set("origin", location.origin);
      url.searchParams.set("key", PREVIEW_HASH);

      const finalUrl = url.toString();

      let forkWindow: Window | null = null;

      if (props.iframe && !uiStore.viewport.mobile && !iframeRef.value) {
        const iframe = document.createElement("iframe");
        iframe.src = finalUrl;

        iframeRef.value = iframe;
        const $wrapper = wrapperRef.value;
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        if ($wrapper) $wrapper.appendChild(iframe);

        forkWindow = iframe.contentWindow;
      } else {
        forkWindow = window.open(finalUrl);

        iframeRef.value = null;
      }
      if (!forkWindow) {
        message.error("打开预览失败");
        return;
      }

      previewKey = storageKey;
      isInPreview = true;
      previewWindowOrigin = url.origin;
      previewWindow = forkWindow;
    };

    onUnmounted(() => {
      if (iframeRef.value) {
        iframeRef.value.remove();
        iframeRef.value = null;
      }
    });

    onMounted(() => {
      const handler = (e: MessageEvent<any>): void => {
        if (!isInPreview) return;
        if (e.origin !== previewWindowOrigin) return;

        if (e.data !== "ok") return;

        console.debug("ready", e.origin);

        const sendEvent = () => {
          if (!previewWindow) return;
          const data = props.getData();

          console.debug("send to origin", previewWindowOrigin);
          previewWindow.postMessage(
            JSON.stringify({
              type: "preview",
              key: PREVIEW_HASH,
              data: {
                ...data,
                id: `preview-${data.id ?? "new"}`
              }
            }),
            previewWindowOrigin
          );

          previewWindow.postMessage(
            JSON.stringify({
              type: "preview",
              key: PREVIEW_HASH,
              data: {
                ...data,
                id: `preview-${data.id ?? "new"}`
              }
            }),
            previewWindowOrigin
          );
        };
        sendEvent();

        // window.pr = previewWindow;
      };

      window.addEventListener("message", handler);

      onBeforeUnmount(() => {
        window.removeEventListener("message", handler);
      });
    });

    const handler = debounce(() => {
      if (!isInPreview) return;
      if (!previewWindowOrigin) return;
      if (!previewWindow) return;

      const data = props.getData();

      previewWindow.postMessage(
        JSON.stringify({
          type: "preview",
          key: PREVIEW_HASH,
          data: {
            ...data,
            id: `preview-${data.id ?? "new"}`
          }
        }),
        previewWindowOrigin
      );
    }, 100);

    watch(() => props.getData(), handler, { deep: true });

    // window.addEventListener(EmitKeyMap.EditDataUpdate, handler);

    // onBeforeUnmount(() => {
    //   window.removeEventListener(EmitKeyMap.EditDataUpdate, handler);
    // });

    return () => (
      <HeaderActionButtonWithDesc
        variant="secondary"
        class="rounded-lg"
        description="预览"
        icon={<i class="icon-[mingcute--search-3-line] size-[16px]" />}
        onClick={handlePreview}
      />
    );
  }
});

const PreviewIframe = defineComponent({
  setup() {
    onUnmounted(() => {
      wrapperRef.value = null;
    });

    return () => {
      return <div class={"h-full w-full"} ref={wrapperRef} />;
    };
  }
});

export const PreviewSplitter = defineComponent({
  setup(_, { slots }) {
    const size = ref(1);
    const uiStore = useUIStore();
    watchEffect(() => {
      if (iframeRef.value) {
        size.value = 0.5;
        uiStore.sidebarCollapse = true;
      } else {
        size.value = 1;
      }
    });
    return () => {
      return (
        <NSplit
          min="500px"
          size={size.value}
          onUpdateSize={(s) => {
            size.value = s;
          }}
          disabled={!iframeRef.value}
          direction="horizontal"
          class={"relative h-full w-full custom-w-nsp"}
          pane1Class="h-full flex"
          pane2Class="mt-[50.0px] rounded-xl"
        >
          {{
            1() {
              return (
                <div class={"flex flex-grow flex-col"}>{slots.default?.()}</div>
              );
            },
            2() {
              return <PreviewIframe />;
            }
          }}
        </NSplit>
      );
    };
  }
});

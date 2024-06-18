/**
 * 编辑器切换
 *
 */

import { SettingsIcon } from "~/components/icons";
import { NCard, NForm, NModal } from "naive-ui";
import { defineComponent, ref } from "vue";

import { Icon } from "@vicons/utils";

import { useMountAndUnmount } from "~/hooks/use-lifecycle";

import { CodemirrorEditor } from "../codemirror/codemirror";
import { editorBaseProps } from "./props";

import "./index.css";

import type { EditorRef } from "./types";
import { clsxm } from "~/utils/helper";
import { useCommonEditorConfig } from "./use-common-editor-setting";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { useEditorConfig } from "./use-editor-setting";
import { useLayout } from "~/layouts/content/EditorLayer";

export const Editor = defineComponent({
  name: "EditorX",
  props: {
    ...editorBaseProps,
    loading: {
      type: Boolean,
      required: true
    }
  },
  expose: ["setValue"],
  setup(props, { expose }) {
    const modalOpen = ref(false);
    const layout = useLayout();
    const uiStore = useStoreRef(UIStore);

    useMountAndUnmount(() => {
      const isM = uiStore.viewport.value.mobile;
      if (isM) {
        const settingButton = layout.addFloatButton(
          <button
            onClick={() => {
              modalOpen.value = true;
            }}
          >
            <Icon size={18}>
              <SettingsIcon />
            </Icon>
          </button>
        );

        return () => {
          layout.removeFloatButton(settingButton);
        };
      }
    });

    const { general, destory } = useCommonEditorConfig();
    const { general: mGen, destory: mDes } = useEditorConfig();

    onUnmounted(() => {
      destory();
      mDes();
    });

    const Modal = defineComponent({
      setup() {
        const handleModalClose = () => {
          modalOpen.value = false;
        };
        const { Panel: GeneralSetting } = mGen;

        const handleUpdateShow = (s: boolean) => void (modalOpen.value = s);
        return () => (
          <NModal
            transformOrigin="center"
            show={modalOpen.value}
            onUpdateShow={handleUpdateShow}
          >
            <NCard
              closable
              onClose={handleModalClose}
              title="编辑器设定"
              style="max-width: 90vw;width: 500px; max-height: 65vh; overflow: auto"
              bordered={false}
            >
              <NForm labelPlacement="left" labelWidth="8rem" labelAlign="right">
                <GeneralSetting />
              </NForm>
            </NCard>
          </NModal>
        );
      }
    });

    const MenuBar = defineComponent({
      setup(props, ctx) {
        const { Panel: GeneralSetting } = general;

        return () => (
          <div class="my-2 flex w-full flex-wrap space-x-2">
            <NForm
              labelPlacement="left"
              labelAlign="left"
              class={"flex flex-row space-x-3 h-[31.5px] mb-2"}
              size="small"
              show-feedback={false}
            >
              <GeneralSetting />
            </NForm>
          </div>
        );
      }
    });

    const cmRef = ref<EditorRef>();

    expose({
      setValue: (value: string) => {
        cmRef.value?.setValue(value);
      }
    });

    return () => {
      const { setting: generalSetting } = general;
      const isMobile = uiStore.viewport.value.mobile;

      return (
        <>
          {!isMobile && <MenuBar />}
          <div
            class={clsxm(
              "relative h-0 grow overflow-auto rounded-xl border p-3 duration-200 focus-within:border-accent",
              "border-zinc-200 bg-white placeholder:text-slate-500 focus-visible:border-accent dark:border-neutral-800 dark:bg-zinc-900"
            )}
            style={
              {
                "--editor-font-size": generalSetting.fontSize
                  ? `${generalSetting.fontSize / 14}rem`
                  : "",
                "--editor-font-family": generalSetting.fontFamily
              } as any
            }
          >
            <CodemirrorEditor ref={cmRef} {...props} />
          </div>
          {isMobile && <Modal />}
        </>
      );
    };
  }
});

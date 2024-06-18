import { HeaderActionButtonWithDesc } from "~/components/button/rounded-button";
import { PlainEditor } from "~/components/editor/plain/plain";
import { QuestionCircleIcon } from "~/components/icons";
import { load } from "js-yaml";
import {
  NButton,
  NCard,
  NCode,
  NModal,
  NP,
  NPopover,
  NSpace,
  NText
} from "naive-ui";
import { defineComponent, ref } from "vue";
import { Icon } from "@vicons/utils";
import type { PropType } from "vue";

export const ParseContentButton = defineComponent({
  props: {
    data: {
      type: Object as PropType<{ title: string; text: string }>,
      required: true
    },
    onHandleYamlParsedMeta: {
      type: Function as PropType<(data: Record<string, any>) => void>,
      required: false
    }
  },
  setup(props) {
    const parseContentDialogShow = ref(false);
    const unparsedValue = ref("");
    const handleParseContent = (value: string) => {
      value = value.trim();

      const hasHeaderYaml = /^---\n((.|\n)*?)\n---/.exec(value);

      if (hasHeaderYaml?.length) {
        const headerYaml = hasHeaderYaml[1];
        const meta: Record<string, any> = load(headerYaml) as any;

        props.onHandleYamlParsedMeta && props.onHandleYamlParsedMeta(meta);

        // remove header yaml
        value = value.replace(hasHeaderYaml[0], "");
      }
      // trim value again
      const str = value.trim();
      const lines = str.split("\n");
      // if first line is not empty, start with `#`
      const title = lines[0].startsWith("#")
        ? lines[0].replace(/^#/, "").trim()
        : "";

      if (title) {
        props.data.title = title;
        lines.shift();
      }

      props.data.text = lines.join("\n").trim();

      parseContentDialogShow.value = false;
    };

    return () => (
      <>
        <HeaderActionButtonWithDesc
          icon={<i class="icon-[mingcute--hashtag-line] size-[16px]" />}
          class="rounded-lg"
          variant="secondary"
          description="导入"
          onClick={() => (parseContentDialogShow.value = true)}
        />

        <NModal
          transformOrigin="center"
          show={parseContentDialogShow.value}
          onUpdateShow={(s) => (parseContentDialogShow.value = s)}
        >
          <NCard
            class="modal-card"
            closable
            onClose={() => (parseContentDialogShow.value = false)}
          >
            {{
              header() {
                return (
                  <div class="relative flex items-center space-x-4">
                    <NText>解析 Markdown</NText>
                    <NPopover trigger="hover" placement="right">
                      {{
                        default() {
                          return (
                            <div class="max-w-[80ch] overflow-auto">
                              <NP>
                                可以解析 Markdown with YAML 格式的文本，例如：
                              </NP>
                              <NCode
                                code={`---
date: 2021-04-18T09:33:33.271Z
updated: 2021-04-18T09:33:33.267Z
title: 虚拟列表与 Scroll Restoration
slug: visualize-list-scroll-restoration
categories: 编程
type: post
permalink: posts/visualize-list-scroll-restoration
---


虚拟列表是为了提高页面性能而出现的。`}
                              />
                            </div>
                          );
                        },
                        trigger() {
                          return (
                            <Icon>
                              <QuestionCircleIcon />
                            </Icon>
                          );
                        }
                      }}
                    </NPopover>
                  </div>
                );
              },

              default() {
                return (
                  <NSpace vertical size={"large"}>
                    <PlainEditor
                      class="h-[70vh]"
                      onChange={(e) => void (unparsedValue.value = e)}
                      text={unparsedValue.value}
                      unSaveConfirm={false}
                    />
                    <NSpace justify="end">
                      <NButton
                        round
                        type="primary"
                        onClick={() => handleParseContent(unparsedValue.value)}
                      >
                        确定
                      </NButton>
                      <NButton
                        onClick={(_) => {
                          unparsedValue.value = "";
                        }}
                        round
                      >
                        重置
                      </NButton>
                    </NSpace>
                  </NSpace>
                );
              }
            }}
          </NCard>
        </NModal>
      </>
    );
  }
});

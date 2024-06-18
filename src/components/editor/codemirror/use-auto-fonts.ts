import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

import { useEditorConfig } from "../universal/use-editor-setting";
import { codemirrorReconfigureExtensionMap } from "./extension";
import type { EditorView } from "@codemirror/view";

export const monospaceFonts = `"OperatorMonoSSmLig Nerd Font","Cascadia Code PL","FantasqueSansMono Nerd Font","operator mono","Fira code Retina","Fira code","Consolas", Monaco, "Hannotate SC", monospace, -apple-system`;

const markdownTags = [
  tags.heading1,
  tags.heading2,
  tags.heading3,
  tags.heading4,
  tags.heading5,
  tags.heading6,
  tags.strong,
  tags.emphasis,
  tags.deleted,
  tags.content,
  tags.url,
  tags.link
];

export const useCodeMirrorConfigureFonts = (
  editorView: Ref<EditorView | undefined>
) => {
  const { general } = useEditorConfig();

  watch(
    () => [general.setting.fontFamily, editorView.value],
    ([fontFamily]) => {
      if (!editorView.value) return;
      const sansFonts = fontFamily || "var(--sans-font)";

      const fontStyles = HighlightStyle.define([
        {
          tag: [tags.processingInstruction, tags.monospace],
          fontFamily: monospaceFonts
        },
        { tag: markdownTags, fontFamily: sansFonts }
      ]);

      editorView.value.dispatch({
        effects: [
          codemirrorReconfigureExtensionMap.fonts.reconfigure([
            syntaxHighlighting(fontStyles)
          ])
        ]
      });
    },
    {
      immediate: true,
      flush: "post"
    }
  );
};

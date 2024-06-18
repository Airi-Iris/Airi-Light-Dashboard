import { useStorageObject } from "~/hooks/use-storage";
import { NFormItem, NInput, NInputNumber, NSwitch } from "naive-ui";

import { GeneralSettingDto } from "./editor-config";
import { ResetIconButton } from "./reset-icon-button";

const StorageKeys = {
  editor: "editor-pref",
  general: "editor-general"
} as const;
export const useCommonEditorConfig = () => {
  const {
    storage: generalSetting,
    reset: resetGeneralSetting,
    destory: generalDestory
  } = useStorageObject(GeneralSettingDto, StorageKeys.general);

  const destory = () => {
    generalDestory();
  };

  const GeneralSetting = defineComponent(() => {
    return () => (
      <>
        <NFormItem label="字体设定">
          <NInput
            onInput={(e) => void (generalSetting.fontFamily = e)}
            value={generalSetting.fontFamily}
          />
        </NFormItem>
        <NFormItem label="字号设定" class={"w-[150px]"}>
          <NInputNumber
            onUpdateValue={(e) => void (generalSetting.fontSize = e ?? 14)}
            value={generalSetting.fontSize}
          />
        </NFormItem>

        <NFormItem label="自动纠正标点">
          <NSwitch
            value={generalSetting.autocorrect}
            onUpdateValue={(e) => void (generalSetting.autocorrect = e)}
          />
        </NFormItem>

        <ResetIconButton resetFn={resetGeneralSetting} />
      </>
    );
  });

  return {
    general: {
      setting: generalSetting,
      resetSetting: resetGeneralSetting,
      Panel: GeneralSetting
    },

    destory
  };
};

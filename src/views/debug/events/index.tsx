import {
  useAsyncLoadMonaco,
  usePropsValueToRef
} from "~/hooks/use-async-monaco";
import { ContentLayout } from "~/layouts/content";
import { NButton, NForm, NFormItem, NSelect } from "naive-ui";
import { EventTypes } from "~/socket/types";
import { RESTManager } from "~/utils";

import { useLocalStorage } from "@vueuse/core";

const generateFakeData = (type: string) => {
  switch (type) {
    case "objectId":
      return ((m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
        s(d.now() / 1000) +
        " ".repeat(h).replaceAll(/./g, () => s(m.random() * h)))();
    case "now":
      return new Date().toISOString();
    case "randomtext":
      return btoa(Math.random().toString()).slice(5, 10);
    case "randomnumber":
      return Math.floor(Math.random() * 10000);
    default:
      return `{{${type}}}`;
  }
};
export default defineComponent({
  setup() {
    const event = useLocalStorage<EventTypes>(
      "debug-event-name",
      EventTypes.POST_CREATE
    );

    const payload = useLocalStorage<Partial<Record<EventTypes, string>>>(
      "debug-event",
      {}
    );
    const type = useLocalStorage<"web" | "admin" | "all">(
      "debug-event-type",
      "web"
    );

    const value = usePropsValueToRef({
      value: payload.value[event.value] || "export default {}"
    });
    const editorRef = ref();
    watch(
      () => event.value,
      (eventName) => {
        monaco.editor.setValue(payload.value[eventName] || "");
      }
    );
    const monaco = useAsyncLoadMonaco(
      editorRef,
      value,
      (str) => {
        payload.value = {
          ...payload.value,
          [event.value]: str
        };
      },
      { language: "typescript", unSaveConfirm: false }
    );
    const handleSend = async () => {
      const replaceText =
        payload.value[event.value]?.replace(
          /({{(.*?)}})/g,
          // @ts-ignore
          (match, p1, p2) => {
            return generateFakeData(p2);
          }
        ) ?? "";

      RESTManager.api.debug.events.post({
        params: {
          type: type.value,
          event: event.value
        },
        data: new Function(
          `return ${replaceText.replace(/^export default /, "")}`
        )()
      });
    };
    return () => (
      <ContentLayout>
        <div class={"flex flex-col"}>
          <div class={"flex md:flex-row md:space-x-6 flex-col pb-4 md:pb-0"}>
            <NForm class={"flex md:flex-row md:space-x-6"}>
              <NFormItem label="Type" class={"md:w-[200px] w-full"}>
                <NSelect
                  tag
                  filterable
                  value={type.value}
                  onUpdateValue={(val) => void (type.value = val)}
                  options={["web", "all", "admin"].map((i) => ({
                    value: i,
                    label: i
                  }))}
                />
              </NFormItem>
              <NFormItem label="Event" class={"md:w-[200px] w-full"}>
                <NSelect
                  tag
                  filterable
                  value={event.value}
                  onUpdateValue={(val) => void (event.value = val)}
                  options={Object.keys(EventTypes).map((type) => ({
                    value: type,
                    label: type
                  }))}
                />
              </NFormItem>
            </NForm>

            <div class={"flex center"}>
              <NButton
                type="primary"
                onClick={handleSend}
                class={"md:w-[80px] w-full"}
              >
                测试
              </NButton>
            </div>
          </div>
          <div>
            <div class="relative h-[calc(100vh-25rem)] grow overflow-auto rounded-xl border p-3 duration-200 border-zinc-200 bg-white placeholder:text-slate-500 focus-visible:border-accent dark:border-neutral-800 dark:bg-zinc-900">
              <div ref={editorRef} class="h-full " />
            </div>
          </div>
        </div>
      </ContentLayout>
    );
  }
});

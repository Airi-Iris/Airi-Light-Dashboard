import { RoundedIconButtonBase } from "~/components/button/rounded-button";

import { useLayout } from "~/layouts/content";
import { TwoColGridLayout } from "~/layouts/two-col";
import { NForm, NFormItem, NGi, NSelect, useDialog } from "naive-ui";
import { RESTManager } from "~/utils";

import { CodeEditorForTemplateEditing } from "../code-editor";
import { EJSRender } from "../ejs-render";
import { clsxm } from "~/utils/helper";
import { OffsetHeaderLayout } from "~/layouts";

export enum ReplyMailType {
  Owner = "owner",
  Guest = "guest"
}

export enum NewsletterMailType {
  Newsletter = "newsletter"
}

// export enum TowFAType {
//   TFA = "authentication"
// }

export const EmailTab = defineComponent({
  setup() {
    const templateString = ref("");
    const modifiedTemplate = ref("");
    const templateType = ref<ReplyMailType | NewsletterMailType>(
      ReplyMailType.Guest
    );

    const renderProps = ref<any>(null);
    const { setHeaderButtons: setHeaderButton } = useLayout();

    const save = async () => {
      await RESTManager.api.options.email.template.put({
        params: { type: templateType.value },
        data: { source: modifiedTemplate.value }
      });

      await fetch();
    };
    const modal = useDialog();

    const reset = () => {
      modal.warning({
        title: "确认重置？",
        content: "重置后，模板将被恢复为默认模板",
        async onNegativeClick() {
          await RESTManager.api.options.email.template.delete({
            params: { type: templateType.value }
          });

          await fetch();
        },
        onPositiveClick() {
          return;
        },
        negativeText: "嗯",
        positiveText: "达咩"
      });
    };
    // TODO
    // const canSave = computed(
    //   () =>
    //     templateString.value === '' ||
    //     modifiedTemplate.value === '' ||
    //     templateType.value === modifiedTemplate.value,
    // )

    onMounted(() => {
      fetch();
    });

    const fetch = async () => {
      const { template, props } =
        await RESTManager.api.options.email.template.get<{
          template: string;
          props: any;
        }>({
          params: { type: templateType.value },
          transform: false
        });
      templateString.value = template;
      modifiedTemplate.value = template;
      renderProps.value = props;
    };

    watch(() => templateType.value, fetch);
    const isTemplateError = ref(false);

    watch(
      () => modifiedTemplate.value,
      () => {
        isTemplateError.value = false;
      }
    );

    return () => (
      <>
        <OffsetHeaderLayout className="space-x-2">
          <RoundedIconButtonBase
            icon={<i class="icon-[mingcute--check-line] text-white" />}
            name="提交"
            onClick={save}
            className="bg-[#0960bd]"
          />
          <RoundedIconButtonBase
            icon={<i class="icon-[mingcute--delete-3-line] text-white" />}
            name="重置自定义模板"
            onClick={reset}
            className="bg-[#ef4444]"
          />
        </OffsetHeaderLayout>
        <NForm class={"w-[300px]"}>
          <NFormItem
            label="模板类型"
            labelPlacement="left"
            showFeedback={false}
          >
            <NSelect
              value={templateType.value}
              onUpdateValue={(val) => (templateType.value = val)}
              options={[
                {
                  label: "回复邮件（访客）",
                  value: ReplyMailType.Guest
                },
                {
                  label: "回复邮件（博主）",
                  value: ReplyMailType.Owner
                },
                {
                  label: "订阅邮件",
                  value: NewsletterMailType.Newsletter
                }
                // {
                //   label: "两步验证 (2FA)",
                //   value: TowFAType.TFA
                // }
              ]}
              themeOverrides={{
                peers: {
                  InternalSelection: {
                    borderRadius: "0.5rem"
                  }
                }
              }}
            />
          </NFormItem>
        </NForm>
        <div class="pb-4" />
        <TwoColGridLayout>
          <NGi
            span={18}
            class={clsxm(
              isTemplateError.value && "outline outline-[3px] outline-red-300",
              "h-[calc(100vh-28rem)]"
            )}
          >
            <CodeEditorForTemplateEditing
              onChange={(val) => {
                modifiedTemplate.value = val;
              }}
              value={templateString.value}
            />
          </NGi>
          <NGi span={18} class="relative h-[calc(100vh-28rem)] ">
            <EJSRender
              class="custom-ef-ovt"
              data={renderProps.value}
              template={modifiedTemplate.value}
              onError={(err) => {
                isTemplateError.value = true;
              }}
            />
          </NGi>
        </TwoColGridLayout>
      </>
    );
  }
});

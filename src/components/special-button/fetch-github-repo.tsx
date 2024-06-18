import { RoundedIconButtonBase } from "~/components/button/rounded-button";
import { getRepoDetail, getRepoReadme } from "~/external/api/github-repo";
import { NButton, NInput, useDialog } from "naive-ui";
import type { IGithubRepo } from "~/external/api/github-repo";
import type { PropType } from "vue";

export const FetchGithubRepoButton = defineComponent({
  props: {
    onData: {
      type: Function as PropType<
        (data: IGithubRepo, readme?: string | null) => void
      >,
      required: true
    },
    defaultValue: {
      type: String
    }
  },
  setup(props) {
    const dialog = useDialog();
    const handleParseFromGithub = () => {
      const instance = dialog.create({
        title: "从 GitHub 解析",
        content: () => {
          const Comp = defineComponent({
            setup() {
              const url = ref(props.defaultValue ?? "");
              const loading = ref(false);
              const handleFetch = async () => {
                loading.value = true;
                const repoUrl = url.value.replace(/\.git$/, "");
                const repoFullName = repoUrl.replace(
                  /^https?:\/\/github.com\//,
                  ""
                );
                const [owner, repo] = repoFullName.split("/");
                const [data, readme] = await Promise.all([
                  getRepoDetail(owner, repo),
                  getRepoReadme(owner, repo)
                ]);

                props.onData(data, readme);
                loading.value = false;
                requestAnimationFrame(() => {
                  instance.destroy();
                });
              };
              const inputRef = ref();

              onMounted(() => {
                setTimeout(() => {
                  inputRef.value.focus();
                }, 10);
              });
              return () => (
                <>
                  <NInput
                    ref={inputRef}
                    onKeydown={(e) => {
                      if (e.code === "Enter") {
                        handleFetch();
                      }
                    }}
                    class="my-4"
                    value={url.value}
                    placeholder="在此输入项目地址"
                    onUpdateValue={(val) => void (url.value = val)}
                  />
                  <div class="flex justify-end space-x-4">
                    <NButton
                      type="primary"
                      round
                      onClick={handleFetch}
                      loading={loading.value}
                    >
                      获取
                    </NButton>
                  </div>
                </>
              );
            }
          });

          return <Comp />;
        }
      });
    };

    return () => (
      <RoundedIconButtonBase
        className="bg-[#25292E]"
        icon={<i class="icon-[mingcute--github-fill]" />}
        name="从 GitHub 获取"
        onClick={handleParseFromGithub}
      />
    );
  }
});

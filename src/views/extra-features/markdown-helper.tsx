import { debounce } from "lodash-es";
import {
  NButton,
  NButtonGroup,
  NForm,
  NFormItem,
  NSelect,
  NSpace,
  NSwitch,
  NText,
  NUpload,
  UploadFileInfo,
  useMessage
} from "naive-ui";
import { RESTManager, responseBlobToFile } from "~/utils";
import { ParseMarkdownYAML } from "~/utils/markdown-parser";
import { defineComponent, ref, watch } from "vue";
import type { ParsedModel } from "~/utils/markdown-parser";
import { VanillaButton } from "~/components/button/rounded-button";

enum ImportType {
  Post = "post",
  Note = "note"
}
const types = [
  {
    value: ImportType.Post,
    label: "博文"
  },
  {
    label: "日记",
    value: ImportType.Note
  }
];
export default defineComponent(() => {
  const importType = ref(ImportType.Post);
  const fileList = ref([] as UploadFileInfo[]);
  const parsedList = ref([] as (ParsedModel & { filename: string })[]);
  function parseMarkdown(strList: string[]) {
    const parser = new ParseMarkdownYAML(strList);
    return parser.start().map((i, index) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const filename = fileList.value[index].file!.name;
      const title = filename.replace(/\.md$/, "");
      if (i.meta) {
        i.meta.slug = i.meta.slug ?? title;
      } else {
        i.meta = {
          title,
          slug: title
        } as any;
      }

      if (!i.meta?.date) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        i.meta!.date = new Date().toISOString();
      }
      return i;
    });
  }
  const message = useMessage();
  async function handleParse(e?: MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (!fileList.value.length) {
      throw new ReferenceError("fileList is empty");
    }
    const strList = [] as string[];
    for await (const _file of fileList.value) {
      const res = await Promise.resolve(
        new Promise<string>((resolve, reject) => {
          const file = _file.file as File | null;
          if (!file) {
            message.error("文件不存在");
            reject("File is empty");
            return;
          }
          // 垃圾 windows , 不识别 mine-type 的处理
          const ext = file.name.split(".").pop();

          if (
            (file.type && file.type !== "text/markdown") ||
            !["md", "markdown"].includes(ext!)
          ) {
            message.error(`只能解析 markdown 文件，但是得到了 ${file.type}`);

            reject(
              `File must be markdown. got type: ${file.type}, got ext: ${ext}`
            );
            return;
          }
          const reader = new FileReader();
          reader.addEventListener("load", (e) => {
            // console.log(e.target?.result)
            resolve((e.target?.result as string) || "");
          });
          reader.readAsText(file);
        })
      );
      console.log(res);

      strList.push(res as string);
    }
    try {
      const parsedList_ = parseMarkdown(strList);
      message.success("解析完成，结果查看 console 哦");
      parsedList.value = parsedList_.map((v, index) => ({
        ...v,
        filename: fileList.value[index].file?.name ?? ""
      }));
      //
      console.log(toRaw(parsedList));
    } catch (e: any) {
      console.error(e.err);
      message.error(
        `文件${fileList.value[e.idx].name ?? ""}解析失败，具体信息查看 console`
      );
    }
  }

  async function handleUpload(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!parsedList.value.length) {
      return message.error("请先解析!!");
    }
    await RESTManager.api.markdown.import.post({
      data: {
        type: importType.value,
        data: parsedList.value
      }
    });

    message.success("上传成功！");
    fileList.value = [];
  }

  const exportConfig = reactive({
    includeYAMLHeader: true,
    titleBigTitle: false,
    filenameSlug: false,
    withMetaJson: true
  });
  async function handleExportMarkdown() {
    const { includeYAMLHeader, filenameSlug, withMetaJson, titleBigTitle } =
      exportConfig;
    const data = await RESTManager.api.markdown.export.get({
      params: {
        slug: filenameSlug,
        yaml: includeYAMLHeader,
        show_title: titleBigTitle,
        with_meta_json: withMetaJson
      },
      responseType: "blob"
    });

    responseBlobToFile(data, "markdown.zip");
  }

  watch(
    () => fileList.value,
    (n) => {
      // console.log(n)

      if (n.length == 0) {
        parsedList.value = [];
      } else {
        handleParse();
      }
    }
  );

  return () => (
    <>
      <div
        class={
          "flex center md:flex-row place-content-stretch box-border w-full gap-6 h-[calc(100vh-240px)] flex-col"
        }
      >
        <div
          class={"flex flex-col gap-6"}
          style={{ placeContent: "stretch flex-start" }}
        >
          <div
            class={
              "relative flex md:w-[420px] min-h-[275px] w-[360px] flex-col rounded-md bg-white px-4 py-5 duration-200 card-shadow dark:bg-neutral-950 dark:hover:ring-1 dark:hover:ring-zinc-300"
            }
          >
            <div class={"flex grow flex-col"}>
              <div class="line-clamp-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                从 Markdown 导入数据
              </div>
              <NText
                depth={2}
                class="!text-sm mt-2 text-neutral-500 scrollbar-none dark:text-neutral-400 inline-flex items-center space-x-1"
              >
                <i class="icon-[mingcute--alert-line] size-4" />
                <span>只能上传 markdown 文件</span>
              </NText>
              <div class="mt-4 text-sm text-neutral-500 dark:text-neutral-400 flex justify-start p-4">
                <NForm
                  labelPlacement="left"
                  class={"w-full flex center flex-col"}
                >
                  <NFormItem label="导入到:" class={"w-full"}>
                    <NSelect
                      options={types}
                      value={importType.value}
                      onUpdateValue={(e) => void (importType.value = e)}
                      themeOverrides={{
                        peers: {
                          InternalSelection: {
                            borderRadius: "0.5rem"
                          }
                        }
                      }}
                    />
                  </NFormItem>
                  <span class={"mb-2"}>准备好了吗.</span>
                  <NFormItem class={"flex"}>
                    <NSpace vertical>
                      <NUpload
                        multiple
                        accept=".md,.markdown"
                        onChange={debounce((e) => {
                          fileList.value = e.fileList;
                        }, 250)}
                        onRemove={(e) => {
                          const removedFile = e.file;
                          const name = removedFile.name;
                          const index = parsedList.value.findIndex(
                            (i) => i.filename === name
                          );
                          if (index != -1) {
                            parsedList.value.splice(index, 1);
                          }
                        }}
                        fileListClass="rounded-lg"
                      >
                        <NButtonGroup class={"flex"}>
                          <NButton
                            round
                            class={"flex-1 md:w-[120px] w-[100px]"}
                          >
                            先上传
                          </NButton>
                          <NButton
                            onClick={handleParse}
                            class={"flex-1 md:w-[120px] w-[100px]"}
                            disabled={!fileList.value.length}
                          >
                            再解析
                          </NButton>
                          <NButton
                            onClick={handleUpload}
                            class={"flex-1 md:w-[120px] w-[100px]"}
                            round
                            disabled={!parsedList.value.length}
                          >
                            最后导入
                          </NButton>
                        </NButtonGroup>
                      </NUpload>
                    </NSpace>
                  </NFormItem>
                  <NText
                    depth={2}
                    class="!text-sm mt-2 text-neutral-500 scrollbar-none dark:text-neutral-400 inline-flex items-center space-x-1"
                  >
                    <i class="icon-[mingcute--alert-line] size-4" />
                    <span>只能上传 markdown 文件</span>
                  </NText>
                </NForm>
              </div>
            </div>
          </div>
        </div>
        <div
          class={"flex flex-col gap-6"}
          style={{ placeContent: "stretch flex-start" }}
        >
          <div
            class={
              "relative flex md:w-[420px] md:h-[275px] min-h-[275px] w-[360px] flex-col rounded-md bg-white px-4 py-5 duration-200 card-shadow dark:bg-neutral-950 dark:hover:ring-1 dark:hover:ring-zinc-300"
            }
          >
            <div class={"flex grow flex-col"}>
              <div class="line-clamp-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                导出数据到 Markdown (Hexo YAML Format)
              </div>
              <div class="mt-4 text-sm dark:text-neutral-400 flex justify-start p-4">
                <NForm
                  labelPlacement="left"
                  class={"w-full flex justify-center flex-col"}
                >
                  <div class="flex items-center justify-between space-x-2 text-[1em] mb-3 mt-1">
                    <label class="text-[1.1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      是否包括 Yaml Header
                    </label>
                    <NSwitch
                      size="small"
                      value={exportConfig.includeYAMLHeader}
                      onUpdateValue={(e) =>
                        void (exportConfig.includeYAMLHeader = e)
                      }
                    />
                  </div>
                  <div class="flex items-center justify-between space-x-2 text-[1em] my-3">
                    <label class="text-[1.1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      是否在第一行显示文章标题
                    </label>
                    <NSwitch
                      size="small"
                      value={exportConfig.titleBigTitle}
                      onUpdateValue={(e) =>
                        void (exportConfig.titleBigTitle = e)
                      }
                    />
                  </div>
                  <div class="flex items-center justify-between space-x-2 text-[1em] my-3">
                    <label class="text-[1.1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      根据 slug 生成文件名
                    </label>
                    <NSwitch
                      size="small"
                      value={exportConfig.filenameSlug}
                      onUpdateValue={(e) =>
                        void (exportConfig.filenameSlug = e)
                      }
                    />
                  </div>
                  <div class="flex items-center justify-between space-x-2 text-[1em] my-3">
                    <label class="text-[1.1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      导出元数据 JSON
                    </label>
                    <NSwitch
                      size="small"
                      value={exportConfig.withMetaJson}
                      onUpdateValue={(e) =>
                        void (exportConfig.withMetaJson = e)
                      }
                    />
                  </div>
                  <div class="w-full text-right mt-3">
                    <VanillaButton
                      variant="secondary"
                      onClick={handleExportMarkdown}
                    >
                      <div class="inline-flex space-x-2 center">
                        <i class="icon-[mingcute--archive-line] size-4" />
                        <span>导出</span>
                      </div>
                    </VanillaButton>
                  </div>
                </NForm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

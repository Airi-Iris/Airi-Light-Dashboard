import { uniqBy } from "lodash-es";
import {
  NButton,
  NButtonGroup,
  NCollapse,
  NCollapseItem,
  NColorPicker,
  NInput,
  NInputNumber
} from "naive-ui";
import { getDominantColor } from "~/utils/image";
import { isVideoExt, pickImagesFromMarkdown } from "~/utils/markdown";
import type { Image as ImageModel } from "~/models/base";
import type { PropType } from "vue";
import { VanillaLoadingButton } from "~/components/button/rounded-button";

export const ImageDetailSection = defineComponent({
  props: {
    images: {
      type: Array as PropType<ImageModel[]>,
      required: true
    },
    onChange: {
      type: Function as PropType<(images: ImageModel[]) => void>,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    extraImages: {
      type: Array as PropType<string[]>,
      required: false
    }
  },
  setup(props) {
    const loading = ref(false);

    const originImageMap = computed(() => {
      const map = new Map<string, ImageModel>();
      props.images.forEach((image) => {
        map.set(image.src, image);
      });
      return map;
    });

    const images = computed<ImageModel[]>(() => {
      const basedImages: ImageModel[] = props.text
        ? uniqBy(
            pickImagesFromMarkdown(props.text)
              .map((src) => {
                const existImageInfo = originImageMap.value.get(src);
                return {
                  src,
                  height: existImageInfo?.height,
                  width: existImageInfo?.width,
                  type: existImageInfo?.type,
                  accent: existImageInfo?.accent
                } as any;
              })
              .concat(props.images),
            "src"
          )
        : props.images;
      const srcSet = new Set<string>();

      for (const image of basedImages) {
        image.src && srcSet.add(image.src);
      }
      const nextImages = basedImages.concat();
      if (props.extraImages) {
        // 需要过滤存在的图片
        props.extraImages.forEach((src) => {
          if (!srcSet.has(src)) {
            nextImages.push({
              src,
              height: 0,
              width: 0,
              type: "",
              accent: ""
            });
          }
        });
      }

      return nextImages;
    });
    const handleCorrectImageDimensions = async () => {
      loading.value = true;

      const fetchImageTasks = await Promise.allSettled(
        images.value.map((item) => {
          return new Promise<ImageModel>((resolve, reject) => {
            const ext = item.src.split(".").pop()!;
            const isVideo = isVideoExt(ext);

            if (isVideo) {
              const video = document.createElement("video");

              video.src = item.src;

              video.addEventListener("loadedmetadata", () => {
                resolve({
                  height: video.videoHeight,
                  type: ext,
                  src: item.src,
                  width: video.videoWidth,
                  accent: "#fff"
                });
              });

              video.addEventListener("error", (e) => {
                reject({
                  err: e,
                  src: item.src
                });
              });
            } else {
              const $image = new Image();
              $image.src = item.src;
              $image.crossOrigin = "Anonymous";
              $image.addEventListener("load", () => {
                resolve({
                  width: $image.naturalWidth,
                  height: $image.naturalHeight,
                  src: item.src,
                  type: ext,
                  accent: getDominantColor($image)
                });
              });
              $image.onerror = (err) => {
                reject({
                  err,
                  src: item.src
                });
              };
            }
          });
        })
      );

      loading.value = false;

      const nextImageDimensions = [] as ImageModel[];
      fetchImageTasks.map((task) => {
        if (task.status === "fulfilled") nextImageDimensions.push(task.value);
        else {
          message.warning(
            `获取图片信息失败：${task.reason.src}: ${task.reason.err}`
          );
        }
      });

      props.onChange(nextImageDimensions);

      loading.value = false;
    };

    return () => (
      <div class="relative flex w-full flex-grow flex-col">
        <div class="flex items-center justify-between space-x-2 text-[1em]">
          <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            调整 Markdown 中包含的图片信息
          </label>
          <VanillaLoadingButton
            isLoading={loading.value}
            class="self-end"
            variant="secondary"
            onClick={handleCorrectImageDimensions}
          >
            自动修正
          </VanillaLoadingButton>
        </div>

        <NCollapse accordion class="mt-4">
          {images.value.map((image: ImageModel, index: number) => {
            return (
              <NCollapseItem
                key={image.src}
                // @ts-expect-error
                title={
                  <span class="flex w-full flex-shrink break-all">
                    {image.src}
                  </span>
                }
              >
                <div class={"space-y-3 center flex flex-col"}>
                  <div class="flex items-center justify-center space-x-2 text-[1em] w-full">
                    <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[120px]">
                      文章缩略图
                    </label>
                    <NInputNumber
                      value={image.height}
                      onUpdateValue={(n) => {
                        if (!n) {
                          return;
                        }
                        props.images[index].height = n;
                      }}
                    />
                  </div>

                  <div class="flex items-center justify-center  space-x-2 text-[1em] w-full">
                    <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[120px]">
                      宽度
                    </label>
                    <NInputNumber
                      value={image.width}
                      onUpdateValue={(n) => {
                        if (!n) {
                          return;
                        }
                        props.images[index].width = n;
                      }}
                    />
                  </div>

                  <div class="flex items-center justify-center  space-x-2 text-[1em] w-full">
                    <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[120px]">
                      类型
                    </label>
                    <NInput
                      class={"!w-[224px]"}
                      value={image.type || ""}
                      onUpdateValue={(n) => {
                        if (!n) {
                          return;
                        }
                        props.images[index].type = n;
                      }}
                    />
                  </div>
                  <div class="flex items-center justify-center  space-x-2 text-[1em] w-full">
                    <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[120px]">
                      主色调
                    </label>
                    <NColorPicker
                      class={"!w-[224px]"}
                      value={image.accent || ""}
                      onUpdateValue={(n) => {
                        if (!n) {
                          return;
                        }
                        props.images[index].accent = n;
                      }}
                    />
                  </div>

                  <div class="flex items-center justify-center space-x-2 text-[1em] w-full">
                    <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 w-[120px]">
                      操作
                    </label>
                    <div class="flex">
                      <NButtonGroup class={"w-[224px] justify-end"}>
                        <NButton
                          round
                          onClick={() => {
                            window.open(image.src);
                          }}
                          secondary
                        >
                          查看
                        </NButton>

                        <NButton
                          secondary
                          round
                          type="error"
                          onClick={() => {
                            props.images.splice(index, 1);
                          }}
                        >
                          删除
                        </NButton>
                      </NButtonGroup>
                    </div>
                  </div>
                </div>
              </NCollapseItem>
            );
          })}
        </NCollapse>
      </div>
    );
  }
});

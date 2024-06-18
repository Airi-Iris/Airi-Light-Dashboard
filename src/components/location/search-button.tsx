import { debounce } from "lodash-es";
import {
  NAutoComplete,
  NButton,
  NCard,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NSwitch
} from "naive-ui";
import { RESTManager } from "~/utils/rest";
import { defineComponent, ref, watch } from "vue";
import type { AMapSearch } from "~/models/amap";
import type { AutoCompleteOption } from "naive-ui/lib/auto-complete/src/interface";
import type { PropType } from "vue";
import { VanillaLoadingButton } from "../button/rounded-button";

export const SearchLocationButton = defineComponent({
  props: {
    placeholder: {
      type: String as PropType<string | undefined | null>,
      default: ""
    },
    onChange: {
      type: Function as PropType<
        (
          location: string,
          coordinates: {
            latitude: number;
            longitude: number;
          }
        ) => any
      >,
      required: true
    }
  },
  setup(props) {
    const loading = ref(false);
    const modalOpen = ref(false);
    const keyword = ref("");
    const showCustomized = ref(false);
    const customLocation = ref("");
    const searchLocation = async (keyword: string) => {
      const res = await RESTManager.api
        .fn("built-in")
        .geocode_search.get<AMapSearch>({
          params: { keywords: keyword }
        });
      return res;
    };

    const autocompleteOption = ref([] as AutoCompleteOption[]);

    watch(
      () => keyword.value,
      debounce(
        async (keyword) => {
          loading.value = true;

          const res = await searchLocation(keyword);
          autocompleteOption.value = [];
          res.pois.forEach((p) => {
            const label = p.cityname + p.adname + p.address + p.name;
            const [longitude, latitude] = p.location.split(",").map(Number);
            autocompleteOption.value.push({
              key: p.cityname,
              label,
              value: JSON.stringify([label, { latitude, longitude }])
            });
          });
          loading.value = false;
        },
        400,
        { trailing: true, leading: true }
      )
    );

    let json: any;

    return () => (
      <>
        <VanillaLoadingButton
          variant="secondary"
          onClick={() => {
            modalOpen.value = true;
          }}
        >
          <div class="inline-flex center space-x-2">
            <i class="icon-[mingcute--mountain-2-line] size-[18px]" />
            <span>自定义</span>
          </div>
        </VanillaLoadingButton>
        <NModal
          transformOrigin="center"
          show={modalOpen.value}
          onUpdateShow={(e) => void (modalOpen.value = e)}
        >
          <NCard
            class="modal-card sm"
            bordered={false}
            closable
            onClose={() => {
              modalOpen.value = false;
            }}
            title="搜索关键字查找地点或自定义地点"
          >
            {{
              default: () => (
                <>
                  <NForm labelPlacement="top">
                    <div class="flex items-center justify-between my-4 text-[1em]">
                      <label class="text-[1em] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        切换搜索地点/自定义地点
                      </label>
                      <NSwitch
                        value={!!showCustomized.value}
                        onUpdateValue={(e) => {
                          showCustomized.value = e;
                        }}
                      />
                    </div>
                    {showCustomized.value ? (
                      <NFormItem label="自定义地点">
                        <NInput
                          placeholder={props.placeholder || ""}
                          onUpdateValue={(e) => {
                            customLocation.value = e;
                            json = JSON.stringify([
                              customLocation.value,
                              { latitude: 0, longitude: 0 }
                            ]);
                          }}
                          value={customLocation.value}
                          class={"rounded-md"}
                        />
                      </NFormItem>
                    ) : (
                      <NFormItem label="搜索地点">
                        <NAutoComplete
                          placeholder={props.placeholder || ""}
                          onSelect={(j) => {
                            json = j;
                          }}
                          options={autocompleteOption.value}
                          loading={loading.value}
                          onUpdateValue={(e) => {
                            keyword.value = e;
                          }}
                          value={keyword.value}
                          themeOverrides={{
                            peers: {
                              Input: {
                                borderRadius: "6px"
                              }
                            }
                          }}
                        />
                      </NFormItem>
                    )}
                  </NForm>
                  <NSpace justify="end">
                    <NButton
                      round
                      type="primary"
                      onClick={() => {
                        const parsed = JSON.parse(json as string);
                        props.onChange.apply(this, parsed);
                        console.log(json);
                        modalOpen.value = false;
                      }}
                      disabled={loading.value}
                    >
                      确定
                    </NButton>
                  </NSpace>
                </>
              )
            }}
          </NCard>
        </NModal>
      </>
    );
  }
});

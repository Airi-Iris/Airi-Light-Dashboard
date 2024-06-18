import { useMessage } from "naive-ui";
import { RESTManager } from "~/utils/rest";
import { defineComponent, ref } from "vue";
import type { Amap, Regeocode } from "~/models/amap";
import type { PropType } from "vue";
import { VanillaLoadingButton } from "../button/rounded-button";

export const GetLocationButton = defineComponent({
  props: {
    onChange: {
      type: Function as PropType<
        (amap: Regeocode, coordinates: readonly [number, number]) => any
      >,
      required: true
    }
  },
  setup(props) {
    const message = useMessage();
    const loading = ref(false);
    const handleGetLocation = async () => {
      const GetGeo = () =>
        new Promise<GeolocationPosition>((r, j) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              loading.value = true;
              r(pos);
              loading.value = false;
            },
            (err) => {
              loading.value = false;
              j(err);
            }
          );
        });
      if (navigator.geolocation) {
        try {
          const coordinates = await GetGeo();
          // console.log(coordinates)

          const {
            coords: { latitude, longitude }
          } = coordinates;

          const coo = [longitude, latitude] as const;
          const res = await RESTManager.api
            .fn("built-in")
            .geocode_location.get<Amap>({
              params: {
                longitude,
                latitude
              }
            });

          props.onChange(res.regeocode, coo);
        } catch (error: any) {
          console.error(error);

          if (error.code == 2) {
            message.error("获取定位失败，连接超时");
          } else {
            message.error("定位权限未打开");
          }
        }
      } else {
        message.error("浏览器不支持定位");
      }
    };
    return () => (
      <VanillaLoadingButton
        variant="secondary"
        onClick={handleGetLocation}
        isLoading={loading.value}
      >
        <div class="inline-flex center space-x-2">
          <i class="icon-[mingcute--live-location-line] size-[18px]" />
          <span>定位</span>
        </div>
      </VanillaLoadingButton>
    );
  }
});

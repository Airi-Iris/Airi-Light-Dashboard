import { RESTManager } from "~/utils";
import { onMounted, ref } from "vue";

export interface ViewportRecord {
  w: number;
  h: number;
  mobile: boolean;
  pad: boolean;
  hpad: boolean;
  wider: boolean;
  widest: boolean;
  phone: boolean;
}

export const useAppStore = defineStore("app", () => {
  const app = ref<AppInfo>();
  onMounted(() => {
    RESTManager.api.get<AppInfo>().then((res) => {
      app.value = res;
    });
  });
  return {
    app
  };
});

export { useAppStore as AppStore };

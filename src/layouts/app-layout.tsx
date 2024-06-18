import { useRouter } from "vue-router";

import { RouteName } from "~/router/name";
import { useUserStore } from "~/stores/user";

import { DashboradLayout } from "./dashboard";

export const AppLayout = defineComponent({
  setup() {
    const { fetchUser } = useUserStore();
    const router = useRouter();
    fetchUser().then(() => {
      const toSetting = localStorage.getItem("to-setting");
      if (toSetting === "true") {
        router.push({
          name: RouteName.Setting,
          params: {
            type: "user"
          }
        });
        localStorage.removeItem("to-setting");
      }
    });

    return () => <DashboradLayout />;
  }
});

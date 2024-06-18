import $RouterView from "~/layouts/router-view";
import { defineComponent } from "vue";

import { LayoutHeader } from "../../components/header";

export const DashboradLayout = defineComponent({
  name: "DashboradLayout",

  setup() {
    return () => {
      return (
        <>
          <LayoutHeader />
          <div class="flex min-h-screen flex-col [&>div]:flex [&>div]:grow [&>div]:flex-col">
            <main class="mt-24 flex min-h-0 grow flex-col p-4">
              <$RouterView />
            </main>
          </div>
        </>
      );
    };
  }
});

import {
  darkTheme,
  dateZhCN,
  lightTheme,
  NConfigProvider,
  NDialogProvider,
  NMessageProvider,
  NNotificationProvider,
  useDialog,
  useMessage,
  useNotification,
  useThemeVars,
  zhCN
} from "naive-ui";
import { defineComponent, onMounted } from "vue";
import { RouterView } from "vue-router";
import type { VNode } from "vue";

import { PortalInjectKey } from "~/hooks/use-portal-element";

import { useUIStore } from "./stores/ui";
import Color from "colorjs.io";
import chroma from "chroma-js";
import { initSysTheme } from "./utils/theme";
import tinycolor from "tinycolor2";

const Root = defineComponent({
  name: "RootView",

  setup() {
    onMounted(() => {
      const message = useMessage();
      const _error = message.error;
      Object.assign(message, {
        error: (...rest: any[]) => {
          // @ts-ignore
          _error.apply(this, rest);
          throw rest[0];
        }
      });

      window.message = message;
      window.notification = useNotification();
      window.dialog = useDialog();
    });
    const $portalElement = ref<VNode | null>(null);

    provide(PortalInjectKey, {
      setElement(el) {
        $portalElement.value = el;
        return () => {
          $portalElement.value = null;
        };
      }
    });

    return () => {
      return (
        <>
          <RouterView />
          {$portalElement.value}
        </>
      );
    };
  }
});

const App = defineComponent({
  setup() {
    const uiStore = useUIStore();
    // onBeforeMount(() => {
    //   initSysTheme(uiStore.isDark);
    // });
    return () => {
      const { isDark, naiveUIDark } = uiStore;
      initSysTheme(isDark);
      return (
        <NConfigProvider
          locale={zhCN}
          dateLocale={dateZhCN}
          themeOverrides={{
            common: isDark ? dcolors : lcolors,
            Switch: {
              railColorActive: isDark
                ? dcolors.primaryColor
                : lcolors.primaryColor
            }
          }}
          theme={naiveUIDark ? darkTheme : isDark ? darkTheme : lightTheme}
          class={"!bg-gray-50 p-0 font-sans dark:!bg-black"}
        >
          <NNotificationProvider>
            <NMessageProvider>
              <NDialogProvider>
                <AccentColorInjector />
                <Root />
              </NDialogProvider>
            </NMessageProvider>
          </NNotificationProvider>
        </NConfigProvider>
      );
    };
  }
});

const lcolors = reactive({
  primaryColor: "",
  primaryColorHover: "",
  primaryColorPressed: ""
});

const dcolors = reactive({
  primaryColor: "",
  primaryColorHover: "",
  primaryColorPressed: ""
});

const hexToOklchString = (hex: string) => {
  return new Color(hex).oklch;
};

const accentColorLight = [
  // 浅葱
  "#33A6B8",

  "#FF6666",
  "#26A69A",
  "#fb7287",
  "#69a6cc"
];
const accentColorDark = [
  // 桃
  "#F596AA",

  "#A0A7D4",
  "#ff7b7b",
  "#99D8CF",
  "#838BC6"
];
const defaultAccentColor = { light: accentColorLight, dark: accentColorDark };
const lightBackground = "rgb(250, 250, 250)";
const darkBackground = "rgb(0, 2, 18)";

const AccentColorInjector = defineComponent({
  setup() {
    const vars = useThemeVars();
    const { light, dark } = defaultAccentColor;

    const lightColors = light ?? accentColorLight;
    const darkColors = dark ?? accentColorDark;

    const Length = Math.max(lightColors.length ?? 0, darkColors.length ?? 0);
    const randomSeedRef = (Math.random() * Length) | 0;
    const currentAccentColorLRef = lightColors[randomSeedRef];
    const currentAccentColorDRef = darkColors[randomSeedRef];

    const lightOklch = hexToOklchString(currentAccentColorLRef);
    const darkOklch = hexToOklchString(currentAccentColorDRef);

    const [hl, sl, ll] = lightOklch;
    const [hd, sd, ld] = darkOklch;

    const lbase = tinycolor(currentAccentColorLRef);
    const dbase = tinycolor(currentAccentColorDRef);

    lcolors.primaryColor = currentAccentColorLRef;
    lcolors.primaryColorHover = lbase.brighten(10).toHexString();
    lcolors.primaryColorPressed = lbase.darken(10).toHexString();

    dcolors.primaryColor = currentAccentColorDRef;
    dcolors.primaryColorHover = dbase.brighten(10).toHexString();
    dcolors.primaryColorPressed = dbase.darken(10).toHexString();

    onMounted(() => {
      const { primaryColor, primaryColorHover, primaryColorSuppl } = vars.value;
      const accentColorStyle = document.createElement("style");

      accentColorStyle.id = "accent-color-style";
      accentColorStyle.setAttribute("data-light", currentAccentColorLRef);
      accentColorStyle.setAttribute("data-dark", currentAccentColorDRef);
      accentColorStyle.innerHTML = `
        html[data-theme='light'] {
          --a: ${`${hl} ${sl} ${ll}`};
        }
        html[data-theme='dark'] {
          --a: ${`${hd} ${sd} ${ld}`};
        }
        html {
          --root-bg: ${chroma.mix(lightBackground, currentAccentColorLRef, 0.05, "rgb").hex()};
          --color-primary: ${primaryColor};
          --color-primary-shallow: ${primaryColorHover};
          --color-primary-deep: ${primaryColorSuppl};
          background-color: var(--root-bg) !important;
        }
        html[data-theme='dark'] {
          --root-bg: ${chroma.mix(darkBackground, currentAccentColorDRef, 0.12, "rgb").hex()};
        }`;

      document.head.appendChild(accentColorStyle);
    });

    onBeforeUnmount(() => {
      document.head.removeChild(document.getElementById("accent-color-style")!);
    });

    return () => null;
    // return () =>
    //   h("style", {
    //     id: "accent-color-style",
    //     "data-light": currentAccentColorLRef,
    //     "data-dark": currentAccentColorDRef,
    //     innerHTML: `
    //     html[data-theme='light'] {
    //       --a: ${`${hl} ${sl} ${ll}`};
    //     }
    //     html[data-theme='dark'] {
    //       --a: ${`${hd} ${sd} ${ld}`};
    //     }
    //     html {
    //       --root-bg: ${chroma.mix(lightBackground, currentAccentColorLRef, 0.05, "rgb").hex()};
    //       background-color: var(--root-bg) !important;
    //     }
    //     html[data-theme='dark'] {
    //       --root-bg: ${chroma.mix(darkBackground, currentAccentColorDRef, 0.12, "rgb").hex()};
    //     }`
    //   });
  }
});

// eslint-disable-next-line import/no-default-export
export default App;

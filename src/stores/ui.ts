import { debounce } from "lodash-es";
import { computed, onMounted, ref, watch } from "vue";

import { useDark, useToggle } from "@vueuse/core";

export interface ViewportRecord {
  w: number;
  h: number;
  mobile: boolean;
  pad: boolean;
  hpad: boolean;
  wider: boolean;
  widest: boolean;
  phone: boolean;
  drawer: boolean;
}

export const useUIStore = defineStore("ui", () => {
  const viewport = ref<ViewportRecord>({} as any);
  const sidebarWidth = ref(250);
  const sidebarCollapse = ref(viewport.value.mobile ? true : false);

  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  onMounted(() => {
    const resizeHandler = debounce(updateViewport, 500, { trailing: true });
    window.addEventListener("resize", resizeHandler);
    updateViewport();
  });
  const updateViewport = () => {
    const innerHeight = window.innerHeight;
    const width = document.documentElement.getBoundingClientRect().width;
    const { hpad, pad, mobile } = viewport.value;

    // 忽略移动端浏览器 上下滚动 导致的视图大小变化
    if (
      viewport.value.h &&
      // chrome mobile delta == 56
      Math.abs(innerHeight - viewport.value.h) < 80 &&
      width === viewport.value.w &&
      (hpad || pad || mobile)
    ) {
      return;
    }
    viewport.value = {
      w: width,
      h: innerHeight,
      mobile: window.screen.width <= 568 || window.innerWidth <= 568,
      pad: window.innerWidth <= 768 && window.innerWidth > 568,
      hpad: window.innerWidth <= 1024 && window.innerWidth > 768,
      wider: window.innerWidth > 1024 && window.innerWidth < 1920,
      widest: window.innerWidth >= 1920,

      phone: window.innerWidth <= 768,
      drawer: false
    };
  };

  const contentWidth = computed(
    () =>
      viewport.value.w -
      sidebarWidth.value +
      (sidebarCollapse.value
        ? Number.parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--sidebar-collapse-width"
            )
          )
        : 0)
  );

  const contentInsetWidth = computed(
    () =>
      contentWidth.value -
      Number.parseInt(getComputedStyle(document.documentElement).fontSize) * 6
  );

  watch(
    () => isDark.value,
    (isDark) => {
      if (isDark) {
        document.documentElement.classList.add("dark");
        document.documentElement.style.setProperty("color-scheme", "dark");
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.setProperty("color-scheme", "light");
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
      }
    }
  );

  const naiveUIDark = ref(false);
  return {
    viewport,
    contentWidth,
    sidebarWidth,
    contentInsetWidth,
    sidebarCollapse,

    isDark,
    toggleDark,
    toggleDarkWithTransition: (
      event: MouseEvent,
      options: { duration?: number; easing?: EffectTiming["easing"] } = {}
    ) => {
      // @ts-expect-error startViewTransition is not defined
      if (!document.startViewTransition) {
        toggleDark();
        return;
      }

      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y)
      );

      // @ts-expect-error startViewTransition is not defined
      const transition = document.startViewTransition(() => {
        toggleDark();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        document.documentElement.animate(
          {
            clipPath: isDark.value ? clipPath.reverse() : clipPath
          },
          {
            duration: options.duration || 300,
            easing: options.easing || "ease-in",
            pseudoElement: isDark.value
              ? "::view-transition-old(root)"
              : "::view-transition-new(root)"
          }
        );
      });
    },
    naiveUIDark,
    onlyToggleNaiveUIDark: (dark?: boolean) => {
      naiveUIDark.value = dark ?? !naiveUIDark.value;
    }
  };
});

export { useUIStore as UIStore };

import type {
  Config,
  CSSRuleObject,
  PluginAPI
} from "tailwindcss/types/config";
import { addDynamicIconSelectors } from "@iconify/tailwind";
import { withTV } from "tailwind-variants/dist/transformer";

import { ThemeColorConfig } from "./theme.config";
import daisyui from "daisyui";

const tailwindConfig: Config = {
  content: ["./src/**/*.html", "./src/**/*.vue", "./src/**/*.tsx"],
  darkMode: ["class", '[data-theme="dark"]'],

  theme: {
    extend: {
      fontFamily: {
        sans: 'var(--font-sans),system-ui,-apple-system,PingFang SC,"Microsoft YaHei",Segoe UI,Roboto,Helvetica,noto sans sc,hiragino sans gb,"sans-serif",Apple Color Emoji,Segoe UI Emoji,Not Color Emoji'
      },
      screens: {
        "light-mode": { raw: "(prefers-color-scheme: light)" },
        "dark-mode": { raw: "(prefers-color-scheme: dark)" },
        phone: { raw: "(max-width: 768px)" },
        desktop: { raw: "(min-width: 1024px)" },
        tablet: { raw: "(max-width: 1023px)" }
      },
      zIndex: {
        "-10": "-10",
        "-1": "-1",
        "0": "0",
        "1": "1",
        "10": "10",
        "20": "20",
        "30": "30",
        "40": "40",
        "50": "50",
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
        auto: "auto"
      },
      colors: {
        themed: {
          bg_opacity: "var(--bg-opacity)"
        },
        custom: {
          base: "var(--fallback-b1, oklch(var(--b1)/ <alpha-value>))",
          base_content: "var(--fallback-bc, oklch(var(--bc) / 1))"
        },
        pri: {
          default: ThemeColorConfig.primaryColor,
          deep: ThemeColorConfig.primaryColorPressed,
          shallow: ThemeColorConfig.primaryColorHover
        },
        gray$: {
          default: "#ddd"
        },
        environment: {
          base: "#00de65",
          carbon: "#00d959"
        }
      },
      keyframes: {
        blink: {
          "0%": { opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0" }
        }
      },
      boxShadow: {
        "toast-light":
          "0 3px 6px -4px rgba(0, 0, 0, .12), 0 6px 16px 0 rgba(0, 0, 0, .08), 0 9px 28px 8px rgba(0, 0, 0, .05)",
        "toast-dark":
          "0 3px 6px -4px rgba(0, 0, 0, .24), 0 6px 12px 0 rgba(0, 0, 0, .16), 0 9px 18px 8px rgba(0, 0, 0, .10)"
      }
    }
  },
  daisyui: {
    // prefix: 'daisy',
    logs: false,
    themes: [
      {
        light: {
          "color-scheme": "light",
          primary: "#ff6666",
          secondary: "#FB966E",
          accent: "#ff6666",
          "accent-content": "#fafafa",
          neutral: "#C7C7CC",
          "base-100": "#FFF",
          "base-content": "#000"
        }
      },
      {
        dark: {
          "color-scheme": "dark",
          primary: "#ff6666",
          secondary: "#FB966E",
          accent: "#ff6666",
          neutral: "#48484A",
          "base-100": "#1C1C1E",
          "base-content": "#FFF"
        }
      }
    ],
    darkTheme: "dark"
  },

  plugins: [
    addDynamicIconSelectors(),
    addShortcutPlugin,
    daisyui,
    require("tailwind-scrollbar"),
    require("@tailwindcss/container-queries"),
    require("tailwindcss-animated")
  ]
};

function addShortcutPlugin({ addUtilities }: PluginAPI) {
  const styles: CSSRuleObject = {
    ".content-auto": {
      "content-visibility": "auto"
    },
    ".shadow-out-sm": {
      "box-shadow":
        "0 0 10px rgb(120 120 120 / 10%), 0 5px 20px rgb(120 120 120 / 20%)"
    },
    ".backface-hidden": {
      "-webkit-backface-visibility": "hidden",
      "-moz-backface-visibility": "hidden",
      "-webkit-transform": "translate3d(0, 0, 0)",
      "-moz-transform": "translate3d(0, 0, 0)"
    },
    ".center": {
      "align-items": "center",
      "justify-content": "center"
    },
    ".fill-content": {
      "min-height": `calc(100vh - 17.5rem)`
    },
    ".card-shadow": {
      "box-shadow": "0 0 0 1px rgba(0,0,0,.08),0 4px 6px rgba(0,0,0,.04)"
    },
    ".card-shadow:hover": {
      "box-shadow": "0 0 0 1px rgba(0,0,0,.08),0 6px 14px rgba(0,0,0,.08)"
    },
    ".login-box-shadow": {
      "box-shadow":
        "rgba(0, 0, 0, 0.08) 0px 5px 15px 0px, rgba(25, 28, 33, 0.2) 0px 15px 35px -5px, rgba(0, 0, 0, 0.07) 0px 0px 0px 1px"
    },
    ".max-height-transition-05": {
      transition: "max-height 0.5s"
    },
    ".mask-both": {
      "mask-image":
        "linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 20px, rgb(255, 255, 255) calc(100% - 20px), rgba(255, 255, 255, 0) 100%)"
    },
    ".mask-both-lg": {
      "mask-image":
        "linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 50px, rgb(255, 255, 255) calc(100% - 50px), rgba(255, 255, 255, 0) 100%)"
    },
    ".mask-b": {
      "mask-image":
        "linear-gradient(rgb(255, 255, 255) calc(100% - 20px), rgba(255, 255, 255, 0) 100%)"
    },
    ".mask-b-lg": {
      "mask-image":
        "linear-gradient(rgb(255, 255, 255) calc(100% - 50px), rgba(255, 255, 255, 0) 100%)"
    },
    ".mask-t": {
      "mask-image":
        "linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 20px)"
    },
    ".mask-t-lg": {
      "mask-image":
        "linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(255, 255, 255) 50px)"
    },
    ".cover-mask-b": {
      "mask-image": "linear-gradient(180deg, #fff -17.19%, #00000000 92.43%)"
    },
    ".transition-pop": {
      transition: "all cubic-bezier(0.22, 0.58, 0.12, 0.98) 0.4s;"
    }

    // ...extendedStyles
  };
  addUtilities(styles);
}

export default withTV(tailwindConfig);

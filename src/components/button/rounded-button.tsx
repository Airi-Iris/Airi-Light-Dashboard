import { NButton, NPopover } from "naive-ui";
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";
import { Icon } from "@vicons/utils";
import type { ButtonHTMLAttributes, PropType } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { tv } from "tailwind-variants";
import clsx from "clsx";
import { clsxm } from "~/utils/helper";

const variantStyles = tv({
  base: "inline-flex select-none cursor-pointer items-center gap-2 justify-center rounded-lg py-2 px-3 text-sm outline-offset-2 transition active:transition-none",
  variants: {
    variant: {
      primary: clsx(
        "bg-accent text-zinc-100",
        "hover:contrast-[1.10] active:contrast-125 hover:scale-[1.02] focus:scale-[1.02]",
        "font-semibold",
        "disabled:cursor-not-allowed disabled:bg-accent/40 disabled:opacity-80 disabled:dark:bg-gray-800 disabled:dark:text-zinc-50",
        "dark:text-neutral-800"
      ),
      secondary: clsx(
        "group rounded-full bg-gradient-to-b from-zinc-50/50 to-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur transition dark:from-zinc-900/50 dark:to-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20",
        "hover:scale-[1.02] focus:scale-[1.02]",
        "disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-80 disabled:dark:bg-gray-800 disabled:dark:text-zinc-50"
      )
    }
  }
});

export type ButtonType = PropType<
  "primary" | "info" | "success" | "warning" | "error"
>;

export type VanillaButtonType = PropType<"primary" | "secondary">;

export type RoundedButtonType = PropType<
  "primary" | "info" | "success" | "warning" | "error" | "recycle"
>;

export const vanillaBaseButtonProps = {
  variant: {
    type: String as VanillaButtonType,
    default: "primary"
  },
  class: {
    type: String
  },
  onClick: {
    type: Function as any as PropType<ButtonHTMLAttributes["onClick"]>
  },
  disabled: {
    type: Boolean
  }
};

export const baseButtonProps = {
  variant: {
    type: String as ButtonType,
    default: "primary"
  },
  color: {
    type: String
  },
  onClick: {
    type: Function as any as PropType<ButtonHTMLAttributes["onClick"]>
  },
  disabled: {
    type: Boolean
  }
};

export const RoundedButton = defineComponent({
  props: baseButtonProps,
  setup(props, { slots }) {
    return () => {
      return (
        <NButton
          type={props.variant}
          // class="bg-accent border-accent"
          circle
          onClick={props.onClick}
          disabled={props.disabled}
        >
          {slots}
        </NButton>
      );
    };
  }
});

export const VanillaButton = defineComponent({
  props: {
    ...vanillaBaseButtonProps
  },
  setup(props, { slots }) {
    return () => (
      <button
        class={variantStyles({
          variant: props.variant,
          class: props.class
        })}
        disabled={props.disabled}
        onClick={props.onClick}
      >
        {slots.default?.()}
      </button>
    );
  }
});

export const VanillaLoadingButton = defineComponent({
  props: {
    ...vanillaBaseButtonProps,
    isLoading: Boolean
  },
  setup(props, { slots }) {
    return () => (
      <VanillaButton
        variant={props.variant}
        onClick={props.onClick}
        class={props.class}
      >
        <div class="inline-flex">
          {props.isLoading && (
            <div class="inset-0 z-[1] flex items-center justify-center mr-2">
              <div class="loading loading-spinner h-5 w-5" />
            </div>
          )}

          {slots.default?.()}
        </div>
      </VanillaButton>
    );
  }
});

export const HeaderActionButton = defineComponent({
  props: {
    ...baseButtonProps,
    to: {
      type: [Object, String] as PropType<RouteLocationRaw>
    },
    name: {
      type: String
    },
    icon: {
      type: Object as PropType<VNode>,
      required: true
    }
  },
  setup(props) {
    const Inner = () => (
      <RoundedButton
        variant={props.variant}
        class="shadow"
        onClick={props.onClick}
        disabled={props.disabled}
        color={props.color}
      >
        <Icon size="16">{props.icon}</Icon>
      </RoundedButton>
    );
    const WrapInfo = () =>
      props.name ? (
        <NPopover trigger="hover" placement="bottom">
          {{
            trigger() {
              return <Inner />;
            },
            default() {
              return props.name;
            }
          }}
        </NPopover>
      ) : (
        <Inner />
      );
    return () =>
      props.to ? (
        <RouterLink to={props.to}>
          <WrapInfo />
        </RouterLink>
      ) : (
        <WrapInfo />
      );
  }
});

export const HeaderActionButtonWithDesc = defineComponent({
  props: {
    ...vanillaBaseButtonProps,
    to: {
      type: [Object, String] as PropType<RouteLocationRaw>
    },
    name: {
      type: String
    },
    icon: {
      type: Object as PropType<VNode>,
      required: true
    },
    description: {
      type: String
    }
  },
  setup(props) {
    const Inner = () => (
      <VanillaButton
        variant={props.variant}
        onClick={props.onClick}
        class={props.class}
        disabled={props.disabled}
      >
        <div class={"inline-flex center space-x-2"}>
          {props.icon}
          <span>{props.description}</span>
        </div>
      </VanillaButton>
    );
    const WrapInfo = () =>
      props.name ? (
        <NPopover trigger="hover" placement="bottom">
          {{
            trigger() {
              return <Inner />;
            },
            default() {
              return props.name;
            }
          }}
        </NPopover>
      ) : (
        <Inner />
      );
    return () =>
      props.to ? (
        <RouterLink to={props.to}>
          <WrapInfo />
        </RouterLink>
      ) : (
        <WrapInfo />
      );
  }
});

export const RoundedIconButtonBase = defineComponent({
  props: {
    ...baseButtonProps,
    className: String,
    variant: String as RoundedButtonType,
    to: {
      type: [Object, String] as PropType<RouteLocationRaw>
    },
    name: {
      type: String
    },
    icon: {
      type: Object as PropType<VNode>,
      required: true
    }
  },
  setup(props) {
    const Inner = () => (
      <button
        onClick={props.onClick}
        disabled={props.disabled}
        class={clsxm(
          "group inline-flex rounded-full p-2 text-center leading-none center hover:opacity-90 text-base-100 dark:text-white",
          "transition-colors ease-in-out duration-300",
          "hover:contrast-[1.10] active:contrast-125 hover:scale-[1.02] focus:scale-[1.02]",
          "disabled:cursor-not-allowed disabled:bg-[rgba(0,0,0,.08)] disabled:border-[#d9d9d9] disabled:border-solid disabled:border disabled:opacity-80",
          "disabled:dark:border-[#424242] disabled:dark:bg-[rgba(255,255,255,.08)] disabled:dark:text-zinc-50 disabled:text-base-content",
          props.variant === "recycle" ? "bg-[#2080f0] dark:bg-[#1668dc]" : "",
          props.className
        )}
      >
        <div class={"inline-flex center"}>{props.icon}</div>
      </button>
    );
    const WrapInfo = () =>
      props.name ? (
        <NPopover trigger="hover" placement="bottom">
          {{
            trigger() {
              return <Inner />;
            },
            default() {
              return props.name;
            }
          }}
        </NPopover>
      ) : (
        <Inner />
      );
    return () =>
      props.to ? (
        <RouterLink to={props.to}>
          <WrapInfo />
        </RouterLink>
      ) : (
        <WrapInfo />
      );
  }
});

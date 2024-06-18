import { NPopover, useDialog } from "naive-ui";
import { computed, defineComponent, onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import type { MenuModel } from "../../utils/build-menus";
import { onClickOutside } from "@vueuse/core";

import { LogoutIcon, MoonIcon, SunIcon } from "~/components/icons";
import { WEB_URL } from "~/constants/env";
import { RouteName } from "~/router/name";
import { AppStore } from "~/stores/app";
import { UIStore } from "~/stores/ui";
import { RESTManager } from "~/utils";

import { configs } from "../../configs";
import { useStoreRef } from "../../hooks/use-store-ref";
import { UserStore } from "../../stores/user";
import { buildMenuModel, buildMenus } from "../../utils/build-menus";
import { Avatar } from "../avatar";
import uwu from "./uwu.png";

import {
  DrawerRoot,
  DrawerTrigger,
  DrawerPortal,
  DrawerContent,
  DrawerOverlay,
  DrawerTitle
} from "vaul-vue";
import { clsxm } from "~/utils/helper";
import type { AggregateRoot } from "@mx-space/api-client";

export const LayoutHeader = defineComponent({
  name: "LayoutHeader",
  setup() {
    const router = useRouter();
    const title = ref(configs.title);
    onMounted(async () => {
      const fetchedData = await RESTManager.api
        .aggregate()
        .get<AggregateRoot>({})
        .then((res) => {
          return res.seo;
        });

      title.value = fetchedData.title;
    });
    return () => {
      return (
        <header class="fixed inset-x-0 top-0 z-[19] border-b-[0.5px] border-zinc-200 bg-white/80 pl-6 backdrop-blur dark:border-neutral-900 dark:bg-zinc-900/80">
          <nav class="flex h-16 items-center">
            <div class="flex items-center space-x-1 lg:space-x-3">
              <button
                onClick={() => {
                  router.push("/");
                }}
                class="p-2 text-2xl hover:scale-[1.02] focus:scale-[1.02]"
              >
                <img class={"w-full h-[42px]"} src={uwu} />
              </button>
              <BreadcrumbDivider className="opacity-20" />
              <a
                onClick={() => {
                  window.open(WEB_URL);
                }}
                role="button"
                class="font-bold opacity-90 md:text-base text-base-content"
              >
                {title.value}
              </a>
              <BreadcrumbDivider className="opacity-0 lg:opacity-20" />
            </div>

            <div class="relative flex min-w-0 grow items-center justify-between">
              <HeaderMenu />
              <RightBar />
            </div>
          </nav>
          <SecondaryLevelMenu />
        </header>
      );
    };
  }
});

const RightBar = defineComponent({
  setup() {
    const { isDark, toggleDarkWithTransition, viewport } = useStoreRef(UIStore);
    const { user } = useStoreRef(UserStore);
    return () => {
      return (
        <div class="relative mr-2 flex grow items-center justify-end space-x-2 lg:mr-4 lg:grow-0">
          <button
            class={
              "p-2 hover:scale-[1.02] focus:scale-[1.02] rounded-full hover:bg-accent/40 hover:text-base-content transition-colors ease-in-out duration-300"
            }
            onClick={(e) => void toggleDarkWithTransition(e)}
          >
            {!isDark.value ? <SunIcon /> : <MoonIcon />}
          </button>
          <MobileMenuDrawerButton />
          <LogoutAvatarButton />
          {!viewport.value?.mobile && (
            <div class={"text-sm !ml-3 opacity-70 font-bold"}>
              {user.value?.name}
            </div>
          )}
        </div>
      );
    };
  }
});

// const TestRightBar = defineComponent({
//   setup() {
//     const { isDark, toggleDarkWithTransition } = useStoreRef(UIStore);
//     return () => {
//       return (
//         <div class="inline-flex center pr-[24px] md:space-x-2 space-x-1">
//           <div>
//             <button
//               class={
//                 "p-2 inline-flex center hover:scale-[1.02] focus:scale-[1.02] rounded-full hover:bg-accent/40 hover:text-base-content transition-colors ease-in-out duration-300"
//               }
//               onClick={(e) => void toggleDarkWithTransition(e)}
//             >
//               {!isDark.value ? <SunIcon /> : <MoonIcon />}
//             </button>
//           </div>
//           <div>
//             <MobileMenuDrawerButton />
//           </div>
//           <>
//             <AvatarButton />
//           </>
//         </div>
//       );
//     };
//   }
// });

// const AvatarButton = defineComponent({
//   setup() {
//     const { user } = useStoreRef(UserStore);
//     const router = useRouter();
//     const dialog = useDialog();
//     const isHover = ref(false);
//     const handleLogout = async (e: MouseEvent) => {
//       e.stopPropagation();
//       dialog.info({
//         title: "退出登录",
//         content: `确定要退出了吗？`,
//         positiveText: "嗯!",
//         negativeText: "达咩",
//         onPositiveClick: async () => {
//           await RESTManager.api.user.logout.post({});
//           router.push({
//             name: RouteName.Login
//           });
//         }
//       });
//     };

//     return () => {
//       const defaultAvatar = "https://kanodayo.com/assets/avatar.png";
//       const avatar = user.value?.avatar || defaultAvatar;

//       return (
//         <div
//           class={"user-avatar-container rounded-full center inline-flex"}
//           onMouseenter={() => {
//             isHover.value = true;
//           }}
//           onMouseleave={() => {
//             isHover.value = false;
//           }}
//         >
//           <Avatar
//             class={clsxm(
//               "user-avatar z-[2] !overflow-visible bg-center bg-no-repeat bg-cover rounded-full transition-pop transition-shadow duration-200 shadow-none shadow-neutral-100 dark:shadow-neutral-800/50 lg:shadow-sm !size-[38px]",
//               isHover.value ? "active" : ""
//             )}
//             src={avatar}
//           />
//         </div>
//       );
//     };
//   }
// });

const LogoutAvatarButton = defineComponent({
  setup() {
    const { user } = useStoreRef(UserStore);
    const router = useRouter();
    const dialog = useDialog();
    const handleLogout = async (e: MouseEvent) => {
      e.stopPropagation();
      dialog.info({
        title: "退出登录",
        content: `确定要退出了吗？`,
        positiveText: "嗯!",
        negativeText: "达咩",
        onPositiveClick: async () => {
          await RESTManager.api.user.logout.post({});
          router.push({
            name: RouteName.Login
          });
        }
      });
    };

    return () => {
      const defaultAvatar = "https://kanodayo.com/assets/avatar.png";
      const avatar = user.value?.avatar || defaultAvatar;

      return (
        <div
          class={clsxm(
            "box-border backface-hidden shadow-sm !h-[31.5px] rounded-full"
          )}
          onClick={handleLogout}
          role="button"
        >
          <div class={"relative inline-block h-full w-full"}>
            <Avatar
              class="!size-9 select-none rounded-full bg-zinc-200 ring-2 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-800"
              width={24}
              height={24}
              src={avatar}
            />
          </div>
          <div
            class={[
              "z-2 bg-dark-200 inset-0 flex items-center justify-center rounded-full bg-opacity-80 opacity-0 transition-opacity hover:opacity-50 hover:bg-accent/80 !size-9 absolute text-white"
            ]}
          >
            <LogoutIcon />
          </div>
        </div>
      );
    };
  }
});

const MobileMenuDrawerButton = defineComponent({
  setup() {
    const uiStore = useStoreRef(UIStore);
    const router = useRouter();
    const route = computed(() => router.currentRoute.value);
    const menus = ref<MenuModel[]>([]);
    const isDrawerOpen = ref(false);
    const app = useStoreRef(AppStore);
    onMounted(() => {
      // @ts-expect-error
      menus.value = buildMenus(router.getRoutes());
    });

    watch(
      () => app.app.value?.version,
      () => {
        const version = app.app.value?.version;
        if (!version) return;

        if (version === "dev" || window.injectData.PAGE_PROXY) {
          const route = router
            .getRoutes()
            .find((item) => item.path === "/debug") as any;

          menus.value.unshift(buildMenuModel(route, false, ""));
        }
      }
    );

    const indexRef = ref(0);

    function updateIndex(nextIndex: number) {
      if (nextIndex === indexRef.value) {
        indexRef.value = -1;
        return;
      }
      indexRef.value = nextIndex;
    }

    function handleRoute(item: MenuModel, nextIndex?: number) {
      if (item.subItems?.length) {
        return;
      }

      router.push({
        path: item.fullPath,
        query: item.query
      });
      if (typeof nextIndex === "number") {
        updateIndex(nextIndex);
      }
    }

    const onNav = () => {
      isDrawerOpen.value = false;
    };

    const onShow = () => {
      isDrawerOpen.value = true;
    };

    const headerRef = ref<HTMLDivElement>();
    onClickOutside(headerRef, () => {
      isDrawerOpen.value = false;
    });

    // onMounted(() => {
    //   isDrawerOpen.value = false;
    // });

    return () => {
      const isMobile = uiStore.viewport.value.mobile;
      if (!isMobile) return null;

      return (
        <DrawerRoot dismissible open={isDrawerOpen.value}>
          <DrawerTrigger class="center rounded-full p-2 h-[28px] !ml-0">
            <button onClick={onShow} class={"inline-flex center"}>
              <i class="icon-[mingcute--menu-line]" />
            </button>
          </DrawerTrigger>
          <DrawerPortal>
            <DrawerContent
              ref={headerRef}
              style={{ zIndex: 998 }}
              class="fixed inset-x-0 bottom-0 mt-24 flex max-h-[95vh] flex-col rounded-t-[10px] bg-base-100 p-4"
            >
              <DrawerTitle class={"hidden"}>{}</DrawerTitle>
              <div class="mx-auto mb-8 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-neutral-800" />
              <ul class={clsxm("ml-2 items-center gap-2 [&_*]:text-[14px]")}>
                {menus.value.map((item, index) => {
                  const isActive = route.value.path.startsWith(item.path);
                  return (
                    <li data-path={item.fullPath}>
                      <a
                        onClick={(e) => {
                          item.subItems?.length
                            ? updateIndex(index)
                            : handleRoute(item, index);
                          isActive
                            ? e.preventDefault
                            : item.subItems?.length
                              ? () => {}
                              : onNav();
                        }}
                        class="relative flex items-center gap-1 rounded-xl p-2 duration-200 hover:bg-accent/40 text-base-content"
                        role="button"
                      >
                        {isActive && (
                          <span class="absolute inset-0 z-[-1] rounded-xl bg-accent/20" />
                        )}
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                      {item.subItems && (
                        <ul
                          class={[
                            "overflow-hidden",
                            item.subItems.length
                              ? "max-height-transition-05"
                              : ""
                          ]}
                          style={{
                            maxHeight:
                              indexRef.value === index
                                ? `${item.subItems.length * 3.5}rem`
                                : "0"
                          }}
                        >
                          {item.subItems?.map((subItem, index) => {
                            const isSubActive =
                              route.value.fullPath === subItem.fullPath ||
                              route.value.fullPath.startsWith(subItem.fullPath);

                            return (
                              <li>
                                <a
                                  key={index}
                                  class={clsxm(
                                    "relative flex w-full items-center justify-start space-x-2 px-4 py-3 duration-200 hover:bg-accent/5 hover:text-accent",
                                    isSubActive ? "text-accent" : ""
                                  )}
                                  role="button"
                                  onClick={() => {
                                    onNav();
                                    handleRoute(subItem);
                                  }}
                                >
                                  {isSubActive && (
                                    <span class="absolute inset-0 z-[-1] bg-accent/10 rounded-xl" />
                                  )}
                                  {!!subItem.icon && (
                                    <span class="flex center">
                                      {subItem.icon}
                                    </span>
                                  )}
                                  <span class={"pl-2"}>{subItem.title}</span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </DrawerContent>
            <DrawerOverlay
              class="fixed inset-0 bg-neutral-800/40 drawer-overlay-event"
              style={{ zIndex: 997 }}
            />
          </DrawerPortal>
        </DrawerRoot>
      );
    };
  }
});

const HeaderMenu = defineComponent({
  setup() {
    const router = useRouter();
    const route = computed(() => router.currentRoute.value);
    const menus = ref<MenuModel[]>([]);
    const app = useStoreRef(AppStore);
    onMounted(() => {
      // @ts-expect-error
      menus.value = buildMenus(router.getRoutes());
    });

    watch(
      () => app.app.value?.version,
      () => {
        const version = app.app.value?.version;
        if (!version) return;

        if (version === "dev" || window.injectData.PAGE_PROXY) {
          const route = router
            .getRoutes()
            .find((item) => item.path === "/debug") as any;

          menus.value.unshift(buildMenuModel(route, false, ""));
        }
      }
    );

    const indexRef = ref(0);

    function updateIndex(nextIndex: number) {
      if (nextIndex === indexRef.value) {
        indexRef.value = -1;
        return;
      }
      indexRef.value = nextIndex;
    }

    function handleRoute(item: MenuModel, nextIndex?: number) {
      if (item.subItems?.length) {
        return;
      }

      router.push({
        path: item.fullPath,
        query: item.query
      });
      if (typeof nextIndex === "number") {
        updateIndex(nextIndex);
      }
    }
    return () => {
      return (
        <ul
          class={clsxm(
            "ml-2 items-center gap-2 [&_*]:text-[14px]",
            "hidden lg:flex"
          )}
        >
          {menus.value.map((item, index) => {
            const isActive = route.value.path.startsWith(item.path);
            return item.subItems?.length ? (
              <NPopover
                class={clsxm([
                  "select-none rounded-xl bg-white/60 outline-none dark:bg-neutral-900/60",
                  "border border-zinc-900/5 shadow-lg shadow-zinc-800/5 backdrop-blur-md",
                  "dark:border-zinc-100/10 dark:from-zinc-900/70 dark:to-zinc-800/90",
                  "relative flex flex-col min-w-[130px]",
                  "focus-visible:!ring-0"
                ])}
                trigger="hover"
                showArrow={false}
                raw
              >
                {{
                  trigger: () => (
                    <li data-path={item.fullPath}>
                      <RouterLink to={item.redirect ?? item.fullPath}>
                        <a
                          onClick={(e) => {
                            isActive ? e.preventDefault : null;
                            item.subItems?.length
                              ? updateIndex(index)
                              : handleRoute(item, index);
                          }}
                          class="relative flex items-center gap-1 rounded-xl p-2 duration-200 hover:bg-accent/40 text-base-content"
                          role="button"
                        >
                          {isActive && (
                            <span class="absolute inset-0 z-[-1] rounded-xl bg-accent/20" />
                          )}
                          {item.icon}
                          <span>{item.title}</span>
                        </a>
                      </RouterLink>
                    </li>
                  ),
                  default: () => (
                    <>
                      {item.subItems?.map((subItem, index) => {
                        const isSubActive =
                          route.value.fullPath === subItem.fullPath ||
                          route.value.fullPath.startsWith(subItem.fullPath);

                        return subItem.path === "/snippets" ? (
                          <a
                            key={index}
                            //space-x-2 works here why?
                            class={clsxm(
                              "relative flex w-full items-center justify-around px-4 py-3 duration-200 hover:bg-accent/5 hover:text-accent",
                              isSubActive ? "text-accent" : ""
                            )}
                            role="button"
                            onClick={() => handleRoute(subItem)}
                          >
                            {isSubActive && (
                              <span class="absolute inset-0 z-[-1] bg-accent/10" />
                            )}
                            {!!subItem.icon && (
                              <span class="flex center">{subItem.icon}</span>
                            )}
                            <span class={"pl-2"}>{subItem.title}</span>
                          </a>
                        ) : (
                          <a
                            key={index}
                            class={clsxm(
                              "relative flex w-full items-center justify-around space-x-2 px-4 py-3 duration-200 hover:bg-accent/5 hover:text-accent",
                              isSubActive ? "text-accent" : ""
                            )}
                            role="button"
                            onClick={() => handleRoute(subItem)}
                          >
                            {isSubActive && (
                              <span class="absolute inset-0 z-[-1] bg-accent/10" />
                            )}
                            {!!subItem.icon && (
                              <span class="flex center">{subItem.icon}</span>
                            )}
                            <span>{subItem.title}</span>
                          </a>
                        );
                      })}
                    </>
                  )
                }}
              </NPopover>
            ) : (
              <li data-path={item.fullPath}>
                <a
                  onClick={(e) => {
                    isActive ? e.preventDefault : null;
                    item.subItems?.length
                      ? updateIndex(index)
                      : handleRoute(item, index);
                  }}
                  role="button"
                  class="relative flex items-center gap-1 rounded-xl p-2 duration-200 hover:bg-accent/40 text-base-content"
                >
                  {isActive && (
                    <span class="absolute inset-0 z-[-1] rounded-xl bg-accent/20" />
                  )}
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </li>
            );
          })}
        </ul>
      );
    };
  }
});

const SecondaryLevelMenu = defineComponent({
  setup() {
    const uiStore = useStoreRef(UIStore);
    const route = useRoute();
    const router = useRouter();
    const menus = ref<MenuModel[]>([]);
    onMounted(() => {
      // @ts-expect-error
      menus.value = buildMenus(router.getRoutes());
    });

    const indexRef = ref(0);

    function updateIndex(nextIndex: number) {
      if (nextIndex === indexRef.value) {
        indexRef.value = -1;
        return;
      }
      indexRef.value = nextIndex;
    }

    function handleRoute(item: MenuModel, nextIndex?: number) {
      if (item.subItems?.length) {
        return;
      }

      router.push({
        path: item.fullPath,
        query: item.query
      });
      if (typeof nextIndex === "number") {
        updateIndex(nextIndex);
      }
    }

    return () => {
      // const isMobile = uiStore.viewport.value.mobile;
      // if (isMobile) return null;

      const parentRoute = route.path.split("/").slice(0, -1).join("/");
      const parentMenu = menus.value.find((menu) => menu.path === parentRoute);
      if (!parentMenu?.subItems?.length) return null;

      return (
        <nav class="flex h-12 items-center justify-between overflow-auto lg:overflow-visible">
          <ul class="flex w-full space-x-4">
            {parentMenu.subItems.map((item) => {
              const isActive =
                route.fullPath === item.fullPath ||
                route.fullPath.startsWith(item.fullPath);
              return (
                <li key={route.path}>
                  <a
                    onClick={(e) => {
                      isActive ? e.preventDefault : null;
                      handleRoute(item);
                    }}
                    role="button"
                    class={clsxm(
                      "relative flex items-center gap-1 rounded-lg px-2 py-1 duration-200 hover:bg-accent/40",
                      isActive ? "text-accent" : ""
                    )}
                  >
                    {isActive && (
                      <span class="absolute inset-0 z-[-1] rounded-xl bg-accent/20" />
                    )}
                    {item.icon}
                    <span>{item.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      );
    };
  }
});

export const BreadcrumbDivider = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      color="currentColor"
      shape-rendering="geometricPrecision"
      viewBox="0 0 24 24"
      class={className}
    >
      <path d="M16.88 3.549L7.12 20.451" />
    </svg>
  );
};

// export const Sidebar = defineComponent({
//   name: "SideBar",
//   props: {
//     collapse: {
//       type: Boolean,
//       required: true
//     },
//     width: {
//       type: Number,
//       required: true
//     },
//     onCollapseChange: {
//       type: Function as PropType<{ (status: boolean): void }>,
//       required: true
//     }
//   },
//   setup(props) {
//     const router = useRouter();
//     const { user } = useStoreRef(UserStore);
//     const route = computed(() => router.currentRoute.value);
//     const menus = ref<MenuModel[]>([]);
//     const app = useStoreRef(AppStore);
//     onMounted(() => {
//       // @ts-expect-error
//       menus.value = buildMenus(router.getRoutes());
//     });

//     watch(
//       () => app.app.value?.version,
//       () => {
//         const version = app.app.value?.version;
//         if (!version) return;

//         if (version === "dev" || window.injectData.PAGE_PROXY) {
//           const route = router
//             .getRoutes()
//             .find((item) => item.path === "/debug") as any;

//           menus.value.unshift(buildMenuModel(route, false, ""));
//         }
//       }
//     );

//     const indexRef = ref(0);

//     function updateIndex(nextIndex: number) {
//       if (nextIndex === indexRef.value) {
//         indexRef.value = -1;
//         return;
//       }
//       indexRef.value = nextIndex;
//     }

//     function handleRoute(item: MenuModel, nextIndex?: number) {
//       if (item.subItems?.length) {
//         return;
//       }

//       router.push({
//         path: item.fullPath,
//         query: item.query
//       });
//       if (typeof nextIndex === "number") {
//         updateIndex(nextIndex);
//       }
//     }

//     const title = configs.title;
//     const sidebarRef = ref<HTMLDivElement>();
//     const uiStore = useStoreRef(UIStore);
//     onClickOutside(sidebarRef, () => {
//       const v = uiStore.viewport;
//       const isM = v.value.pad || v.value.mobile;
//       if (isM) {
//         props.onCollapseChange(true);
//       }
//     });
//     const { isDark, toggleDark } = useStoreRef(UIStore);

//     const { onTransitionEnd, statusRef } = useSidebarStatusInjection(
//       () => props.collapse
//     );

//     return () => {
//       const isPhone = uiStore.viewport.value.mobile;
//       return (
//         <div
//           class={[
//             styles.root,
//             props.collapse ? styles.collapse : null,

//             styles[statusRef.value]
//           ]}
//           style={{
//             width: !props.collapse && props.width ? `${props.width}px` : ""
//           }}
//           onTransitionend={onTransitionEnd}
//           ref={sidebarRef}
//         >
//           <div class={styles.sidebar}>
//             <div
//               class={
//                 "relative h-20 flex-shrink-0 text-center text-2xl font-medium"
//               }
//             >
//               <button
//                 class={styles["toggle-color-btn"]}
//                 onClick={() => void toggleDark()}
//               >
//                 {!isDark.value ? <SunIcon /> : <MoonIcon />}
//               </button>
//               <h1 class={styles["header-title"]}>
//                 {statusRef.value === "expanded" && (
//                   <img
//                     class={
//                       "absolute left-1/2 top-1/2 h-[50px] -translate-x-1/2 -translate-y-1/2 transform"
//                     }
//                     src={uwu}
//                   />
//                 )}
//                 <span class={"sr-only"}>{title}</span>
//               </h1>
//               <button
//                 class={styles["collapse-button"]}
//                 onClick={() => {
//                   props.onCollapseChange(!props.collapse);
//                 }}
//               >
//                 <SidebarCloseIcon class={styles["collapse-icon"]} />
//               </button>
//             </div>

//             <NLayoutContent class={styles.menu} nativeScrollbar={false}>
//               <div class={styles.items}>
//                 {menus.value.map((item, index) => {
//                   return (
//                     <div
//                       class={[
//                         route.value.fullPath === item.fullPath ||
//                         route.value.fullPath.startsWith(item.fullPath)
//                           ? styles.active
//                           : "",

//                         styles.item
//                       ]}
//                       data-path={item.fullPath}
//                     >
//                       <MenuItem
//                         className={!isPhone ? "py-4" : "py-6"}
//                         title={item.title}
//                         onClick={() =>
//                           item.subItems?.length
//                             ? updateIndex(index)
//                             : handleRoute(item, index)
//                         }
//                         collapse={props.collapse}
//                       >
//                         {{
//                           icon() {
//                             return item.icon;
//                           }
//                         }}
//                       </MenuItem>

//                       {item.subItems && (
//                         <ul
//                           class={[
//                             "overflow-hidden",
//                             item.subItems.length ? styles["has-child"] : "",
//                             indexRef.value === index ? styles.expand : ""
//                           ]}
//                           style={{
//                             maxHeight:
//                               indexRef.value === index
//                                 ? `${item.subItems.length * 3.5}rem`
//                                 : "0"
//                           }}
//                         >
//                           {item.subItems.map((child) => {
//                             return (
//                               <li
//                                 key={child.path}
//                                 class={[
//                                   route.value.fullPath === child.fullPath ||
//                                   route.value.fullPath.startsWith(
//                                     child.fullPath
//                                   )
//                                     ? styles.active
//                                     : "",
//                                   styles.item
//                                 ]}
//                               >
//                                 <MenuItem
//                                   collapse={props.collapse}
//                                   title={child.title}
//                                   onClick={() => handleRoute(child)}
//                                   className={"py-4"}
//                                 >
//                                   {{
//                                     icon() {
//                                       return child.icon;
//                                     }
//                                   }}
//                                 </MenuItem>
//                               </li>
//                             );
//                           })}
//                         </ul>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </NLayoutContent>

//             <button
//               class={styles["sidebar-footer"]}
//               onClick={() => {
//                 window.open(WEB_URL);
//               }}
//             >
//               <LogoutAvatarButton />

//               <span class={styles["sidebar-username"]}>{user.value?.name}</span>
//             </button>
//           </div>
//         </div>
//       );
//     };
//   }
// });

// const MenuItem = defineComponent({
//   props: {
//     title: {
//       type: String,
//       required: true
//     },
//     onClick: {
//       type: Function as PropType<() => any>,
//       required: true
//     },
//     collapse: {
//       type: Boolean,
//       required: true
//     },
//     className: {
//       type: String
//     }
//   },

//   setup(props, { slots }) {
//     return () => (
//       <button
//         onClick={props.onClick}
//         class={["flex w-full items-center py-4", props.className]}
//       >
//         <span
//           class={[
//             "flex basis-12 items-center justify-center transition-all duration-300 ease-in-out",
//             props.collapse ? "basis-[var(--w)]" : ""
//           ]}
//         >
//           <Icon>{slots.icon!()}</Icon>
//         </span>
//         <span class={styles["item-title"]}>{props.title}</span>
//       </button>
//     );
//   }
// });

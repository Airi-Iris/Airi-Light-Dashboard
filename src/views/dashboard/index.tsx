import {
  CopyIcon,
  GrafanaIcon,
  RedisIcon,
  RefreshIcon
} from "~/components/icons";
import { IpInfoPopover } from "~/components/ip-info";
import { useShorthand } from "~/components/shorthand";
import { checkUpdateFromGitHub } from "~/external/api/github-check-update";
import { SentenceType, fetchHitokoto } from "~/external/api/hitokoto";
import { getJinRiShiCiOne } from "~/external/api/jinrishici";
import { usePortalElement } from "~/hooks/use-portal-element";
import { useStoreRef } from "~/hooks/use-store-ref";

import { pick } from "lodash-es";
import {
  NButton,
  NIcon,
  NPopover,
  NText,
  useMessage,
  useNotification
} from "naive-ui";
import { RouteName } from "~/router/name";
import { AppStore } from "~/stores/app";
import { UserStore } from "~/stores/user";
import { RESTManager, parseDate } from "~/utils";
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  ref
} from "vue";
import { RouterLink, useRouter } from "vue-router";

import { Icon } from "@vicons/utils";

import PKG from "../../../package.json";
import { UpdatePanel } from "./update-panel";
import type { CardProps } from "./card";
import type { Stat } from "~/models/stat";
import type { ShiJuData } from "~/external/api/jinrishici";
import { formatNumber } from "~/utils/number";
import { RelativeTime } from "~/components/time/relative-time";
import { clsxm } from "~/utils/helper";
import { VanillaButton } from "~/components/button/rounded-button";
import clsx from "clsx";
import { GATEWAY_URL } from "~/constants/env";

export const DashBoardView = defineComponent({
  name: "DashboardView",

  setup() {
    const stat = ref(
      new Proxy(
        {},
        {
          get() {
            return "N/A";
          }
        }
      ) as Stat
    );
    const statTime = ref(null as unknown as Date);
    const fetchStat = async () => {
      const counts = (await RESTManager.api.aggregate.stat.get()) as any;
      stat.value = counts;
      statTime.value = new Date();
    };

    const siteWordCount = ref(0);
    const readAndLikeCounts = ref({
      totalLikes: 0,
      totalReads: 0
    });
    const fetchSiteWordCount = async () => {
      return await RESTManager.api.aggregate.count_site_words.get<{
        data: { length: number };
      }>();
    };

    const fetchReadAndLikeCounts = async () => {
      return await RESTManager.api.aggregate.count_read_and_like.get<{
        totalLikes: number;
        totalReads: number;
      }>();
    };

    onMounted(async () => {
      const [c, rl] = await Promise.all([
        fetchSiteWordCount(),
        fetchReadAndLikeCounts()
      ]);
      siteWordCount.value = c.data.length;

      readAndLikeCounts.value = rl;
    });

    const refreshHitokoto = () => {
      fetchHitokoto([
        SentenceType.动画,
        SentenceType.原创,
        SentenceType.哲学,
        SentenceType.文学
      ]).then((data) => {
        const postfix = Object.values(
          pick(data, ["from", "from_who", "creator"])
        ).find(Boolean);
        if (!data.hitokoto) {
          hitokoto.value = "没有获取到句子信息";
        } else {
          hitokoto.value = data.hitokoto + (postfix ? ` —— ${postfix}` : "");
        }
      });
    };

    // 轮询状态计时器
    let timer: any;
    onMounted(() => {
      timer = setInterval(() => {
        fetchStat();
      }, 1000 * 15);
    });
    onBeforeUnmount(() => {
      timer = clearTimeout(timer);
    });

    const shiju = ref("");
    const shijuData = ref<ShiJuData | null>(null);

    onBeforeMount(() => {
      refreshHitokoto();
      fetchStat();

      getJinRiShiCiOne().then((data) => {
        shiju.value = data.content;
        shijuData.value = data;
      });
    });

    const hitokoto = ref("");
    const message = useMessage();

    const userStore = useStoreRef(UserStore);
    const router = useRouter();
    const UserLoginStat = defineComponent(() => () => (
      <div>
        <h3 class="mb-4 text-xl font-normal text-opacity-80">登录记录</h3>
        <p class="relative -mt-2 mb-3 text-gray-500">
          <span class="flex items-center">
            <span>上次登录 IP: </span>
            {userStore.user.value?.lastLoginIp ? (
              <IpInfoPopover
                trigger="hover"
                triggerEl={<span>{userStore.user.value?.lastLoginIp}</span>}
                ip={userStore.user.value?.lastLoginIp}
              />
            ) : (
              "N/A"
            )}
          </span>
          <div class="pt-[.5rem]" />
          <span>
            上次登录时间:{" "}
            {userStore.user.value?.lastLoginTime ? (
              <time>
                {parseDate(
                  userStore.user.value?.lastLoginTime,
                  "yyyy 年 M 月 d 日 HH:mm:ss"
                )}
              </time>
            ) : (
              "N/A"
            )}
          </span>
        </p>
      </div>
    ));

    const { create: createShortHand } = useShorthand();

    const dataStat = computed<CardProps[]>(() => [
      {
        label: "博文",
        value: stat.value.posts,
        icon: <i class="icon-[mingcute--code-line]" />,
        actions: [
          {
            name: "撰写",
            primary: true,
            onClick() {
              router.push({ name: RouteName.EditPost });
            }
          },
          {
            name: "管理",
            onClick() {
              router.push({ name: RouteName.ViewPost, query: { page: 1 } });
            }
          }
        ]
      },

      {
        label: "日记",
        value: stat.value.notes,
        icon: <i class="icon-[mingcute--quill-pen-line]" />,
        actions: [
          {
            name: "撰写",
            primary: true,
            onClick() {
              router.push({ name: RouteName.EditNote });
            }
          },
          {
            name: "管理",
            onClick() {
              router.push({ name: RouteName.ViewNote, query: { page: 1 } });
            }
          }
        ]
      },

      {
        label: "页面",
        value: stat.value.pages,
        icon: <i class="icon-[mingcute--file-line]" />,
        actions: [
          {
            primary: true,
            name: "管理",
            onClick() {
              router.push({ name: RouteName.ListPage, query: { page: 1 } });
            }
          }
        ]
      },

      {
        label: "速记",
        value: stat.value.recently,
        icon: <i class="icon-[mingcute--pencil-3-line]" />,
        actions: [
          {
            primary: true,
            name: "记点啥",

            onClick() {
              createShortHand();
            }
          },
          {
            name: "管理",
            onClick() {
              router.push({
                name: RouteName.ListShortHand,
                query: { page: 1 }
              });
            }
          }
        ]
      },

      {
        label: "分类",
        value: stat.value.categories,
        icon: <i class="icon-[mingcute--plugin-2-line]" />,
        actions: [
          {
            primary: true,
            name: "管理",
            onClick() {
              router.push({ name: RouteName.EditCategory });
            }
          }
        ]
      },

      {
        label: "全部评论",
        value: stat.value.allComments,
        icon: <i class="icon-[mingcute--chat-3-line]" />,
        actions: [
          {
            primary: true,
            name: "管理",
            onClick() {
              router.push({ name: RouteName.Comment, query: { state: 1 } });
            }
          }
        ]
      },

      {
        label: "未读评论",
        value: stat.value.unreadComments,
        icon: <i class="icon-[mingcute--comment-2-line]" />,
        highlight: stat.value.unreadComments > 0,
        actions: [
          {
            primary: true,
            showBadage: true,
            name: "查看",
            onClick() {
              router.push({ name: RouteName.Comment, query: { state: 0 } });
            }
          }
        ]
      },

      {
        label: "友链",
        value: stat.value.links,
        icon: <i class="icon-[mingcute--dandelion-line]" />,
        actions: [
          {
            primary: true,
            name: "管理",
            onClick() {
              router.push({ name: RouteName.Friend, query: { state: 0 } });
            }
          }
        ]
      },

      {
        label: "新的友链申请",
        value: stat.value.linkApply,
        icon: <i class="icon-[mingcute--directions-line]" />,
        highlight: stat.value.linkApply > 0,
        actions: [
          {
            primary: true,
            showBadage: true,
            name: "查看",
            onClick() {
              router.push({ name: RouteName.Friend, query: { state: 1 } });
            }
          }
        ]
      },

      {
        label: "说说",
        value: stat.value.says,
        icon: <i class="icon-[mingcute--bookmarks-line]" />,
        actions: [
          {
            primary: true,

            name: "说一句",
            onClick() {
              router.push({
                name: RouteName.EditSay
              });
            }
          },

          {
            primary: false,
            name: "管理",
            onClick() {
              router.push({
                name: RouteName.ListSay
              });
            }
          }
        ]
      },

      {
        label: "缓存",
        value: "Redis",
        icon: <RedisIcon />,
        actions: [
          {
            primary: false,
            name: "清除 API 缓存",
            onClick() {
              RESTManager.api.clean_catch.get().then(() => {
                message.success("清除成功");
              });
            }
          },
          {
            primary: false,
            name: "清除数据缓存",
            onClick() {
              RESTManager.api.clean_redis.get().then(() => {
                message.success("清除成功");
              });
            }
          }
        ]
      },

      {
        label: "API 总调用次数",
        value: stat.value.callTime,
        icon: <i class="icon-[mingcute--heartbeat-line]" />,
        actions: [
          {
            primary: true,
            name: "查看",
            onClick() {
              router.push({
                name: RouteName.Analyze
              });
            }
          }
        ]
      },

      {
        label: "今日 IP 访问次数",
        value: stat.value.todayIpAccessCount,
        icon: <i class="icon-[mingcute--cursor-3-line]" />,
        actions: [
          {
            primary: true,
            name: "查看",
            onClick() {
              router.push({
                name: RouteName.Analyze
              });
            }
          }
        ]
      },

      {
        label: "全站字符数",
        value: siteWordCount.value,
        icon: <i class="icon-[mingcute--translate-2-line]" />
      },

      {
        label: "总阅读量",
        value: readAndLikeCounts.value.totalReads,
        icon: <i class="icon-[mingcute--book-6-line]" />
      },
      {
        label: "总点赞数",
        value: readAndLikeCounts.value.totalLikes,
        icon: <i class="icon-[mingcute--heart-line]" />
      },

      {
        label: "当前在线访客",
        value: stat.value.online,
        icon: <i class="icon-[mingcute--radar-line]" />
      },
      {
        label: "今日访客",
        value: stat.value.todayOnlineTotal,
        icon: <i class="icon-[mingcute--foot-line]" />
      },
      {
        value: stat.value.todayMaxOnline,
        label: "今日最多同时在线人数",
        icon: <i class="icon-[mingcute--fire-line]" />
      },
      {
        label: "Grafana数据监控",
        icon: <GrafanaIcon />,
        actions: [
          {
            primary: false,
            name: "前往",
            onClick() {
              window.open("https://mon.kanodayo.net/", "_blank");
            }
          }
        ]
      }
    ]);

    const DataStat = defineComponent(() => {
      return () => (
        <>
          <div class="relative @container">
            <h3 class="mb-4 text-xl font-normal text-opacity-80">
              数据统计：
              <small class="text-sm font-normal text-gray-500 inline-flex center">
                数据更新于：
                <time>
                  {" "}
                  {statTime.value ? (
                    <RelativeTime
                      time={new Date(statTime.value)}
                      showPopoverInfoAbsoluteTime={false}
                    />
                  ) : (
                    "N/A"
                  )}
                </time>
                <NButton text onClick={fetchStat} class="ml-4 text-black">
                  <Icon>
                    <RefreshIcon />
                  </Icon>
                </NButton>
              </small>
            </h3>
            <div class="grid grid-cols-1 gap-6 @[550px]:grid-cols-2 @[900px]:grid-cols-3 @[1124px]:grid-cols-4 @[1200px]:grid-cols-5">
              {dataStat.value.map((props) => (
                <div
                  class={clsx(
                    "relative rounded-md border p-4 transition-colors ease-in-out duration-300",
                    props.highlight && "border-accent bg-accent/20"
                  )}
                  key={props.label}
                >
                  <div class="font-medium">{props.label}</div>
                  <div class="my-2 text-2xl font-medium">
                    {typeof props.value === "number"
                      ? formatNumber(props.value)
                      : props.value}
                  </div>

                  <div class="absolute right-4 top-1/2 flex -translate-y-1/2 text-[30px] center">
                    {props.icon}
                  </div>
                  <div class="mt-4 flex flex-wrap gap-2">
                    {props.actions?.map((action) => {
                      return (
                        <VanillaButton
                          key={action.name}
                          class="rounded-md shadow-none"
                          variant={action.primary ? "primary" : "secondary"}
                          onClick={action.onClick}
                        >
                          {action.name}
                        </VanillaButton>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    });

    const isInApiDebugMode =
      localStorage.getItem("__api") ||
      localStorage.getItem("__gateway") ||
      sessionStorage.getItem("__api") ||
      sessionStorage.getItem("__gateway") ||
      window.injectData.PAGE_PROXY;

    return () => (
      <>
        {isInApiDebugMode && (
          <div
            class={[
              "bg-dark-800 z-[2] fixed left-0 right-0 top-[57px] center flex h-[40px] bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-neutral-900 border-b-[0.5px] whitespace-pre text-gray-400 transition-all duration-500",
              ""
            ]}
          >
            You are in customizing the API endpoint mode, please check:{" "}
            <RouterLink
              to={"/setup-api"}
              class={
                "text-accent border-b border-transparent hover:border-accent"
              }
            >
              Setup-API
            </RouterLink>
            . Endpoint: {RESTManager.endpoint}, Gateway: {GATEWAY_URL},
            Dashboard is in local <span class={"text-yellow-500"}>dev </span>
            mode
            {window.injectData.PAGE_PROXY && ", Dashboard is in local dev mode"}
          </div>
        )}
        <div class="mx-auto w-full max-w-[1500px] p-4 h-fit">
          <h1 class="text-3xl font-light">欢迎回来</h1>
          <div class="mt-8 flex flex-col gap-4 lg:grid lg:grid-cols-2">
            <div>
              <h3 class="my-[10px] font-light text-opacity-80">一言</h3>

              <div class="flex flex-wrap items-center gap-2">
                {hitokoto.value ? (
                  <>
                    <span class="leading-normal">{hitokoto.value}</span>
                    <div class="ml-0 flex center space-x-2">
                      <NButton
                        text
                        onClick={refreshHitokoto}
                        class="phone:float-right ml-0"
                      >
                        <Icon>
                          <RefreshIcon />
                        </Icon>
                      </NButton>

                      <NButton
                        text
                        onClick={() => {
                          navigator.clipboard.writeText(hitokoto.value);
                          message.success("已复制");
                          message.info(hitokoto.value);
                        }}
                      >
                        <Icon>
                          <CopyIcon />
                        </Icon>
                      </NButton>
                    </div>
                  </>
                ) : (
                  <NText>加载中...</NText>
                )}
              </div>
            </div>
            <div>
              <h3 class="my-[10px] font-light text-opacity-80">今日诗句</h3>

              <NPopover
                trigger={"hover"}
                placement="bottom"
                raw
                class={clsxm(
                  "shadow-out-sm focus:!shadow-out-sm focus-visible:!shadow-out-sm",
                  "rounded-xl border border-zinc-400/20 p-4 shadow-lg outline-none backdrop-blur-lg dark:border-zinc-500/30",
                  "bg-zinc-50/80 dark:bg-neutral-900/80",
                  "relative z-[2]",
                  "max-w-[25rem] break-all rounded-xl px-4 py-2 shadow-sm"
                )}
              >
                {{
                  trigger() {
                    return <NText>{shiju.value || "获取中"}</NText>;
                  },
                  default() {
                    const origin = shijuData.value?.origin;
                    if (!origin) {
                      return null;
                    }
                    return (
                      <div class={"max-w-[800px] text-center"}>
                        <h3 class="top-0 py-2 text-2xl font-medium md:sticky">
                          {origin.title}
                        </h3>
                        <h4 class="my-4">
                          【{origin.dynasty.replace(/代$/, "")}】{origin.author}
                        </h4>
                        <div class="px-6 pb-6">
                          {origin.content.map((c) => (
                            <p key={c} class="flex">
                              {c}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  }
                }}
              </NPopover>
            </div>
          </div>
          <div class="mt-8 flex flex-col gap-[1.0rem]">
            <UserLoginStat />
            <DataStat />
          </div>
          <AppIF />
        </div>
      </>
    );
  }
});

const AppIF = defineComponent({
  setup() {
    const { app } = useStoreRef(AppStore);
    const notice = useNotification();
    const versionMap = ref({} as { admin: string; system: string });
    // const versionMap = ref({} as { system: string });
    const closedTips = useStorage("closed-tips", {
      dashboard: null as string | null,
      system: null as string | null
    });

    const portal = usePortalElement();
    const handleUpdate = () => {
      portal(<UpdatePanel />);
    };
    onMounted(async () => {
      if (__DEV__) {
        return;
      }

      if (app.value?.version.startsWith("demo")) {
        return;
      }

      const { dashboard, system } = await checkUpdateFromGitHub();

      if (
        dashboard !== PKG.version &&
        closedTips.value.dashboard !== dashboard
      ) {
        const $notice = notice.info({
          title: "[Airi-Light-Dashboard] 有新版本啦！",
          content: () => (
            <div>
              <p>{`当前版本：${PKG.version}，最新版本：${dashboard}`}</p>
              <div class={"text-right"}>
                <NButton
                  round
                  onClick={() => {
                    handleUpdate();
                    $notice.destroy();
                  }}
                >
                  更新
                </NButton>
              </div>
            </div>
          ),
          closable: true,
          onClose: () => {
            closedTips.value.dashboard = dashboard;
          }
        });
      }

      versionMap.value = {
        admin: dashboard,
        system
      };

      // const { dashboard, system } = await checkUpdateFromGitHub();

      // if (
      //   dashboard !== PKG.version &&
      //   closedTips.value.dashboard !== dashboard
      // ) {
      //   const $notice = notice.info({
      //     title: "[管理中台] 有新版本啦！",
      //     content: () => (
      //       <div>
      //         <p>{`当前版本：${PKG.version}，最新版本：${dashboard}`}</p>
      //         <div class={"text-right"}>
      //           <NButton
      //             round
      //             onClick={() => {
      //               handleUpdate();
      //               $notice.destroy();
      //             }}
      //           >
      //             更更更！
      //           </NButton>
      //         </div>
      //       </div>
      //     ),
      //     closable: true,
      //     onClose: () => {
      //       closedTips.value.dashboard = dashboard;
      //     }
      //   });
      // }

      // versionMap.value = {
      //   admin: dashboard,
      //   system
      // };
    });

    watchEffect(() => {
      if (__DEV__) {
        return;
      }

      if (app.value?.version.startsWith("demo")) {
        notice.info({
          title: "Demo Mode",
          content: "当前处于 Demo 模式，部分功能不可用"
        });
        return;
      }

      if (
        app.value?.version &&
        app.value.version !== "dev" &&
        versionMap.value.system &&
        closedTips.value.system !== versionMap.value.system &&
        versionMap.value.system !== app.value.version
      ) {
        notice.info({
          title: "[系统] 有新版本啦！",
          content: `当前版本：${app.value.version}，最新版本：${versionMap.value.system}`,
          closable: true,
          onClose: () => {
            closedTips.value.system = versionMap.value.system;
          }
        });
      }
    });

    return () => (
      <div class="opacity-60 mt-2 text-center">
        <div class={"inline-flex center text-center"}>
          管理版本: {__DEV__ ? "dev" : window.version || "N/A"}
          <NButton text onClick={handleUpdate} size="small" class={"ml-2"}>
            <NIcon size={12}>
              <RefreshIcon />
            </NIcon>
          </NButton>
          <span class={"hidden"}>页面来源：{window.pageSource || ""}</span>
        </div>
        <br />
        Mix Space Core 版本：{app.value?.version || "N/A"}
      </div>
    );
  }
});

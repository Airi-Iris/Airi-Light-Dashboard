/**
 * 路由在此定义
 */
import { OpenAIIcon } from "~/components/icons";
import $RouterView from "~/layouts/router-view";
import { DashBoardView } from "~/views/dashboard";

import { AppLayout } from "~/layouts/app-layout";
import { ManagePostListView } from "~/views/manage-posts/list";

import SetupLayout from "../layouts/setup-view.vue";
import CommentPage from "../views/comments/index";
import LoginView from "../views/login";
import { ManageNoteListView } from "../views/manage-notes/list";
import ManageNoteWrite from "../views/manage-notes/write";
import ManagePostsWrite from "../views/manage-posts/write";
import { RouteName } from "./name";
import type { RouteRecordRaw } from "vue-router";

export const routeForMenu: Array<RouteRecordRaw> = [
  {
    path: "/dashboard",
    component: DashBoardView,
    name: RouteName.Dashboard,
    meta: {
      title: "仪表盘",
      icon: <i class="icon-[mingcute--dashboard-line]" />
    }
  },
  {
    path: "/posts",
    name: RouteName.Post,
    meta: {
      title: "文稿",
      icon: <i class="icon-[mingcute--code-line]" />
    },
    redirect: "/posts/view",
    component: $RouterView,
    children: [
      {
        path: "view",
        name: RouteName.ViewPost,
        meta: {
          title: "管理",
          icon: <i class="icon-[mingcute--eye-line] size-5" />,
          query: { page: 1 }
        },
        component: ManagePostListView
      },

      {
        path: "edit",
        name: RouteName.EditPost,
        meta: {
          title: "撰写",
          icon: <i class="icon-[mingcute--pencil-ruler-line] size-5" />
        },
        props: true,
        component: ManagePostsWrite
      },

      {
        path: "category",
        name: RouteName.EditCategory,
        meta: {
          title: "分类 / 标签",
          icon: <i class="icon-[mingcute--hashtag-line] size-5" />
        },
        component: () =>
          import("../views/manage-posts/category").then((m) => m.CategoryView)
      }
    ]
  },
  {
    path: "/notes",
    name: RouteName.Note,
    meta: {
      title: "手记",
      icon: <i class="icon-[mingcute--quill-pen-line]" />
    },
    redirect: "/notes/view",
    component: $RouterView,
    children: [
      {
        path: "view",
        name: "view-notes",
        meta: {
          title: "管理",
          query: { page: 1 },
          icon: <i class="icon-[mingcute--eye-line] size-5" />
        },
        component: ManageNoteListView
      },
      {
        path: "edit",
        name: RouteName.EditNote,
        meta: {
          title: "撰写",
          icon: <i class="icon-[mingcute--pencil-ruler-line] size-5" />
        },
        component: ManageNoteWrite
      },

      {
        path: "topic",
        name: RouteName.Topic,
        meta: {
          title: "专栏",
          icon: <i class="icon-[mingcute--typhoon-line] size-5" />
        },
        component: () => import("../views/manage-notes/topic")
      }
    ]
  },
  {
    path: "/comments",
    name: RouteName.Comment,
    meta: {
      title: "评论",
      query: { page: 1, state: 0 },
      icon: <i class="icon-[mingcute--comment-line]" />
    },
    component: CommentPage
  },
  {
    path: "/pages",
    name: RouteName.Page,
    redirect: "/pages/list",
    meta: {
      title: "页面",
      icon: <i class="icon-[mingcute--file-line]" />
    },
    component: $RouterView,
    children: [
      {
        path: "list",
        name: RouteName.ListPage,
        meta: {
          title: "管理",
          icon: <i class="icon-[mingcute--eye-line] size-5" />,
          query: { page: 1 }
        },
        component: () =>
          import("../views/manage-pages/list").then((m) => m.ManagePageListView)
      },
      {
        path: "edit",
        name: RouteName.EditPage,
        meta: {
          title: "编辑",
          icon: <i class="icon-[mingcute--pencil-ruler-line] size-5" />
        },
        component: () => import("../views/manage-pages/write")
      }
    ]
  },
  {
    path: "/files",
    name: RouteName.File,
    meta: {
      title: "文件",
      icon: <i class="icon-[mingcute--attachment-2-line]" />
    },
    component: () => import("../views/manage-files")
  },
  {
    path: "/says",
    name: RouteName.Say,
    meta: {
      title: "说说",
      icon: <i class="icon-[mingcute--bookmarks-line]" />
    },
    component: $RouterView,
    redirect: "/says/list",
    children: [
      {
        path: "list",
        name: RouteName.ListSay,
        meta: {
          title: "说什么了呢",
          query: { page: 1 },
          icon: <i class="icon-[mingcute--eye-line] size-5" />
        },
        component: () => import("../views/manage-says/list")
      },
      {
        path: "edit",
        name: RouteName.EditSay,
        meta: {
          title: "说点什么呢",
          icon: <i class="icon-[mingcute--pencil-ruler-line] size-5" />
        },
        component: () => import("../views/manage-says/edit")
      }
    ]
  },
  {
    path: "/recently",
    name: RouteName.ListShortHand,
    meta: {
      title: "速记",
      icon: <i class="icon-[mingcute--pencil-3-line]" />
    },
    component: () => import("../views/shorthand")
  },
  {
    path: "/projects",
    name: RouteName.Project,
    meta: {
      title: "项目",
      icon: <i class="icon-[mingcute--package-2-line]" />
    },
    component: $RouterView,
    redirect: "/projects/list",
    children: [
      {
        path: "list",
        name: RouteName.ListProject,
        meta: {
          title: "项目列表",
          query: { page: 1 },
          icon: <i class="icon-[mingcute--eye-line] size-5" />
        },
        component: () => import("../views/manage-project/list")
      },
      {
        path: "edit",
        name: RouteName.EditProject,
        meta: {
          title: "创建项目",
          icon: <i class="icon-[mingcute--pencil-ruler-line] size-5" />
        },
        component: () => import("../views/manage-project/edit")
      }
    ]
  },
  {
    path: "/friends",
    name: RouteName.Friend,
    meta: {
      title: "朋友们",
      icon: <i class="icon-[mingcute--dandelion-line]" />,
      query: { state: "0" }
    },
    component: () => import("../views/manage-friends")
  },
  {
    path: "/ai",

    name: RouteName.Ai,
    meta: {
      title: "AI",
      icon: <OpenAIIcon />
    },

    redirect: "/ai/summary",
    children: [
      {
        path: "summary",
        name: RouteName.AiSummary,
        meta: {
          title: "摘要",
          icon: <OpenAIIcon />
        },
        component: () => import("../views/ai/summary")
      }
    ]
  },
  {
    path: "/analyze",
    name: RouteName.Analyze,
    component: () => import("../views/analyze"),
    meta: {
      title: "数据",
      icon: <i class="icon-[mingcute--chart-line-line]" />,
      query: { page: 1 }
    }
  },
  {
    path: "/setting",
    redirect: "/setting/user",
    meta: {
      title: "系统设定",
      icon: <i class="icon-[mingcute--settings-1-line]" />,
      params: { type: "user" }
    },
    component: () => null,
    children: []
  },
  {
    path: "/setting/:type",
    name: RouteName.Setting,
    meta: {
      title: "设定",
      params: { type: "user" },
      hide: true
    },
    component: () => import("../views/setting")
  },

  {
    path: "/extra-features",
    name: RouteName.Other,
    meta: {
      title: "附加功能",
      icon: <i class="icon-[mingcute--linear-line]" />
    },
    component: $RouterView,
    redirect: "/extra-features/snippets",
    children: [
      {
        path: "snippets",
        name: RouteName.Snippet,
        meta: {
          title: "配置云函数",
          icon: <i class="icon-[mingcute--braces-line] size-5" />
        },
        component: () => import("../views/extra-features/snippets")
      },

      {
        path: "subscribe",
        name: RouteName.Subscribe,
        meta: {
          title: "管理订阅",
          icon: <i class="icon-[mingcute--mail-send-line] size-5" />
        },
        component: () => import("../views/extra-features/subscribe")
      },
      {
        path: "webhooks",
        name: RouteName.Webhook,
        meta: {
          title: "Webhooks",
          icon: <i class="icon-[ri--webhook-line] size-5" />
        },
        component: () => import("../views/extra-features/webhook")
      },
      {
        path: "template",
        name: RouteName.AssetTemplate,
        meta: {
          title: "模板编辑",
          icon: <i class="icon-[mingcute--paper-line] size-5" />
        },
        component: () => import("../views/extra-features/template")
      },
      {
        path: "markdown",
        name: RouteName.Markdown,
        meta: {
          title: "Markdown",

          icon: <i class="icon-[mingcute--markdown-line] size-5" />
        },
        component: () => import("../views/extra-features/markdown-helper")
      }
    ]
  },
  {
    name: RouteName.Maintain,
    path: "/maintenance",
    component: $RouterView,
    redirect: "/maintenance/cron",
    meta: {
      title: "维护",
      icon: <i class="icon-[mingcute--hammer-line]" />
    },
    children: [
      {
        path: "cron",
        name: RouteName.Cron,
        meta: {
          title: "任务",
          icon: <i class="icon-[mingcute--history-line] size-5" />
        },
        component: () => import("../views/maintenance/cron")
      },
      {
        path: "backup",
        name: RouteName.Backup,
        meta: {
          title: "备份",
          icon: <i class="icon-[mingcute--history-2-line] size-5" />
        },
        component: () => import("../views/maintenance/backup")
      },

      {
        path: "log",
        name: RouteName.Log,
        meta: {
          title: "日志",
          icon: <i class="icon-[mingcute--heartbeat-line] size-5" />
        },
        component: () => import("../views/maintenance/log-view")
      }
    ]
  }
];

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: AppLayout,
    name: RouteName.Home,
    redirect: "/dashboard",
    children: [...routeForMenu]
  },
  {
    path: "/",
    component: SetupLayout,

    children: [
      {
        path: "/login",
        name: RouteName.Login,
        meta: { isPublic: true, title: "登录" },
        component: LoginView
      },

      {
        path: "/setup",
        name: RouteName.Setup,
        meta: { isPublic: true, title: "初始化" },
        component: () => import("../views/setup/index")
      },

      {
        path: "/setup-api",
        meta: { isPublic: true, title: "设置接口地址" },
        component: () => import("../views/setup-api")
      }
    ]
  },

  // for dev
  {
    path: "/dev",
    redirect: __DEV__ ? undefined : "/",
    component: $RouterView,
    children: __DEV__
      ? Object.entries(import.meta.glob("../views/dev/**/*.tsx")).map(
          ([path, comp]) => ({
            //@ts-ignore
            path:
              path
                .split("/")
                .at(-1)
                ?.replace(/\.[jt]sx$/, "") || "",
            component: comp
          })
        )
      : []
  },
  {
    path: "/debug",
    component: AppLayout,
    meta: {
      title: "调试",
      icon: <i class="icon-[mingcute--bug-line]" />
    },
    children: Object.entries(import.meta.glob("../views/debug/**/*.tsx")).map(
      ([path, comp]) => {
        const _title = path.match(/debug\/(.*?)\/index\.tsx$/)![1];
        const title = _title[0].toUpperCase() + _title.slice(1);

        return {
          path: _title,
          component: comp,

          title,
          meta: {
            title,
            hideKbar: true,
            icon: <i class="icon-[mingcute--bug-line]" />
          }
        };
      }
    )
  },
  // v1 compatibility
  {
    path: "/page/:path(.*)*",
    name: "page$",
    redirect: (to) => {
      return to.fullPath.replace(/^\/page\//, "/pages/");
    }
  },
  {
    path: "/extra/:path(.*)*",
    name: "extra",
    redirect: (to) => {
      return to.fullPath.replace(/^\/extra/, "");
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    meta: { isPublic: true },
    redirect: "/"
  }
];

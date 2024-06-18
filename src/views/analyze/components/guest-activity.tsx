import { NButton, NTabPane, NTabs } from "naive-ui";
import { defineComponent, onBeforeMount, ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

import { IpInfoPopover } from "~/components/ip-info";
import { Table } from "~/components/table";
import { RelativeTime } from "~/components/time/relative-time";
import { useDataTableFetch } from "~/hooks/use-table";
import { RESTManager } from "~/utils";
import type { TableColumns } from "naive-ui/es/data-table/src/interface";
import type { ActivityReadDurationType } from "~/models/activity";
import type {
  NoteModel,
  PageModel,
  PaginateResult,
  PostModel,
  RecentlyModel
} from "@mx-space/api-client";

interface ActivityItem {
  id: string;
  created: string;
  payload: any;
  type: number;
}

enum ActivityType {
  Like,
  ReadDuration
}

type WithObjects<T> = {
  objects: {
    posts: PostModel[];
    notes: NoteModel[];
    pages: PageModel[];
    recentlies: RecentlyModel[];
  };
} & T;

type ObjectsCollection = {
  posts: Record<string, PostModel>;
  notes: Record<string, NoteModel>;
  pages: Record<string, PageModel>;
  recentlies: Record<string, RecentlyModel>;

  all: Record<string, PostModel | NoteModel | PageModel | RecentlyModel>;
};

const refObjectCollectionRef = shallowRef({
  posts: {},
  notes: {},
  pages: {},
  recentlies: {},

  all: {}
} as ObjectsCollection);

const mapDataToCollection = (
  type: keyof ObjectsCollection,
  data: WithObjects<{}>["objects"]
) => {
  const collection = refObjectCollectionRef.value[type];
  for (const list in data[type]) {
    const item = data[type][list];
    collection[item.id] = item;
    refObjectCollectionRef.value.all[item.id] = item;
  }
};

export const GuestActivity = defineComponent({
  setup() {
    const tabValue = ref(ActivityType.Like);

    const { data, pager, fetchDataFn } = useDataTableFetch(
      (list, pager) => async (page, size) => {
        RESTManager.api.activity
          .get<WithObjects<PaginateResult<ActivityItem>>>({
            params: { page, size, type: tabValue.value }
          })
          .then((res) => {
            list.value = res.data;
            pager.value = res.pagination;

            if (res.objects) {
              mapDataToCollection("posts", res.objects);
              mapDataToCollection("notes", res.objects);
              mapDataToCollection("pages", res.objects);
              mapDataToCollection("recentlies", res.objects);
            }
          });
      }
    );

    onBeforeMount(() => {
      fetchDataFn();
    });
    const route = useRoute();
    watch(
      () => route.query.page,
      async (n) => {
        await fetchDataFn(n ? +n : 1);
      }
    );

    const tabPanelMapping = {
      [ActivityType.Like]: LikeTableColumns,
      [ActivityType.ReadDuration]: ReadDurationTableColumns
    };

    return () => {
      return (
        <>
          <NTabs
            onUpdateValue={(value) => {
              tabValue.value = value;
              fetchDataFn();
            }}
            value={tabValue.value}
          >
            <NTabPane tab="点赞" name={ActivityType.Like}>
              <div />
            </NTabPane>
            <NTabPane tab="阅读记录" name={ActivityType.ReadDuration}>
              <div />
            </NTabPane>
          </NTabs>

          <Table
            data={data}
            pager={pager}
            onFetchData={fetchDataFn}
            columns={tabPanelMapping[tabValue.value]}
          />
        </>
      );
    };
  }
});

const baseColumns = [
  {
    title: "时间",
    key: "created",
    render: (row) => <RelativeTime time={row.created} />
  },
  {
    title: "IP",
    key: "payload.ip",
    render: (row) => (
      <IpInfoPopover
        ip={row.payload.ip}
        trigger="hover"
        triggerEl={<span>{row.payload.ip}</span>}
      />
    )
  }
];

const LikeTableColumns: TableColumns<{
  id: string;
  created: string;
  payload: any;
  type: number;
  ref?: NoteModel | PostModel;
}> = [
  {
    title: "类型",
    key: "type",
    render: () => <span>点赞</span>,
    width: 120
  },

  {
    title: "引用",
    key: "payload.ref",
    render: (row) => {
      if (!row.ref) return "已删除的内容";
      return (
        <NButton
          quaternary
          type="primary"
          size="tiny"
          onClick={() => {
            RESTManager.api
              .helper("url-builder")(row.payload.id)
              .get<{ data: string }>()
              .then(({ data: url }) => {
                window.open(url);
              });
          }}
        >
          {row.ref.title}
        </NButton>
      );
    },
    width: 350,
    ellipsis: {
      tooltip: true
    }
  },
  ...baseColumns
];

const ReadDurationTableColumns: TableColumns<ActivityReadDurationType> = [
  {
    title: "标识符",
    key: "displayName",
    render: (row) => (
      <span>{row.payload.displayName || row.payload.identity}</span>
    ),
    ellipsis: {
      tooltip: true
    },
    width: 120
  },
  {
    title: "引用",
    key: "payload.ref",
    render: (row) => {
      const ref = refObjectCollectionRef.value.all[row.refId];

      if (!ref) return "未知";

      return (
        <NButton
          quaternary
          type="primary"
          size="tiny"
          onClick={() => {
            RESTManager.api
              .helper("url-builder")(ref.id)
              .get<{ data: string }>()
              .then(({ data: url }) => {
                window.open(url);
              });
          }}
        >
          {(ref as any).title}
        </NButton>
      );
    },
    width: 350,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: "阅读时长",
    key: "payload.duration",
    width: 150,
    render: (row) => {
      const totalSeconds =
        (row.payload.operationTime - row.payload.connectedAt) / 1000;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      let timeString = "";
      if (hours > 0) {
        timeString += `${hours}小时 `;
      }
      if (hours > 0 || minutes > 0) {
        timeString += `${minutes}分钟 `;
      }
      timeString += `${seconds}秒`;

      return <span>{timeString}</span>;
    }
  },

  {
    title: "连接时间",
    key: "payload.connectedAt",
    render: (row) => <RelativeTime time={new Date(row.payload.connectedAt)} />
  },
  {
    title: "开始阅读时间",
    key: "payload.joinedAt",
    render: (row) =>
      !row.payload.joinedAt ? (
        "未记录"
      ) : (
        <RelativeTime time={new Date(row.payload.joinedAt)} />
      )
  },
  {
    title: "更新时间",
    key: "payload.updatedAt",
    render: (row) => <RelativeTime time={new Date(row.payload.updatedAt)} />
  },
  {
    title: "最后的位置",
    key: "payload.position"
  },
  ...baseColumns
];

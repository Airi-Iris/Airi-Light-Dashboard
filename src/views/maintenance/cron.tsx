import { format } from "date-fns";
import { NButton, NCard, NPopconfirm, NSpace } from "naive-ui";

import { Table } from "~/components/table";
import { useDataTableFetch } from "~/hooks/use-table";

import { RESTManager, toPascalCase } from "~/utils";

export default defineComponent({
  setup() {
    const { data, fetchDataFn, loading } = useDataTableFetch((dataRef) => {
      return async () => {
        const data = (await RESTManager.api.health.cron.get()) as any;
        dataRef.value = Array.from(
          Object.values(data.data).map((item: any) => ({
            ...item,
            _name: item.name,
            name: toPascalCase(item.name)
          }))
        );
      };
    });
    onMounted(async () => {
      await fetchDataFn();
    });
    const executeCron = async (name: string, niceName: string) => {
      await RESTManager.api.health.cron.run(name).post();
      // 开始轮询状态
      let timer: any = setTimeout(function polling() {
        RESTManager.api.health.cron
          .task(name)
          .get()
          .then((data: any) => {
            if (data.status === "fulfill") {
              message.success(`${niceName} 执行完成`);
              timer = clearTimeout(timer);
            } else if (data.status === "reject") {
              message.error(`${niceName} 执行失败，${data.message}`);
              timer = clearTimeout(timer);
            } else {
              timer = setTimeout(polling, 1000);
            }
          });
      }, 1000);
    };
    return () => (
      <div class="relative -mt-12 flex w-full grow flex-col">
        <div class="mt-[5rem] p-12 pt-[6px]">
          <NCard
            class={"rounded-md border border-solid border-border"}
            content-style="padding: 0;"
          >
            {{
              header() {
                return (
                  <>
                    <div class={"flex flex-col mb-4 select-none"}>
                      <h1 class={"flex items-center text-[1.73rem]"}>任务</h1>
                      <h2 class={"opacity-80 text-sm inline-flex"}>
                        维护 · 任务
                      </h2>
                    </div>
                  </>
                );
              },
              default() {
                return (
                  <>
                    <Table
                      noPagination
                      data={data}
                      loading={loading.value}
                      nTableProps={{
                        maxHeight: "calc(100vh - 17rem)"
                      }}
                      maxWidth={500}
                      columns={[
                        {
                          title: "任务",
                          key: "name",
                          ellipsis: { tooltip: true },
                          width: 150
                        },
                        {
                          title: "描述",
                          key: "description",
                          width: 250,
                          ellipsis: { tooltip: true }
                        },
                        { title: "状态", key: "status" },
                        {
                          title: "下次执行",
                          key: "",
                          render(row) {
                            const nextDate: any = row.nextDate;
                            if (!nextDate) {
                              return "N/A";
                            }
                            return format(
                              new Date(nextDate),
                              "MM/dd/yyyy hh:mm:ss"
                            );
                          }
                        },
                        {
                          title: "操作",
                          key: "",
                          render(row) {
                            return (
                              <NSpace>
                                <NPopconfirm
                                  onPositiveClick={() =>
                                    void executeCron(row._name, row.name)
                                  }
                                >
                                  {{
                                    trigger() {
                                      return (
                                        <NButton
                                          size="tiny"
                                          quaternary
                                          type="primary"
                                        >
                                          执行
                                        </NButton>
                                      );
                                    },
                                    default: () => (
                                      <span class="max-w-48">确定要执行？</span>
                                    )
                                  }}
                                </NPopconfirm>
                              </NSpace>
                            );
                          }
                        }
                      ]}
                    />
                  </>
                );
              }
            }}
          </NCard>
        </div>
      </div>
    );
  }
});

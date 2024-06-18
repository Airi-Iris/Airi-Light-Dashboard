import { IpInfoPopover } from "~/components/ip-info";
import { isEmpty } from "lodash-es";
import {
  NAlert,
  NButton,
  NCard,
  NDataTable,
  NP,
  NSkeleton,
  NSpace,
  NTabPane,
  NTabs,
  useDialog
} from "naive-ui";
import { RESTManager } from "~/utils";
import {
  defineComponent,
  onBeforeMount,
  onMounted,
  ref,
  toRaw,
  watch
} from "vue";

import { Chart } from "@antv/g2/esm";

import { AnalyzeDataTable } from "./components/analyze-data-table";
import { GuestActivity } from "./components/guest-activity";
import { ReadingRank } from "./components/reading-rank";
import type { IPAggregate, Month, Path, Today, Total, Week } from "./types";

const SectionTitle = defineComponent((_, { slots }) => () => (
  <div class="my-[12px] font-semibold text-gray-400 ">{slots.default?.()}</div>
));
export default defineComponent({
  setup() {
    // graph
    const count = ref({} as Total);
    const todayIp = ref<string[]>();
    const graphData = ref(
      {} as {
        day: Today[];
        week: Week[];
        month: Month[];
      }
    );
    const topPaths = ref([] as Path[]);
    onBeforeMount(async () => {
      const data =
        (await RESTManager.api.analyze.aggregate.get()) as IPAggregate;
      count.value = data.total;
      todayIp.value = data.todayIps;
      graphData.value = {
        day: data.today,
        week: data.weeks,
        month: data.months
      };
      topPaths.value = [...data.paths];
      console.log(data);
    });

    const Graph = defineComponent(() => {
      const dayChart = ref<HTMLDivElement>();
      const weekChart = ref<HTMLDivElement>();
      const monthChart = ref<HTMLDivElement>();
      const visitorChart = ref<HTMLDivElement>();
      const pieChart = ref<HTMLDivElement>();
      const charts: Record<string, Chart | null> = {
        day: null,
        week: null,
        month: null
      };

      function renderChart(
        element: HTMLElement | undefined,
        field: "day" | "week" | "month",
        data: any,
        label: [string, string, string]
      ) {
        if (!element) {
          return;
        }
        const chart = new Chart({
          container: element,
          autoFit: true,
          height: 250,
          padding: [30, 20, 70, 40]
        });
        charts[field] = chart;

        chart.data(data);
        chart.tooltip({
          showCrosshairs: true,
          shared: true
        });
        chart.scale({
          [label[0]]: {
            range: [0, 1]
          },
          [label[2]]: {
            min: 0,
            nice: true
          }
        });
        chart
          .line()
          .position(`${label[0]}*${label[2]}`)
          .label(label[2])
          .color(label[1])
          .shape("smooth");
        chart
          .point()
          .position(`${label[0]}*${label[2]}`)
          .label(label[2])
          .color(label[1])
          .shape("circle");

        chart.render();
      }

      const renderAllChart = () => {
        renderChart(dayChart.value, "day", graphData.value.day, [
          "hour",
          "key",
          "value"
        ]);

        renderChart(weekChart.value, "week", graphData.value.week, [
          "day",
          "key",
          "value"
        ]);

        renderChart(monthChart.value, "month", graphData.value.month, [
          "date",
          "key",
          "value"
        ]);

        if (pieChart.value) {
          renderPie(pieChart.value);
        }
      };
      onMounted(() => {
        if (!isEmpty(toRaw(graphData.value))) {
          renderAllChart();
        }
      });

      const watcher = watch(
        () => graphData,
        (n, old) => {
          if (!isEmpty(toRaw(graphData.value))) {
            renderAllChart();

            watcher();
          }
        },
        { deep: true }
      );

      function renderPie(el: HTMLElement) {
        const pieData = topPaths.value.slice(0, 10);
        const total = pieData.reduce((prev, { count }) => count + prev, 0);

        const data = pieData.map((paths) => {
          return {
            item: decodeURI(paths.path),
            count: paths.count,
            percent: paths.count / total
          };
        });

        const chart = new Chart({
          container: el,
          autoFit: true,
          height: 250
        });

        chart.coordinate("theta", {
          radius: 0.75
        });

        chart.data(data);

        chart.tooltip({
          showTitle: false,
          showMarkers: false
        });
        chart.legend(false);
        chart
          .interval()
          .position("count")
          .color("item")
          .label("percent", {
            content: (data) => {
              return `${data.item}: ${(data.percent * 100).toFixed(2)}%`;
            }
          })
          .adjust("stack");

        chart.render();
      }
      return () => (
        <div class="phone:grid-cols-1 grid grid-cols-2 gap-4">
          <div
            class={
              "bg-white dark:bg-[#181b1f] border border-solid border-zinc-400/40 dark:border-[rgba(204,204,220,0.12)] rounded-md transition duration-200"
            }
          >
            <section class={"p-4"}>
              <SectionTitle>今日请求走势</SectionTitle>
              <div ref={dayChart} />
              {isEmpty(graphData.value) && <NSkeleton animated height={250} />}
            </section>
          </div>
          <div
            class={
              "bg-white dark:bg-[#181b1f] border border-solid border-zinc-400/40 dark:border-[rgba(204,204,220,0.12)] rounded-md transition duration-200"
            }
          >
            <section class={"p-4"}>
              <SectionTitle>本周请求走势</SectionTitle>
              <div ref={weekChart} />
              {isEmpty(graphData.value) && <NSkeleton animated height={250} />}
            </section>
          </div>
          <div
            class={
              "bg-white dark:bg-[#181b1f] border border-solid border-zinc-400/40 dark:border-[rgba(204,204,220,0.12)] rounded-md transition duration-200"
            }
          >
            <section class={"p-4"}>
              <SectionTitle>本月请求走势</SectionTitle>
              <div ref={monthChart} />
              {isEmpty(graphData.value) && <NSkeleton animated height={250} />}
            </section>
          </div>
          <div
            class={
              "bg-white dark:bg-[#181b1f] border border-solid border-zinc-400/40 dark:border-[rgba(204,204,220,0.12)] rounded-md transition duration-200"
            }
          >
            <section class={"p-4"}>
              <SectionTitle>最近 7 天请求路径 Top 10</SectionTitle>
              <NAlert type="info" title="当前不可用" bordered={false} />
              <div ref={visitorChart} />
              {isEmpty(graphData.value) && <NSkeleton animated height={250} />}
            </section>
          </div>
        </div>
      );
    });

    const modal = useDialog();

    return () => (
      <>
        <div class="relative -mt-12 flex w-full grow flex-col">
          <div
            dir="ltr"
            data-orientation="horizontal"
            class="flex flex-row sticky top-16 z-[1] -ml-4 h-[42px] -mt-8 w-[calc(100%+2rem)] bg-white/80 backdrop-blur dark:bg-zinc-900/80 border-b-[0.5px] border-zinc-200 dark:border-neutral-900"
          >
            <h1 class={"w-[70px] center flex mr-4 ml-4 font-bold text-[16px]"}>
              数据统计
            </h1>
          </div>
          <div class="p-8 mt-16 pt-0">
            <Graph />
            <NP>
              <SectionTitle>
                <span>
                  总请求量中：PV {count.value.callTime} UV {count.value.uv}
                </span>
              </SectionTitle>
            </NP>

            <NCard class={"rounded-md"}>
              <NTabs>
                <NTabPane name={"IP 记录"}>
                  {!todayIp.value ? (
                    <NSkeleton animated class="my-2 h-[200px]" />
                  ) : (
                    <NP>
                      <SectionTitle>
                        <span>
                          今天 - 所有请求的 IP {todayIp.value.length} 个
                        </span>
                      </SectionTitle>

                      <div>
                        <NSpace>
                          {todayIp.value.slice(0, 100).map((ip) => (
                            <IpInfoPopover
                              ip={ip}
                              key={ip}
                              triggerEl={
                                <NButton
                                  size="tiny"
                                  class="!flex !py-[15px]"
                                  round
                                  type="primary"
                                  ghost
                                >
                                  {ip}
                                </NButton>
                              }
                            />
                          ))}
                        </NSpace>
                        {todayIp.value.length > 100 && (
                          <div class={"mt-6 flex justify-center"}>
                            <NButton
                              round
                              onClick={() => {
                                modal.create({
                                  title: "今天所有请求的 IP",
                                  content: () => (
                                    <NDataTable
                                      virtualScroll
                                      maxHeight={300}
                                      data={todayIp.value?.map((i) => ({
                                        ip: i
                                      }))}
                                      columns={[
                                        {
                                          title: "IP",
                                          key: "ip",
                                          render(rowData) {
                                            const ip = rowData.ip;
                                            return (
                                              <IpInfoPopover
                                                ip={ip}
                                                triggerEl={
                                                  <NButton
                                                    size="tiny"
                                                    class="!flex !py-[15px]"
                                                    round
                                                    type="primary"
                                                    ghost
                                                  >
                                                    {ip}
                                                  </NButton>
                                                }
                                              />
                                            );
                                          }
                                        }
                                      ]}
                                    />
                                  )
                                });
                              }}
                            >
                              查看更多
                            </NButton>
                          </div>
                        )}
                      </div>
                    </NP>
                  )}
                </NTabPane>

                <NTabPane name={"访问路径"}>
                  <AnalyzeDataTable />
                </NTabPane>

                <NTabPane name="访客活动">
                  <GuestActivity />
                </NTabPane>

                <NTabPane name="阅读排名">
                  <ReadingRank />
                </NTabPane>
              </NTabs>
            </NCard>
          </div>
        </div>
      </>
    );
  }
});

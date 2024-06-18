import {
  NButton,
  NCard,
  NList,
  NListItem,
  NModal,
  NSelect,
  NSpin
} from "naive-ui";

import { Xterm } from "~/components/xterm";
import { RESTManager } from "~/utils";

export const LogListView = defineComponent({
  setup() {
    const data = ref<any[]>([]);
    const loading = ref(false);
    const fetchDataFn = async () => {
      loading.value = true;
      const { data: data$ } = await RESTManager.api.health.log
        .list(logType.value)
        .get<any>();

      data.value = data$;
      loading.value = false;
    };

    onMounted(() => {
      fetchDataFn();
    });
    const logData = ref("");
    const showLog = ref(false);

    const logType = ref<"native" | "pm2">("native");

    return () => (
      <Fragment>
        <NModal
          transformOrigin="center"
          show={showLog.value}
          onUpdateShow={(s) => void (showLog.value = s)}
        >
          <NCard
            title="查看日志"
            class="modal-card !bg-dark-400 !all:text-white !w-[100rem] !text-white"
            bordered={false}
            closable
            onClose={() => {
              showLog.value = false;
            }}
          >
            <LogDisplay data={logData.value} />
          </NCard>
        </NModal>

        <NSpin show={loading.value}>
          <NList class="min-h-[300px] bg-transparent">
            {{
              header() {
                return (
                  <NSelect
                    class="ml-auto w-32"
                    value={logType.value}
                    onUpdateValue={(v) => {
                      logType.value = v;
                      fetchDataFn();
                    }}
                    options={[
                      { label: "PM2", value: "pm2" },
                      { label: "系统记录", value: "native" }
                    ]}
                  />
                );
              },
              default() {
                return data.value.map((item) => {
                  return (
                    <NListItem key={item.filename}>
                      {{
                        default() {
                          return (
                            <div class="flex flex-col">
                              <span>{item.filename}</span>
                              <span class="grid grid-cols-[5rem,auto] text-sm text-gray-400 dark:text-gray-600">
                                <span>{item.size}</span>

                                <span>类型：{item.type}</span>
                              </span>
                            </div>
                          );
                        },
                        suffix() {
                          return (
                            <div class="flex space-x-2">
                              <NButton
                                ghost
                                type="primary"
                                onClick={() => {
                                  RESTManager.api.health
                                    .log(logType.value)
                                    .get({
                                      params: {
                                        filename: item.filename
                                      }
                                    })
                                    .then((text: any) => {
                                      logData.value = text;
                                      showLog.value = true;
                                    });
                                }}
                              >
                                查看
                              </NButton>
                              <NButton
                                ghost
                                type="error"
                                onClick={() => {
                                  RESTManager.api.health
                                    .log(logType.value)
                                    .delete({
                                      params: {
                                        filename: item.filename
                                      }
                                    })
                                    .then(() => {
                                      data.value.splice(
                                        data.value.findIndex(
                                          (i) => i.filename === item.filename
                                        ),
                                        1
                                      );
                                    });
                                }}
                              >
                                删除
                              </NButton>
                            </div>
                          );
                        }
                      }}
                    </NListItem>
                  );
                });
              }
            }}
          </NList>
        </NSpin>
      </Fragment>
    );
  }
});

const LogDisplay = defineComponent({
  props: {
    data: {
      type: String,
      default: ""
    }
  },
  setup(props) {
    const wait = ref(true);

    onMounted(() => {
      setTimeout(() => {
        wait.value = false;
      }, 1000);
    });
    return () => (
      <div class="relative flex h-[600px] max-h-[70vh] overflow-auto">
        {wait.value ? (
          <div class="flex h-full w-full items-center justify-center">
            <NSpin show strokeWidth={14} />
          </div>
        ) : (
          <Xterm
            class="w-full flex-grow"
            onReady={(term) => {
              term.write(props.data);
            }}
          />
        )}
      </div>
    );
  }
});

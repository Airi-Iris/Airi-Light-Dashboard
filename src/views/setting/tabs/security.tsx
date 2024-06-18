import { If } from "~/components/directives/if";
import { IpInfoPopover } from "~/components/ip-info";
import { RelativeTime } from "~/components/time/relative-time";
import { useStoreRef } from "~/hooks/use-store-ref";
import {
  NButton,
  NCard,
  NCol,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NLayoutContent,
  NList,
  NListItem,
  NModal,
  NP,
  NPopconfirm,
  NRow,
  NSpace,
  NSwitch,
  NTag,
  NText
} from "naive-ui";
import { RouteName } from "~/router/name";
import { UIStore } from "~/stores/ui";
import useSWRV from "swrv";
import { RESTManager, parseDate, removeToken } from "~/utils";
import { defineComponent, onBeforeMount, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { AuthnUtils } from "~/utils/authn";
import { autosizeableProps } from "./system";
import type { AuthnModel } from "~/models/authn";
import type { TokenModel } from "~/models/token";
import type { DialogReactive } from "naive-ui";
import styles from "./user.module.css";
import { SettingDivider } from "./user";
import { HeaderActionButtonWithDesc } from "~/components/button/rounded-button";
import { clsxm } from "~/utils/helper";

type Session = {
  id: string;
  ua?: string;
  ip?: string;
  date: string;
  current?: boolean;
};
export const TabSecurity = defineComponent(() => {
  const session = ref<Session[]>([]);
  const fetchSession = async () => {
    const res = await RESTManager.api.user.session.get<{ data: Session[] }>({});
    session.value = [...res.data];
  };
  onMounted(() => {
    fetchSession();
  });
  const handleKick = async (current: boolean, id?: string) => {
    if (current) {
      await RESTManager.api.user.logout.post<{}>({});

      removeToken();
      window.location.reload();
    } else {
      await RESTManager.api.user.session(id).delete<{}>({});
      session.value = session.value.filter((item) => item.id !== id);
    }
  };
  const handleKickAll = async () => {
    await RESTManager.api.user.session.all.delete<{}>({});

    await fetchSession();
  };
  const uiStore = useStoreRef(UIStore);
  const isMobile = uiStore.viewport.value.mobile;

  if (isMobile) {
    return () => (
      <div class={"flex center h-[calc(100vh-14rem)] text-center"}>
        <strong>此页面移动端暂未适配，请到桌面端查看</strong>
      </div>
    );
  }
  return () => (
    <Fragment>
      <div class={["flex flex-col w-full justify-center", styles["settings"]]}>
        <TowFactorAuthentication />
        <SettingDivider />

        <ResetPass />

        <ApiToken />

        <NRow class="justify-center mb-4 pt-4">
          <NCol span="24">
            <hr />
          </NCol>
        </NRow>

        <Passkey />

        <NRow class="justify-center mb-4 pt-4">
          <NCol span="24">
            <hr />
          </NCol>
        </NRow>
      </div>
      <div class={"flex flex-col my-4"}>
        <div class={"flex flex-row items-center justify-between px-16"}>
          <h1 class={"text-2xl font-bold felx flex-row"}>
            登录设备
            <small class={"text-base font-normal ml-8"}>
              查看已经登录的设备
            </small>
          </h1>
          <NPopconfirm onPositiveClick={handleKickAll}>
            {{
              trigger() {
                return (
                  <HeaderActionButtonWithDesc
                    icon={<i class="icon-[mingcute--alert-line] size-[16px]" />}
                    class="rounded-lg text-[#d03050]"
                    variant="secondary"
                    description="全部下线"
                    disabled={
                      session.value.length == 1 && session.value[0].current
                    }
                  />
                );
              },
              default() {
                return "确定踢掉全部登录设备（除当前会话）？";
              }
            }}
          </NPopconfirm>
        </div>
        <NLayoutContent class="!overflow-visible px-16 mt-4">
          <NList bordered class={"item_prefix"}>
            {session.value.map(({ id, ua, ip, date, current }) => (
              <NListItem key={id}>
                {{
                  prefix() {
                    return current ? (
                      <NTag
                        type="success"
                        size="small"
                        strong
                        class={"rounded-lg"}
                      >
                        当前
                      </NTag>
                    ) : (
                      <div class={"w-[38px]"}></div>
                    );
                  },
                  suffix() {
                    return (
                      <NPopconfirm
                        onPositiveClick={() => handleKick(!!current, id)}
                      >
                        {{
                          trigger() {
                            return (
                              <HeaderActionButtonWithDesc
                                icon={
                                  current ? (
                                    <i class="icon-[mingcute--exit-line] size-[16px]" />
                                  ) : (
                                    <i class="icon-[mingcute--close-line] size-[16px]" />
                                  )
                                }
                                class={clsxm(
                                  "rounded-lg text-[#d03050]",
                                  current ? "w-[70px]" : ""
                                )}
                                variant="secondary"
                                description={current ? "注销" : "踢"}
                                disabled={
                                  session.value.length == 1 &&
                                  session.value[0].current
                                }
                              />
                            );
                          },
                          default() {
                            return current ? "登出？" : "确定要踢出吗？";
                          }
                        }}
                      </NPopconfirm>
                    );
                  },
                  default() {
                    return (
                      <NSpace vertical>
                        <If condition={!!ua}>
                          <NP>User Agent: {ua}</NP>
                        </If>

                        <If condition={!!ip}>
                          <NP>
                            IP:{" "}
                            <IpInfoPopover
                              ip={ip!}
                              triggerEl={
                                <NButton quaternary size="tiny" type="primary">
                                  {ip}
                                </NButton>
                              }
                            ></IpInfoPopover>
                          </NP>
                        </If>

                        <NP>
                          {current ? "活跃时间" : "登录时间"}:{" "}
                          <RelativeTime time={date} />
                        </NP>
                      </NSpace>
                    );
                  }
                }}
              </NListItem>
            ))}
          </NList>
        </NLayoutContent>
      </div>

      <div class="pt-4"></div>
    </Fragment>
  );
});

const ResetPass = defineComponent(() => {
  const resetPassword = reactive({
    password: "",
    reenteredPassword: ""
  });
  const formRef = ref<typeof NForm>();
  const router = useRouter();
  const reset = async () => {
    if (!formRef.value) {
      return;
    }

    formRef.value.validate(async (err) => {
      if (!err) {
        await RESTManager.api.master.patch({
          data: {
            password: resetPassword.password
          }
        });
        message.success("更改成功");
        removeToken();
        router.push({ name: RouteName.Login });
      } else {
        console.log(err);
      }
    });
  };

  function validatePasswordSame(rule, value) {
    console.log(rule);

    return value === resetPassword.password;
  }
  const uiStore = useStoreRef(UIStore);

  return () => (
    <>
      <NRow class="justify-center !my-2">
        <NCol span="6">
          <h4 class="mt-0 text-2xl font-semibold">密码</h4>
          <p>
            密码更新成功后，您将被重定向到登录页面，
            <br />
            您可以使用新密码重新登录。
          </p>
        </NCol>
        <NCol span="6">
          <h5 class="mt-0 mb-10px font-semibold leading-normal text-base mb-4">
            更改您的密码或重设当前密码
          </h5>
          <NForm
            ref={formRef}
            model={resetPassword}
            rules={{
              password: [
                {
                  required: true,
                  message: "请输入密码"
                }
              ],
              reenteredPassword: [
                {
                  required: true,
                  message: "请再次输入密码",
                  trigger: ["input", "blur"]
                },
                {
                  validator: validatePasswordSame,
                  message: "两次密码输入不一致",
                  trigger: ["blur", "password-input"]
                }
              ]
            }}
          >
            <NFormItem label="新密码" required path="password">
              <NInput
                class={"rounded-lg"}
                {...autosizeableProps}
                value={resetPassword.password}
                onInput={(e) => void (resetPassword.password = e)}
                type="password"
              />
            </NFormItem>
            <NFormItem label="重复密码" required path="reenteredPassword">
              <NInput
                class={"rounded-lg"}
                {...autosizeableProps}
                value={resetPassword.reenteredPassword}
                onInput={(e) => void (resetPassword.reenteredPassword = e)}
                type="password"
              />
            </NFormItem>
          </NForm>
          <div class="quaternary-right w-full flex items-center justify-end">
            <NButton
              onClick={reset}
              type="primary"
              color="#0960bd"
              class={"dark:text-[#f0f8ff] !h-[31px] rounded-md"}
              themeOverrides={{
                textColorHoverPrimary: "#f0f8ff"
              }}
            >
              保存
            </NButton>
          </div>
        </NCol>
      </NRow>
      <NRow class="justify-center !my-4">
        <NCol span="24">
          <hr />
        </NCol>
      </NRow>
    </>
  );
});

const ApiToken = defineComponent(() => {
  const tokens = ref([] as TokenModel[]);

  const defaultModel = () => ({
    name: "",
    expired: false,
    expiredTime: new Date()
  });
  const dataModel = reactive(defaultModel());
  const fetchToken = async () => {
    const { data } = (await RESTManager.api.passkey.items.get()) as any;
    tokens.value = data;
  };

  onBeforeMount(() => {
    fetchToken();
  });
  const newTokenDialogShow = ref(false);
  const newToken = async () => {
    const payload = {
      name: dataModel.name,
      expired: dataModel.expired
        ? dataModel.expiredTime.toISOString()
        : undefined
    };

    const response = (await RESTManager.api.auth.token.post({
      data: payload
    })) as TokenModel;

    await navigator.clipboard.writeText(response.token);

    newTokenDialogShow.value = false;
    const n = defaultModel();
    for (const key in n) {
      dataModel[key] = n[key];
    }
    message.success(`生成成功，Token 已复制，${response.token}`);
    await fetchToken();
    // Backend bug.
    const index = tokens.value.findIndex((i) => i.name === payload.name);
    if (index !== -1) {
      tokens.value[index].token = response.token;
    }
  };

  const onDeleteToken = async (id) => {
    await RESTManager.api.auth.token.delete({ params: { id } });
    message.success("删除成功");
    const index = tokens.value.findIndex((i) => i.id === id);
    if (index != -1) {
      tokens.value.splice(index, 1);
    }
  };
  const uiStore = useStoreRef(UIStore);

  return () => (
    <div class={"flex flex-col my-4"}>
      <div class={"flex flex-row items-center justify-between px-16"}>
        <h1 class={"text-2xl font-bold felx flex-row"}>
          ApiToken
          <small class={"text-base font-normal ml-8"}>
            管理已经创建的ApiToken
          </small>
        </h1>
        <HeaderActionButtonWithDesc
          icon={<i class="icon-[mingcute--hashtag-line] size-[16px]" />}
          class="rounded-lg"
          variant="secondary"
          description="新增"
          onClick={() => {
            newTokenDialogShow.value = true;
          }}
        />
      </div>
      <NLayoutContent class="!overflow-visible px-16 mt-2">
        <NModal
          transformOrigin="center"
          show={newTokenDialogShow.value}
          onUpdateShow={(e) => void (newTokenDialogShow.value = e)}
        >
          <NCard
            bordered={false}
            title="创建 Token"
            class="w-[500px] max-w-full"
          >
            <NForm>
              <NFormItem label="名称" required>
                <NInput
                  value={dataModel.name}
                  onInput={(e) => void (dataModel.name = e)}
                ></NInput>
              </NFormItem>

              <NFormItem label="是否过期">
                <NSwitch
                  value={dataModel.expired}
                  onUpdateValue={(e) => void (dataModel.expired = e)}
                ></NSwitch>
              </NFormItem>

              <NFormItem label="过期时间">
                <NDatePicker
                  disabled={!dataModel.expired}
                  // @ts-expect-error
                  value={dataModel.expiredTime}
                  type="datetime"
                  onUpdateValue={(e) =>
                    void (dataModel.expiredTime = new Date(e))
                  }
                ></NDatePicker>
              </NFormItem>
            </NForm>
            <NSpace>
              <NButton
                round
                onClick={() => void (newTokenDialogShow.value = false)}
              >
                取消
              </NButton>
              <NButton round type="primary" onClick={newToken}>
                确定
              </NButton>
            </NSpace>
          </NCard>
        </NModal>

        <NDataTable
          class={"mt-2"}
          bordered
          scrollX={Math.max(
            800,
            uiStore.contentWidth.value - uiStore.contentInsetWidth.value
          )}
          remote
          data={tokens.value}
          columns={[
            { key: "name", title: "名称" },
            {
              key: "token",
              title: "Token",
              render({ token }) {
                return token ?? "*".repeat(40);
              }
            },
            {
              title: "创建时间",
              key: "created",
              render({ created }) {
                return <RelativeTime time={created} />;
              }
            },
            {
              title: "过期时间",
              key: "expired",
              render({ expired }) {
                return parseDate(expired, "yyyy 年 M 月 d 日 HH:mm:ss");
              }
            },
            {
              title: "操作",
              key: "id",
              render({ id, name }) {
                return (
                  <NSpace>
                    <NPopconfirm
                      positiveText={"取消"}
                      negativeText="删除"
                      onNegativeClick={() => {
                        onDeleteToken(id);
                      }}
                    >
                      {{
                        trigger: () => (
                          <NButton quaternary type="error">
                            删除
                          </NButton>
                        ),

                        default: () => (
                          <span class="max-w-48">
                            确定要删除 Token "{name}"?
                          </span>
                        )
                      }}
                    </NPopconfirm>
                  </NSpace>
                );
              }
            }
          ]}
        />
      </NLayoutContent>
    </div>
  );
});

const Passkey = defineComponent(() => {
  const uiStore = useStoreRef(UIStore);
  const { data: passkeys, mutate: refetchTable } = useSWRV(
    "passkey-table",
    () => {
      return RESTManager.api.passkey.items.get<AuthnModel[]>();
    }
  );

  const onDeleteToken = (id: string) => {
    RESTManager.api.passkey
      .items(id)
      .delete<{}>()
      .then(() => {
        refetchTable();
      });
  };

  const NewModalContent = defineComponent(
    (props: { dialog: DialogReactive }) => {
      const name = ref("");
      const handleCreate = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        AuthnUtils.createPassKey(name.value).then(() => {
          refetchTable();
          props.dialog.destroy();
        });
      };
      return () => (
        <NForm onSubmit={handleCreate}>
          <NFormItem label="名称" required>
            <NInput
              value={name.value}
              onUpdateValue={(e) => {
                name.value = e;
              }}
            />
          </NFormItem>
          <div class={"flex justify-end"}>
            <NButton
              class={"rounded-lg"}
              disabled={name.value.length === 0}
              type="primary"
              onClick={handleCreate}
              size="small"
            >
              创建
            </NButton>
          </div>
        </NForm>
      );
    }
  );

  const { data: setting, mutate: refetchSetting } = useSWRV(
    "current-disable-status",
    async () => {
      const { data } = await RESTManager.api.options("authSecurity").get<{
        data: { disablePasswordLogin: boolean };
      }>();
      return data;
    }
  );

  const updateSetting = (value: boolean) => {
    RESTManager.api
      .options("authSecurity")
      .patch({
        data: {
          disablePasswordLogin: value
        }
      })
      .then(() => {
        refetchSetting();
      });
  };

  // @ts-ignore
  NewModalContent.props = ["dialog"];

  return () => (
    <div class={"flex flex-col my-4"}>
      <div class={"flex flex-row items-center justify-between px-16 mt-4"}>
        <h1 class={"text-2xl font-bold felx flex-row"}>
          Passkey
          <small class={"text-base font-normal ml-8"}>
            管理通行密钥（数字认证凭证如FaceID，Windows Hello等）
          </small>
        </h1>
        <div class={"flex gap-2"}>
          <HeaderActionButtonWithDesc
            icon={<i class="icon-[mingcute--certificate-line] size-[16px]" />}
            class="rounded-lg"
            variant="secondary"
            description="验证"
            onClick={() => {
              AuthnUtils.validate(true);
            }}
          />
          <HeaderActionButtonWithDesc
            icon={<i class="icon-[mingcute--hashtag-line] size-[16px]" />}
            class="rounded-lg"
            variant="primary"
            description="创建"
            onClick={() => {
              const $dialog = dialog.create({
                title: "创建 Passkey",
                content: () => <NewModalContent dialog={$dialog} />
              });
            }}
          />
        </div>
      </div>
      <NLayoutContent class="!overflow-visible px-16 mt-2">
        <NForm labelAlign="left" labelPlacement="left">
          <NFormItem label="禁止密码登入">
            <NSwitch
              value={setting.value?.disablePasswordLogin}
              onUpdateValue={(v) => {
                if (!passkeys.value?.length) {
                  message.error("至少需要一个 Passkey 才能开启这个功能");
                }
                updateSetting(v);
              }}
            />
          </NFormItem>
          <div class={"mt-[-1.5rem]"}>
            <NText class="text-xs" depth={3}>
              <span>
                禁用密码登录需要至少开启 Clerk 或者 PassKey 登录的一项
              </span>
            </NText>
          </div>
        </NForm>
        <NDataTable
          class={"mt-2"}
          scrollX={Math.max(
            800,
            uiStore.contentWidth.value - uiStore.contentInsetWidth.value
          )}
          remote
          bordered
          data={passkeys.value}
          columns={[
            { key: "name", title: "名称" },

            {
              title: "创建时间",
              key: "created",
              render({ created }) {
                return <RelativeTime time={created} />;
              }
            },

            {
              title: "操作",
              key: "id",
              render({ id, name }) {
                return (
                  <NSpace>
                    <NPopconfirm
                      positiveText={"取消"}
                      negativeText="删除"
                      onNegativeClick={() => {
                        onDeleteToken(id);
                      }}
                    >
                      {{
                        trigger: () => (
                          <NButton quaternary type="error">
                            删除
                          </NButton>
                        ),

                        default: () => (
                          <span class="max-w-48">
                            确定要删除 Passkey "{name}"?
                          </span>
                        )
                      }}
                    </NPopconfirm>
                  </NSpace>
                );
              }
            }
          ]}
        />
      </NLayoutContent>
    </div>
  );
});

//TODO: 2FA
const TowFactorAuthentication = defineComponent(() => {
  return () => (
    <NRow class="justify-center !my-4">
      <NCol span="6">
        <h4 class="mt-0 text-2xl font-semibold">双重身份验证</h4>
        <p>启用双重身份认证（2FA），提高帐户安全性</p>
      </NCol>
      <NCol span="6">
        <h6 class="mt-0 text-lg text-orange-500 ">状态: 敬请期待</h6>
        <p class={"text-sm"}>此功能为实验性功能，正在开发中。</p>
        <small class="text-muted">实验性功能</small>
      </NCol>
    </NRow>
  );
});

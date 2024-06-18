import { socialKeyMap } from "~/constants/social";
import Avatar from "~/components/avatar";
import { IpInfoPopover } from "~/components/ip-info";
import { KVEditor } from "~/components/kv-editor";
import { RelativeTime } from "~/components/time/relative-time";
import { UploadWrapper } from "~/components/upload";
import { cloneDeep, isEmpty } from "lodash-es";
import {
  NButton,
  NCol,
  NForm,
  NFormItem,
  NGi,
  NGrid,
  NInput,
  NRow,
  NSpace,
  NText,
  NUploadDragger,
  useMessage
} from "naive-ui";
import { RESTManager, deepDiff } from "~/utils";
import { computed, defineComponent, onMounted, ref } from "vue";
import styles from "./user.module.css";
import type { UserModel } from "~/models/user";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";

export const TabUser = defineComponent(() => {
  const data = ref({} as UserModel);
  let origin: UserModel;

  async function fetchMaster() {
    const response = (await RESTManager.api.master.get()) as UserModel;
    data.value = response;

    origin = { ...response };
  }

  onMounted(async () => {
    await fetchMaster();
  });
  const message = useMessage();
  const diff = computed(() => deepDiff(origin, data.value));

  const handleSave = async () => {
    const submitData = cloneDeep(unref(diff));
    // 数组合并
    if (submitData.socialIds) {
      submitData.socialIds = data.value.socialIds;
    }

    await RESTManager.api.master.patch({
      data: submitData
    });
    message.success("保存成功~");
    await fetchMaster();
    location.reload();
  };

  const defaultAvatar = "https://kanodayo.com/assets/avatar.png";

  const uiStore = useStoreRef(UIStore);
  const isMobile = uiStore.viewport.value.mobile;

  return () =>
    !isMobile ? (
      <Fragment>
        <div
          class={["flex flex-col w-full justify-center", styles["settings"]]}
        >
          <NForm>
            <NRow class="justify-center !my-4">
              <NCol span="6">
                <h4 class="text-2xl font-semibold">个人头像</h4>
                <p>
                  您可以在这里修改头像或删除当前头像，
                  <br />
                  并恢复为默认值。
                </p>
              </NCol>
              <NCol span="6">
                <NRow>
                  <NCol span="6" class={"flex center"}>
                    <UploadWrapper
                      class={"w-[150px] h-[104px]"}
                      type="avatar"
                      onFinish={(ev) => {
                        const { file, event } = ev;
                        try {
                          const res = JSON.parse(
                            (event?.target as XMLHttpRequest).responseText
                          );
                          data.value.avatar = res.url;
                        } catch {}
                        return file;
                      }}
                    >
                      <NUploadDragger
                        class={
                          "border-0 hover:border-0 p-0 items-center justify-start flex bg-transparent"
                        }
                      >
                        <Avatar
                          class="flex border border-solid border-[#f0f0f0]"
                          src={data.value.avatar || defaultAvatar}
                          size={96}
                        />
                      </NUploadDragger>
                    </UploadWrapper>
                  </NCol>
                  <NCol span="18">
                    <h5 class="mt-0 mb-10px font-semibold leading-normal text-lg">
                      上传新头像
                    </h5>
                    <div class="flex items-center my-3">
                      <UploadWrapper
                        type="avatar"
                        onFinish={(ev) => {
                          const { file, event } = ev;
                          try {
                            const res = JSON.parse(
                              (event?.target as XMLHttpRequest).responseText
                            );
                            data.value.avatar = res.url;
                          } catch {}
                          return file;
                        }}
                      >
                        <NButton
                          type="default"
                          ghost
                          class={
                            "border border-solid border-[#dedee3] dark:border-gray-400/50 hover:!border-[#0960bd] hover:!text-[#0960bd] transition duration-300"
                          }
                          size="small"
                          themeOverrides={{
                            border: "none",
                            borderHover: "none",
                            textColorGhostHover: "none"
                          }}
                        >
                          选择文件...
                        </NButton>
                      </UploadWrapper>
                    </div>
                    <div class="text-gray-500 my-3">
                      建议文件大小{`<`}1MB。太大容易导致加载缓慢
                    </div>
                    <NButton
                      ghost
                      type="error"
                      size="small"
                      disabled
                      onClick={() => {
                        data.value.avatar = defaultAvatar;
                      }}
                    >
                      恢复默认头像
                    </NButton>
                  </NCol>
                </NRow>
              </NCol>
            </NRow>
            <SettingDivider />
            <NRow class="justify-center !my-4">
              <NCol span="6">
                <h4 class="text-2xl font-semibold">登录信息</h4>
                <p>账号当前的登录信息</p>
              </NCol>
              <NCol span="6">
                <div class="flex justify-start flex-row mb-2">
                  <NFormItem
                    label="上次登录时间"
                    size="small"
                    show-feedback={false}
                    class={"flex flex-col items-start justify-center"}
                    label-style={{
                      padding: "0"
                    }}
                  >
                    <>
                      {data.value.lastLoginTime ? (
                        <RelativeTime time={data.value.lastLoginTime} />
                      ) : (
                        "N/A"
                      )}
                    </>
                  </NFormItem>
                  <NFormItem
                    label="上次登录地址"
                    size="small"
                    class={"flex flex-col items-start justify-center ml-72"}
                    show-feedback={false}
                    label-style={{
                      padding: "0"
                    }}
                  >
                    <>
                      {data.value.lastLoginIp ? (
                        <IpInfoPopover
                          trigger={"hover"}
                          ip={data.value.lastLoginIp}
                          triggerEl={
                            <NText class="cursor-pointer">
                              {data.value.lastLoginIp}
                            </NText>
                          }
                        />
                      ) : (
                        "N/A"
                      )}
                    </>
                  </NFormItem>
                </div>
                <div class={"inline-flex space-x-4"}>
                  <small class="">我从哪来的，我什么时候来的？</small>
                  <small class={"text-gray-500/40 select-none"}>
                    {data.value.id}
                  </small>
                </div>
              </NCol>
            </NRow>
            <SettingDivider />
            <NRow class="justify-center !my-4">
              <NCol span="6">
                <h4 class="text-2xl font-semibold">主要信息</h4>
                <p>此信息的部分条目将出现在您的个人资料中。</p>
              </NCol>
              <NCol span="6">
                <NRow class={"justify-between"}>
                  <NCol span="8">
                    <NFormItem label="主人名 (username)">
                      <NInput
                        class={"rounded-lg"}
                        placeholder="这是登录系统的名字哦~"
                        value={data.value.username}
                        onInput={(e) => {
                          data.value.username = e?.trim() || "";
                        }}
                      />
                    </NFormItem>
                  </NCol>
                  <NCol span="14">
                    <NFormItem label="主人邮箱 (mail)">
                      <NInput
                        class={"rounded-lg"}
                        placeholder="主人的邮箱用于接收系统以及订阅通知~"
                        value={data.value.mail}
                        onInput={(e) => {
                          data.value.mail = e;
                        }}
                      />
                    </NFormItem>
                  </NCol>
                </NRow>
                <NFormItem label="主人昵称 (name)">
                  <NInput
                    class={"rounded-lg"}
                    placeholder="这是显示在评论以及文章作者等地方的名字哦~"
                    value={data.value.name}
                    onInput={(e) => {
                      data.value.name = e?.trim() || "";
                    }}
                  />
                </NFormItem>
              </NCol>
            </NRow>
            <SettingDivider />
            <NRow class="justify-center !my-4">
              <NCol span="6">
                <h4 class="text-2xl font-semibold">额外信息</h4>
                <p>补充的个人信息。如个人首页，介绍，社交平台等</p>
              </NCol>
              <NCol span="6">
                <NFormItem label="个人首页">
                  <NInput
                    class={"rounded-lg"}
                    value={data.value.url}
                    placeholder="主人的个人首页~"
                    onInput={(e) => {
                      data.value.url = e;
                    }}
                  />
                </NFormItem>
                <NFormItem label="头像（使用CDN头像）">
                  <NInput
                    class={"rounded-lg"}
                    value={data.value.avatar}
                    onInput={(e) => {
                      data.value.avatar = e;
                    }}
                  />
                </NFormItem>
                <NFormItem label="个人介绍">
                  <NInput
                    class={"rounded-lg"}
                    placeholder="描述一下自己吧~"
                    type="textarea"
                    resizable={false}
                    value={data.value.introduce}
                    onInput={(e) => {
                      data.value.introduce = e;
                    }}
                  />
                </NFormItem>
                <NFormItem label="社交平台 ID 录入">
                  <KVEditor
                    key={data.value.id}
                    options={Object.keys(socialKeyMap).map((key) => {
                      return { label: key, value: socialKeyMap[key] };
                    })}
                    onChange={(newValue) => {
                      data.value.socialIds = newValue;
                    }}
                    value={data.value.socialIds || {}}
                  />
                </NFormItem>
              </NCol>
            </NRow>
            <SettingDivider />
            <NRow class="justify-center !my-2">
              <NCol span="6">
                <NSpace class="justify-center !my-2">
                  <NButton
                    type="primary"
                    color="#0960bd"
                    class={"dark:text-[#f0f8ff] !h-[31px] rounded-md"}
                    onClick={handleSave}
                    disabled={isEmpty(diff.value)}
                    themeOverrides={{
                      textColorHoverPrimary: "#f0f8ff"
                    }}
                  >
                    更新个人资料
                  </NButton>
                  <NButton
                    secondary
                    class={"!h-[31px] rounded-md"}
                    disabled={isEmpty(diff.value)}
                    onClick={() => {
                      location.reload();
                    }}
                  >
                    取消
                  </NButton>
                </NSpace>
              </NCol>
              <NCol span="6" />
            </NRow>
          </NForm>
        </div>
      </Fragment>
    ) : (
      <Fragment>
        <NGrid
          cols={"1 400:1 600:2"}
          class={styles["tab-user"]}
          xGap={20}
          yGap={20}
        >
          <NGi>
            <NForm class="flex flex-col items-center justify-center ">
              <NFormItem>
                <div class={styles.avatar}>
                  <UploadWrapper
                    type="avatar"
                    onFinish={(ev) => {
                      const { file, event } = ev;
                      try {
                        const res = JSON.parse(
                          (event?.target as XMLHttpRequest).responseText
                        );
                        data.value.avatar = res.url;
                      } catch {}
                      return file;
                    }}
                  >
                    <NUploadDragger
                      class={"border-0 bg-transparent hover:border-0"}
                    >
                      <Avatar class="flex" src={data.value.avatar} size={200} />
                    </NUploadDragger>
                  </UploadWrapper>
                </div>
              </NFormItem>

              <NFormItem label="上次登录时间" class="!mt-4">
                <div class="w-full text-center">
                  <NText>
                    {data.value.lastLoginTime ? (
                      <RelativeTime time={data.value.lastLoginTime} />
                    ) : (
                      "N/A"
                    )}
                  </NText>
                </div>
              </NFormItem>

              <NFormItem label="上次登录地址">
                <div class="w-full text-center">
                  {data.value.lastLoginIp ? (
                    <IpInfoPopover
                      trigger={"hover"}
                      ip={data.value.lastLoginIp}
                      triggerEl={
                        <NText class="cursor-pointer">
                          {data.value.lastLoginIp}
                        </NText>
                      }
                    />
                  ) : (
                    "N/A"
                  )}
                </div>
              </NFormItem>

              <NFormItem>
                <NButton
                  round
                  class="-mt-14"
                  type="primary"
                  onClick={handleSave}
                  disabled={isEmpty(diff.value)}
                >
                  保存
                </NButton>
              </NFormItem>
            </NForm>
          </NGi>

          <NGi>
            <NForm>
              <NFormItem label="主人名 (username)">
                <NInput
                  value={data.value.username}
                  onInput={(e) => {
                    data.value.username = e?.trim() || "";
                  }}
                />
              </NFormItem>

              <NFormItem label="主人昵称 (name)">
                <NInput
                  value={data.value.name}
                  onInput={(e) => {
                    data.value.name = e?.trim() || "";
                  }}
                />
              </NFormItem>

              <NFormItem label="主人邮箱 (mail)">
                <NInput
                  value={data.value.mail}
                  onInput={(e) => {
                    data.value.mail = e;
                  }}
                />
              </NFormItem>

              <NFormItem label="个人首页">
                <NInput
                  value={data.value.url}
                  onInput={(e) => {
                    data.value.url = e;
                  }}
                />
              </NFormItem>
              <NFormItem label="头像">
                <NInput
                  value={data.value.avatar}
                  onInput={(e) => {
                    data.value.avatar = e;
                  }}
                />
              </NFormItem>

              <NFormItem label="个人介绍">
                <NInput
                  type="textarea"
                  resizable={false}
                  value={data.value.introduce}
                  onInput={(e) => {
                    data.value.introduce = e;
                  }}
                />
              </NFormItem>

              <NFormItem label="社交平台 ID 录入">
                <KVEditor
                  key={data.value.id}
                  options={Object.keys(socialKeyMap).map((key) => {
                    return { label: key, value: socialKeyMap[key] };
                  })}
                  onChange={(newValue) => {
                    data.value.socialIds = newValue;
                  }}
                  value={data.value.socialIds || {}}
                />
              </NFormItem>
            </NForm>
          </NGi>
        </NGrid>
      </Fragment>
    );
});

export const SettingDivider = defineComponent({
  setup() {
    return () => (
      <NRow class="justify-center !my-4">
        <NCol span="12">
          <hr />
        </NCol>
      </NRow>
    );
  }
});

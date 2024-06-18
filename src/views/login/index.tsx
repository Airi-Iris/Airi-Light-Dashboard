import { useMessage } from "naive-ui";
import useSWRV from "swrv";
import { defineComponent, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { UserModel } from "../../models/user";

import { ArrowRight, PassKeyOutlineIcon } from "~/components/icons";
import { SESSION_WITH_LOGIN } from "~/constants/keys";
import { AuthnUtils } from "~/utils/authn";

import Avatar from "../../components/avatar/index.vue";
import { useUserStore } from "../../stores/user";
import { checkIsInit } from "../../utils/is-init";
import { RESTManager } from "../../utils/rest";

import { clsxm } from "~/utils/helper";
import { useStoreRef } from "~/hooks/use-store-ref";
import { UIStore } from "~/stores/ui";
import { useSingleAndDoubleClick } from "~/hooks/use-single-double-click";

export const LoginView = defineComponent({
  setup() {
    const userStore = useUserStore();

    const { updateToken } = userStore;

    const { user } = storeToRefs(userStore);

    const router = useRouter();
    const inputRef = ref<HTMLInputElement>(null!);
    const { toggleDark } = useStoreRef(UIStore);

    onBeforeMount(async () => {
      const isInit = await checkIsInit();
      if (!isInit) {
        return router.replace("/setup");
      }
      await userStore.fetchUser();
    });

    onMounted(() => {
      if (!inputRef.value) return;
      inputRef.value.focus();

      document.addEventListener("keydown", (e) => {
        inputRef.value.focus();
      });

      onBeforeUnmount(() => {
        document.onkeydown = null;
      });
    });

    const postSuccessfulLogin = (token: string) => {
      updateToken(token);
      router.push(
        route.query.from ? decodeURI(route.query.from as string) : "/dashboard"
      );
      sessionStorage.setItem(SESSION_WITH_LOGIN, "1");
      toast.success("欢迎回来");
    };

    const { data: settings } = useSWRV("allow-password", async () => {
      return RESTManager.api.user("allow-login").get<{
        password: boolean;
        passkey: boolean;
      }>();
    });

    let triggerAuthnOnce = false;

    const passkeyAuth = () => {
      AuthnUtils.validate().then((res) => {
        if (!res) {
          message.error("验证失败");
        }
        const token = res.token!;

        postSuccessfulLogin(token);
      });
    };
    watchEffect(() => {
      if (triggerAuthnOnce) return;
      if (settings.value?.password === false) {
        triggerAuthnOnce = true;
        passkeyAuth();
      }
    });

    const toast = useMessage();

    const password = ref("");
    const route = useRoute();
    const handleLogin = async (e: Event) => {
      e?.stopPropagation();
      e.preventDefault();
      try {
        if (!user.value || !user.value.username) {
          toast.error("主人信息无法获取");
          return;
        }
        const res = await RESTManager.api.master.login.post<{
          token: string & UserModel;
        }>({
          data: {
            username: user.value?.username,
            password: password.value
          }
        });

        if (res.token) {
          postSuccessfulLogin(res.token);
        }
      } catch {
        toast.error("登录失败");
      }
    };

    return () => {
      const showPasswordInput =
        typeof settings.value === "undefined" ||
        settings.value?.password === true;

      const words = "Ciallo～(∠・▽< )⌒☆";
      const fn = useSingleAndDoubleClick(
        () => {
          message.info("哼哼~");
        },
        (e) => {
          console.log(233333);
          void toggleDark();
        }
      );
      return (
        <>
          <div class="flex flex-row items-stretch justify-start relative mt-16 mb-16 box-border outline-0">
            <div class="box-border w-fit text-inherit font-normal">
              <div
                class={clsxm(
                  "overflow-visible box-border flex flex-col items-stretch",
                  "justify-start max-w-[calc(-2.5rem+100vw)] w-[25rem] relative",
                  "border-solid border-[rgba(0,0,0,.07)] text-base-content border-0",
                  "login-box-shadow rounded-lg"
                )}
              >
                <div
                  class={clsxm(
                    "border border-border pointer-events-auto text-base-content bg-base-100",
                    "!pt-[2.5rem] pb-4 shadow-xl place-content-center rounded-lg",
                    "flex flex-col items-stretch gap-6 z-[10] border-solid  relative text-center"
                  )}
                  style={{ padding: "2rem 2.5rem" }}
                >
                  <div class="absolute top-[-30px] left-[50%] m-auto inline-block translate-x-[-50%] h-[32px] object-cover">
                    <Avatar
                      src={user.value?.avatar}
                      size={60}
                      class="inline-flex items-center m-0 cursor-pointer justify-center"
                      onClick={fn}
                    />
                  </div>
                  <div class="box-border flex flex-col items-stretch justify-start gap-[0.25rem] select-none">
                    <h1 class="m-0 text-base-content font-bold text-[1.0625rem] leading-[1.41176] pb-2">
                      登录到 Light Dashborad
                    </h1>
                    <p class="m-0 text-[0.8125rem] font-normal leading-[1.38462] break-words text-zinc-500">
                      {words} 欢迎回来! 请登录以继续~
                    </p>
                  </div>
                  <div class="flex flex-col gap-4 justify-start items-stretch">
                    {showPasswordInput && (
                      <form
                        class="flex flex-col items-center justify-center"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleLogin(e);
                        }}
                      >
                        <div class="relative w-full">
                          <input
                            class={clsxm(
                              "min-w-0 flex-auto appearance-none rounded-lg border ring-accent/20 duration-200 sm:text-sm lg:text-base",
                              "bg-base-100 px-3 py-[calc(theme(spacing.2)-1px)] placeholder:text-zinc-400 focus:outline-none focus:ring-2 dark:bg-zinc-700/[0.15]",
                              "border-border",
                              "focus:border-accent/80 dark:text-zinc-200 dark:placeholder:text-zinc-500",
                              "relative tracking-wider w-full select-none"
                            )}
                            ref={inputRef}
                            value={password.value}
                            placeholder="Authentication ID"
                            onInput={(e: any) => {
                              password.value = e.target.value;
                            }}
                            type="password"
                          />
                          {!password.value && settings.value?.passkey && (
                            <button
                              class={clsxm(
                                "absolute !right-0 top-[50%] inline-flex translate-y-[-50%] rounded p-[.5rem] leading-4 text-[#89888d]",
                                "hover:text-[#535158] dark:hover:text-zinc-400",
                                "transition duration-100 ease-linear center focus:outline-none border-none !border-0"
                              )}
                              onClick={() => {
                                passkeyAuth();
                              }}
                            >
                              <PassKeyOutlineIcon />
                            </button>
                          )}
                          {password.value && (
                            <button
                              class={clsxm(
                                "absolute !right-0 top-[50%] inline-flex translate-y-[-50%] rounded p-[.5rem] leading-4 text-[#89888d]",
                                "hover:text-accent",
                                "transition duration-300 ease-in-out center focus:outline-none border-none !border-0"
                              )}
                              onClick={handleLogin}
                            >
                              <ArrowRight />
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer class="absolute rounded-tl-lg bottom-0 right-0 text-[0.9rem] font-normal pt-[2px] pb-[1px] px-[5px] text-white bg-[#282828] text-center hidden sm:block">
            &copy; {new Date().getFullYear() + " "} Future-Tech Lab
            时ICP备140422号-12
          </footer>
        </>
      );
    };
  }
});

export default LoginView;

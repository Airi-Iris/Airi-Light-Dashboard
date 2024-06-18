import { NButton } from "naive-ui";

import {
  startAuthentication,
  startRegistration
} from "@simplewebauthn/browser";

import { RESTManager } from "~/utils";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON
} from "@simplewebauthn/types";

export default defineComponent({
  setup() {
    return () => {
      return (
        <div
          class={
            "flex center md:flex-row place-content-stretch box-border w-full gap-6 h-[calc(100vh-240px)] flex-col"
          }
        >
          <div
            class={"flex flex-col w-[384px] gap-6"}
            style={{ placeContent: "stretch flex-start" }}
          >
            <div
              class={
                "relative flex h-[128px] w-[384px] flex-col rounded-md bg-white px-4 py-5 duration-200 card-shadow dark:bg-neutral-950 dark:hover:ring-1 dark:hover:ring-zinc-300"
              }
            >
              <div class={"flex grow flex-col"}>
                <div class="line-clamp-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  <span class={"text-blue-400"}>[Debug]</span>{" "}
                  通行密钥（Passkey） 注册
                </div>
                <div class="mt-2 h-0 grow overflow-hidden text-sm text-neutral-500 scrollbar-none dark:text-neutral-400 mask-b">
                  调用通行密钥注册程序
                </div>
                <div class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <NButton
                    class={"w-full"}
                    onClick={async () => {
                      const registrationOptions =
                        await RESTManager.api.passkey.register.post<any>();
                      let attResp: RegistrationResponseJSON;
                      try {
                        // Pass the options to the authenticator and wait for a response
                        attResp = await startRegistration(registrationOptions);
                      } catch (error: any) {
                        // Some basic error handling
                        if (error.name === "InvalidStateError") {
                          message.error(
                            "Error: Authenticator was probably already registered by user"
                          );
                        } else {
                          message.error(error.message);
                        }
                      }

                      try {
                        Object.assign(attResp, {
                          name: `test-1${(Math.random() * 100) | 0}`
                        });
                        const verificationResp =
                          await RESTManager.api.passkey.register.verify.post<any>(
                            {
                              data: attResp
                            }
                          );
                        if (verificationResp.verified) {
                          message.success(
                            "Successfully registered authenticator"
                          );
                        } else {
                          message.error(
                            "Error: Could not verify authenticator"
                          );
                        }
                      } catch {
                        message.error("Error: Could not verify authenticator");
                      }
                    }}
                  >
                    Register
                  </NButton>
                </div>
              </div>
            </div>
          </div>
          <div
            class={"flex flex-col w-[384px] gap-6"}
            style={{ placeContent: "stretch flex-start" }}
          >
            <div
              class={
                "relative flex h-[128px] w-[384px] flex-col rounded-md bg-white px-4 py-5 duration-200 card-shadow dark:bg-neutral-950 dark:hover:ring-1 dark:hover:ring-zinc-300"
              }
            >
              <div class={"flex grow flex-col"}>
                <div class="line-clamp-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  <span class={"text-blue-400"}>[Debug]</span>{" "}
                  通行密钥（Passkey） 验证
                </div>
                <div class="mt-2 h-0 grow overflow-hidden text-sm text-neutral-500 scrollbar-none dark:text-neutral-400 mask-b">
                  调用通行密钥验证程序
                </div>
                <div class="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <NButton
                    class={"w-full"}
                    onClick={async () => {
                      const registrationOptions =
                        await RESTManager.api.passkey.authentication.post<any>();
                      let attResp: AuthenticationResponseJSON;
                      try {
                        // Pass the options to the authenticator and wait for a response
                        attResp =
                          await startAuthentication(registrationOptions);
                      } catch (error: any) {
                        // Some basic error handling

                        message.error(error.message);
                      }

                      try {
                        const verificationResp =
                          await RESTManager.api.passkey.authentication.verify.post<any>(
                            {
                              data: attResp
                            }
                          );
                        if (verificationResp.verified) {
                          message.success(
                            "Successfully registered authenticator"
                          );
                        } else {
                          message.error(
                            "Error: Could not verify authenticator"
                          );
                        }
                      } catch (error: any) {
                        message.error(error.message);
                      }
                    }}
                  >
                    Authenticator
                  </NButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
  }
});

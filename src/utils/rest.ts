import { API_URL } from "~/constants/env";
import { isPlainObject } from "lodash-es";
import { extend } from "umi-request";
import { uuid } from "~/utils";

import { simpleCamelcaseKeys } from "@mx-space/api-client";

import { router } from "../router/router";
import { getToken } from "./auth";
import type { RequestMethod, RequestOptionsInit } from "umi-request";

class RESTManagerStatic {
  private _$$instance: RequestMethod = null!;
  get instance() {
    return this._$$instance;
  }

  get endpoint() {
    return API_URL;
  }

  constructor() {
    this._$$instance = extend({
      prefix: this.endpoint,
      timeout: 10000,
      errorHandler: async (error) => {
        const Message = window.message;
        //@ts-ignore
        if (error.request && !error.response) {
          Message.error("网络错误");
          return;
        }

        if (error.response) {
          if (import.meta.env.DEV) {
            console.log(error.response);
            console.dir(error.response);
          }
          try {
            const json = await error.response.json();
            const message = json.message;
            if (Array.isArray(message)) {
              message.forEach((m) => {
                Message.error(m);
              });
            } else {
              Message.error(message);
            }
          } catch (error_) {
            // Message.error('出错了，请查看控制台')
            console.log(error_);
          }

          if (error?.response?.status === 401) {
            router.push(
              `/login?from=${encodeURIComponent(
                router.currentRoute.value.fullPath
              )}`
            );
          }
          return Promise.reject(error);
        }
      }
    });
  }
  request(method: Method, route: string, options: RequestOptionsInit) {
    return this._$$instance[method](route, options);
  }

  get api() {
    return buildRoute(this);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const methods = ["get", "post", "delete", "patch", "put"];
const reflectors = [
  "toString",
  "valueOf",
  "inspect",
  "constructor",
  Symbol.toPrimitive,
  Symbol.for("util.inspect.custom")
];

declare module "umi-request" {
  export interface RequestOptionsInit {
    transform?: boolean;
  }
}

function buildRoute(manager: RESTManagerStatic): IRequestHandler {
  const route = [""];
  const handler: any = {
    get(target: any, name: Method) {
      if (reflectors.includes(name)) return () => route.join("/");
      if (methods.includes(name)) {
        // @ts-ignore
        return async (options: RequestOptionsInit = {}) => {
          const res = await manager.request(name, route.join("/"), {
            ...options
          });

          const shouldTransformData = options.transform ?? true;

          return Array.isArray(res) || isPlainObject(res)
            ? (() => {
                const transform = shouldTransformData
                  ? simpleCamelcaseKeys(res)
                  : res;

                const nextTransform = Array.isArray(transform) ? [] : {};

                Object.assign(nextTransform, transform);

                if (!("data" in transform))
                  Object.defineProperty(nextTransform, "data", {
                    get() {
                      return transform.data ?? transform;
                    }
                  });

                return nextTransform;
              })()
            : res;
        };
      }
      route.push(name);
      return new Proxy(noop, handler);
    },
    // @ts-ignore
    apply(target: any, _, args) {
      route.push(...args.filter((x: string) => x != null)); // eslint-disable-line eqeqeq
      return new Proxy(noop, handler);
    }
  };
  // @ts-ignore
  return new Proxy(noop, handler);
}

export const RESTManager = new RESTManagerStatic();

// @ts-ignore
if (!window.api) {
  Object.defineProperty(window, "api", {
    get() {
      return RESTManager.api;
    }
  });
}
const _uuid = uuid();
RESTManager.instance.interceptors.request.use((url, options) => {
  const token = getToken();

  let modifiedUrl = url;
  if (options.method?.toUpperCase() === "GET") {
    modifiedUrl = `${url}?t=${Date.now()}`;
  }
  if (options.headers) {
    if (token) {
      options.headers["Authorization"] = token;
    }

    options.headers["x-uuid"] = _uuid;
  }
  return {
    url: modifiedUrl,
    options: {
      ...options,
      interceptors: true
    }
  };
  //@ts-ignore
}, {});

interface IRequestHandler<T = RequestOptionsInit> {
  (id?: string): IRequestHandler;
  // @ts-ignore
  get: <P = unknown>(options?: T) => Promise<P>;
  // @ts-ignore
  post: <P = unknown>(options?: T) => Promise<P>;
  // @ts-ignore
  patch: <P = unknown>(options?: T) => Promise<P>;
  // @ts-ignore
  delete: <P = unknown>(options?: T) => Promise<P>;
  // @ts-ignore
  put: <P = unknown>(options?: T) => Promise<P>;
  [key: string]: IRequestHandler;
}
export type Method = "get" | "delete" | "post" | "put" | "patch";

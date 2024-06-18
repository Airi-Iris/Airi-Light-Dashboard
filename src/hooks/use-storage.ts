import { instanceToPlain, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { throttle } from "lodash-es";
import { reactive, watch } from "vue";

const key2reactive = new Map<string, any>();
export const useStorageObject = <U extends object>(
  DTO: Class<U>,
  storageKey: string,
  fixWrongPropertyData = true
) => {
  const getObjectStorage = () => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      console.debug(storageKey, ": no saved data");
      return null;
    }
    try {
      const parsed = JSON.parse(saved);
      const classify = plainToInstance(DTO, parsed);
      const err = validateSync(classify);
      if (err.length > 0) {
        if (fixWrongPropertyData) {
          const instanceDto = new DTO();
          err.forEach((e) => {
            const propertyName = e.property;
            parsed[propertyName] = instanceDto[propertyName];

            localStorage.setItem(storageKey, JSON.stringify(parsed));
          });
        }
        if (__DEV__) {
          console.log(err);
          console.log(
            "wrong property key:",
            err.map((e) => e.property).toString()
          );
          fixWrongPropertyData &&
            console.log("after fix wrong property:", parsed);
        }
        return fixWrongPropertyData ? parsed : null;
      }
      return parsed;
    } catch (error) {
      console.log(error);

      return null;
    }
  };
  const storedReactive = key2reactive.get(storageKey);
  const objectStorage: U =
    storedReactive ??
    reactive<U>(getObjectStorage() ?? instanceToPlain(new DTO()));
  if (!storedReactive) {
    key2reactive.set(storageKey, objectStorage);
  }
  watch(
    () => objectStorage,
    throttle(
      (n) => {
        localStorage.setItem(storageKey, JSON.stringify(n));
      },
      400,
      { trailing: true }
    ),
    { deep: true }
  );

  onBeforeMount(() => {
    localStorage.setItem(storageKey, JSON.stringify(objectStorage));
  });

  return {
    storage: objectStorage as U,
    reset: () => {
      Object.assign(objectStorage, instanceToPlain(new DTO()));
    },
    clear() {
      localStorage.removeItem(storageKey);
    },
    destory() {
      key2reactive.delete(storageKey);
    }
  };
};

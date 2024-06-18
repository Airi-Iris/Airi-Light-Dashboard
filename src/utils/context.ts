import {
  defineComponent,
  provide,
  computed,
  inject,
  type PropType,
  type ComputedRef,
  FunctionalComponent
} from "vue";

export type Selector<Value extends Record<string, any>, Props extends {}> = (
  initialContext: Value,
  props: Props
) => Record<string, any>;

export type DefineContext<
  Value extends Record<string, any>,
  Props extends {},
  Selectors extends Selector<Value, Props>[]
> = {
  [Key in keyof Selectors]: Selectors[Key] extends Selector<Value, Props>
    ? ReturnType<Selectors[Key]>
    : {};
};

export type First<
  F extends Record<string, any>,
  R extends Record<string, any>[]
> = [F, ...R];

export type MergeContext<H extends Record<string, any>[]> = H extends []
  ? {}
  : H extends First<infer C, []>
    ? C
    : H extends First<infer C, infer R>
      ? C & MergeContext<R>
      : {};

export type Context<
  Value extends Record<string, any>,
  Props extends {},
  Selectors extends Selector<Value, Props>[]
> = Value & MergeContext<DefineContext<Value, Props, Selectors>>;

export type ContextProvider<Props extends {}> = FunctionalComponent<Props, {}>;

export function createContext<T>(defaultValue: T, key?: any) {
  const KEY = Symbol(key);
  const Provider = defineComponent({
    props: {
      value: {
        type: [
          Object,
          Number,
          String,
          Boolean,
          null,
          undefined,
          Function
        ] as PropType<T>,
        required: true
      }
    },
    setup(props, ctx) {
      provide(
        KEY,
        computed(() => props.value || defaultValue)
      );
      return () => ctx.slots.default?.();
    }
  });

  const useContext = () =>
    inject<ComputedRef<T>>(KEY) || computed(() => defaultValue);

  const Consumer = defineComponent({
    setup(props, ctx) {
      const value = useContext();
      return () => ctx.slots.default?.(value.value);
    }
  });

  return {
    Provider,
    Consumer,
    useContext
  };
}

// export function createContext<
//   Props extends {},
//   Value extends Record<string, any>,
//   Selectors extends Selector<Value, Props>[]
// >(useValue: (props: Props) => Value, ...selectors: Selectors) {
//   const injectionKey: InjectionKey<Context<Value, Props, Selectors>> = Symbol();

//   const NO_PROVIDER = {};

//   const ContextProvider: ContextProvider<Props> = (props, { slots }) => {
//     return h(
//       defineComponent({
//         name: ContextProvider.displayName || "Provider",
//         setup() {
//           const initialContext = useValue(props);

//           const hookContextValues = selectors.reduce((merged, selector) => {
//             return Object.assign(
//               {},
//               merged,
//               selector.call(null, initialContext, props)
//             );
//           }, Object.create(null));

//           provide(
//             injectionKey,
//             Object.assign({}, initialContext, hookContextValues)
//           );

//           return () => h(Fragment, slots.default?.());
//         }
//       })
//     );
//   };

//   function dispatch() {
//     const context = inject(injectionKey, NO_PROVIDER) as Context<
//       Value,
//       Props,
//       Selectors
//     >;

//     if (context === NO_PROVIDER) {
//       console.warn("The ContextProvider is never used.");
//     }

//     return context;
//   }

//   return [ContextProvider, dispatch] as const;
// }

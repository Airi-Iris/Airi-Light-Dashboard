import type { PropType } from "vue";

export const inputBaseProps = {
  className: {
    type: [String] as PropType<string>
  },
  type: {
    type: String
  },
  value: {
    type: String,
    required: true
  },
  placeholder: {
    type: String
  },
  onChange: {
    type: Function as PropType<(value: string) => void>,
    required: true
  },
  onBlur: {
    type: Function as PropType<(value: string) => void>
  },
  onFocus: {
    type: Function as PropType<(value: string) => void>
  }
} as const;

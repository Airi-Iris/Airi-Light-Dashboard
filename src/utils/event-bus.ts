/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import type { EventTypes } from "~/socket/types";

type IDisposable = () => void;
export class EventBus {
  private observers: Record<string, Function[]> = {};

  on(event: EventTypes, handler: any): IDisposable;
  on(event: string, handler: any): IDisposable;
  on(event: string, handler: (...rest: any) => void): IDisposable {
    const queue = this.observers[event];

    const disposer = () => {
      this.off(event, handler);
    };
    if (!queue) {
      this.observers[event] = [handler];
      return disposer;
    }
    const isExist = queue.includes(handler);
    if (!isExist) {
      this.observers[event].push(handler);
    }

    return disposer;
  }

  emit(event: string, payload?: any, ...args: any[]): void;
  emit(event: EventTypes, payload?: any, ...args: any[]): void;
  emit(event: EventTypes, payload?: any, ...args: any[]) {
    const queue = this.observers[event];
    if (!queue) {
      return;
    }
    for (const func of queue) {
      func.call(this, payload, ...args);
    }
  }

  off(event: string, handler?: (...rest: any) => void) {
    const queue = this.observers[event];
    if (!queue) {
      return;
    }

    if (handler) {
      const index = queue.indexOf(handler);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    } else {
      queue.length = 0;
    }
  }
}
export const bus = new EventBus();

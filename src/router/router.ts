import {
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";

import { routes } from "./route";

export const router = createRouter({
  //fix redirect
  history: createWebHashHistory(),

  routes
});

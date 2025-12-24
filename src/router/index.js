import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "login", component: () => import("../views/login.vue") },
  { path: "/home", name: "home", component: () => import("../views/home.vue") },
  { path: "/myTrips", name: "myTrips", component: () => import("../views/myTrips.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

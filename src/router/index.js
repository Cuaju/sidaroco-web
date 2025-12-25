import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "login", component: () => import("../views/login.vue") },
  { path: "/home", name: "home", component: () => import("../views/home.vue") },
  { path: "/myTrips", name: "myTrips", component: () => import("../views/myTrips.vue") },
  { path: "/register", name: "registerAccount", component: () => import("../views/registerAccount.vue") },
  { path: "/verify-email", name: "verifyEmail", component: () => import("../views/verifyEmail.vue") },
  { path: "/register-profile", name: "registerProfile", component: () => import("../views/registerProfile.vue") },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

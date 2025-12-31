import { createRouter, createWebHistory } from "vue-router";
import ClientLayout from "@/layouts/clientLayout.vue";
import RouteManagerLayout from "@/layouts/routeManagerLayout.vue";
import FinanceManagerLayout from "@/layouts/financeManagerLayout.vue";
import { useAuthStore } from "@/stores/authStore";

const routes = [
  { path: "/", name: "login", component: () => import("../views/login.vue") },
  { path: "/home", name: "home", component: () => import("../views/home.vue") },
  { path: "/myTrips", name: "myTrips", component: () => import("../views/myTrips.vue") },
  { path: "/register", name: "registerAccount", component: () => import("../views/registerAccount.vue") },
  { path: "/verify-email", name: "verifyEmail", component: () => import("../views/verifyEmail.vue") },
  { path: "/register-profile", name: "registerProfile", component: () => import("../views/registerProfile.vue") },
  {
    path: "/trips",
    name: "tripsList",
    component: () => import("@/views/tripsList.vue")
  },
  {
    path: "/trips/:tripId/seats",
    name: "seatSelection",
    component: () => import("@/views/seatSelection.vue")
  },
  {
    path: "/",
    component: RouteManagerLayout,
    meta: {
      requiresAuth: true,
      role: "RouteManager",
    },
    children: [
      // Routes (Rutas)
      {
        path: "routes",
        name: "routes",
        component: () => import("@/views/routes.vue"),
      },
      {
        path: "CreateRouteView",
        name: "createRoute",
        component: () => import("@/views/createRouteView.vue"),
      },
      {
        path: "routes/:id/edit",
        name: "editRoute",
        component: () => import("@/views/editRouteView.vue"),
      },
      // Buses (Camiones)
      {
        path: "buses",
        name: "buses",
        component: () => import("@/views/buses.vue"),
      },
      {
        path: "buses/create",
        name: "createBus",
        component: () => import("@/views/createBusView.vue"),
      },
      {
        path: "buses/:id/edit",
        name: "editBus",
        component: () => import("@/views/editBusView.vue"),
      },
      // Drivers (Conductores)
      {
        path: "drivers",
        name: "drivers",
        component: () => import("@/views/drivers.vue"),
      },
      {
        path: "drivers/create",
        name: "createDriver",
        component: () => import("@/views/createDriverView.vue"),
      },
      {
        path: "drivers/:id/edit",
        name: "editDriver",
        component: () => import("@/views/editDriverView.vue"),
      },
      // Schedule (Programación)
      {
        path: "schedule",
        name: "schedule",
        component: () => import("@/views/scheduleView.vue"),
      },
    ],
  },
  {
    path: "/finance",
    component: FinanceManagerLayout,
    meta: {
      requiresAuth: true,
      role: "FinanceManager",
    },
    children: [
      {
        path: "route",
        name: "financeRouteMonthly",
        component: () => import("@/views/routeMonthlySummaryView.vue")
      },
      {
        path: "daily",
        name: "dailySummary",
        component: () => import("@/views/dailySummaryView.vue"),
      },
      {
        path: "monthly",
        name: "monthlySummary",
        component: () => import("@/views/monthlySummaryView.vue"),
      },
    ],
  },

];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next("/");
  }

  if (to.meta.role && auth.account?.userType !== to.meta.role) {
    if (auth.account?.userType === "FinanceManager") {
      return next("/finance/daily");
    }

    if (auth.account?.userType === "RouteManager") {
      return next("/routes");
    }

    return next("/home");
  }

  next();
});


export default router;

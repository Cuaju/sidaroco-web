import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./styles/main.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";


const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(Toast, {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
});

app.mount("#app");
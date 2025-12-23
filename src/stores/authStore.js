import { defineStore } from "pinia";
import { loginRequest } from "../services/authApi";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    account: JSON.parse(localStorage.getItem("account") || "null")
  }),
  getters: {
    isLoggedIn: (s) => !!s.token
  },
  actions: {
    async login(email, password) {
      const data = await loginRequest(email, password);

      this.token = data.token;
      this.account = data.account;

      localStorage.setItem("token", data.token);
      localStorage.setItem("account", JSON.stringify(data.account));
    },
    logout() {
      this.token = null;
      this.account = null;
      localStorage.removeItem("token");
      localStorage.removeItem("account");
    }
  }
});

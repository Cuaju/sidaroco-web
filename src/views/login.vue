<script>
import mapboxgl from "mapbox-gl";
import { useAuthStore } from "../stores/authStore";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      error: "",
      touched: {
        email: false,
        password: false
      }
    };
  },

  computed: {
    emailError() {
      if (!this.touched.email) return "";
      if (!this.email.trim()) return "Email is required";
      if (!emailRegex.test(this.email.trim())) return "Enter a valid email";
      return "";
    },

    passwordError() {
      if (!this.touched.password) return "";
      if (!this.password) return "Password is required";
      if (this.password.length < 6) return "Min 6 characters";
      return "";
    },

    isFormValid() {
      const emailOk = this.email.trim() && emailRegex.test(this.email.trim());
      const passOk = this.password && this.password.length >= 6;
      return Boolean(emailOk && passOk);
    }
  },

  mounted() {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: "map-bg",
      style: "mapbox://styles/mapbox/standard",
      center: [-99.1677, 19.4285], // Willis Tower (Chicago)
      zoom: 16.6,
      pitch: 70,
      bearing: -20,
      interactive: false,
      antialias: true,
      config: {
        lightPreset: "dawn"
      }
    });

    map.on("load", () => {
      // 🔕 Ocultar etiquetas
      map.setConfigProperty("basemap", "showRoadLabels", false);
      map.setConfigProperty("basemap", "showPlaceLabels", false);
      map.setConfigProperty("basemap", "showPointOfInterestLabels", false);
      map.setConfigProperty("basemap", "showTransitLabels", false);

      // 🏙️ Edificios 3D
      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#d8d2c4",
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.95
        }
      });

      let zoom = 15.6;
      let bearing = -20;

      const animate = () => {
        if (zoom < 16.9) {
          zoom += 0.0016;
          map.setZoom(zoom);
        }

        bearing += 0.003;
        map.setBearing(bearing);

        requestAnimationFrame(animate);
      };

      animate();
    });
  },

  methods: {
    touchAll() {
      this.touched.email = true;
      this.touched.password = true;
    },

    async onSubmit() {
      this.error = "";
      this.touchAll();
      if (!this.isFormValid) return;

      this.loading = true;

      try {
        const auth = useAuthStore();
        await auth.login(this.email.trim(), this.password);

        if (auth.account.userType === "RouteManager") {
          this.$router.push("/routes");
        } else if (auth.account.userType === "FinanceManager") {
          this.$router.push("/finance/daily");
        } else {
          this.$router.push("/home");
        }
      } catch (e) {
        this.error = e?.message || "Login failed";
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div id="background">
    <div id="map-wrapper">
      <div id="map-bg"></div>
    </div>
    <div id="footer-gradient"></div>
    <div id="loginCard">
      <img id="logoImg" src="@/assets/images/Sidaroco.png" alt="Sidaroco" />

      <h1>Login</h1>
      <form @submit.prevent="onSubmit">
        <label class="field">
          <span>Email</span>
          <input v-model.trim="email" type="email" placeholder="Ex. JuaPerez123@gmail.com" autocomplete="email"
            @blur="touched.email = true" />
          <p v-if="emailError" class="fieldError">{{ emailError }}</p>
        </label>

        <label class="field">
          <span>Password</span>
          <input v-model="password" type="password" placeholder="********" autocomplete="current-password"
            @blur="touched.password = true" />
          <p v-if="passwordError" class="fieldError">{{ passwordError }}</p>
        </label>

        <p v-if="error" class="error">{{ error }}</p>

        <button id="loginBtn" type="submit" :disabled="loading">
          {{ loading ? "Logging in..." : "Login" }}
        </button>
      </form>

      <label>
        <span>Dont have an account yet? → </span>
        <router-link to="/register">Register</router-link>
      </label>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;
@use "sass:color";

#map-wrapper {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

#background {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;

  background: radial-gradient(circle at 30% 20%,
      $secondaryColor 0%,
      $primaryColor 55%,
      #001a18 100%);

  position: relative;
  overflow: hidden;
}

#map-bg {
  position: absolute;
  inset: 0;
  contain: strict;
}

#map-bg,
#map-bg canvas {
  width: 100%;
  height: 100%;
}

#footer-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35%;
  z-index: 1;

  background: linear-gradient(to top,
      #001a18 0%,
      rgba(0, 26, 24, 0.85) 40%,
      rgba(0, 26, 24, 0.4) 70%,
      transparent 100%);
}

#loginCard {
  position: relative;
  z-index: 2;

  width: 100%;
  max-width: 420px;
  padding: 16px;
  border-radius: 22px;

  background: linear-gradient(160deg,
      color.adjust($fourthColor, $lightness: 3%),
      color.adjust($fourthColor, $lightness: -4%));

  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);

  display: flex;
  flex-direction: column;
  gap: 14px;

  max-height: 70px;
  overflow: hidden;
  cursor: pointer;
  margin-left: auto;
  margin-right: auto;
  transition:
    max-height 3.9s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 1.5s ease,
    transform 1.5s ease;
}

#loginCard:hover,
#loginCard:focus-within {
  max-height: 650px;
  transform: translateY(-6px);

  box-shadow:
    0 45px 140px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba($secondaryColor, 0.3);
}

#loginCard h1,
#loginCard form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

#loginCard>label {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

#loginCard:hover h1,
#loginCard:hover form,
#loginCard:hover>label,
#loginCard:focus-within h1,
#loginCard:focus-within form,
#loginCard:focus-within>label {
  opacity: 1;
  transform: translateY(0);
}

#logoImg {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  display: block;
  transition: transform 0.4s ease;
}

#loginCard:hover #logoImg,
#loginCard:focus-within #logoImg {
  transform: scale(1.06);
}

h1 {
  color: $secondaryColor;
  font-weight: 800;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field span {
  color: $thirdColor;
  font-weight: 700;
}

.fieldError {
  font-size: 0.9rem;
  font-weight: 700;
  color: #b00020;
}

.error {
  color: #b00020;
  font-weight: 700;
}

input {
  height: 42px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid $primaryColor;
  background: $fourthColor;
  outline: none;
}

input:focus {
  border-color: $thirdColor;
  box-shadow: 0 0 0 4px rgba($thirdColor, 0.35);
}

#loginBtn {
  height: 44px;
  width: 100%;
  border: none;
  border-radius: 12px;

  background: $primaryColor;
  color: $fourthColor;
  font-weight: 800;

  cursor: pointer;
  transition: transform 0.08s ease, box-shadow 0.2s ease;
}

#loginBtn:hover {
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}

#loginBtn:active {
  transform: translateY(1px);
}

#loginBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

@media (max-width: 480px) {
  #background {
    padding: 16px;
  }

  #loginCard {
    width: 100%;
    max-width: 380px;
    transform: none;
  }
}

@media (hover: none) {
  #loginCard:hover {
    transform: none;
    box-shadow: 0 18px 55px rgba(0, 0, 0, 0.45);
  }
}

#background {
  overflow-x: hidden;
}
</style>
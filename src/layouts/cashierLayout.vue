<template>
  <div class="appShell">
    <header class="topbar">
      <div class="brand">
        <RouterLink to="/cashier" aria-label="Go to cashier home">
          <img class="logo" src="@/assets/images/Sidaroco.png" alt="Sidaroco" />
        </RouterLink>
        <span class="roleTag">Cashier Terminal</span>
      </div>

      <nav class="nav">
        <RouterLink class="navLink" to="/cashier">Sell Ticket</RouterLink>
        <RouterLink class="navLink" to="/cashier/sales">My Sales</RouterLink>
      </nav>

      <UserMenu :userName="user?.name ?? 'Cashier'" :avatar="user?.name?.charAt(0).toUpperCase() ?? 'C'" />
    </header>

    <main class="content">
      <slot />
    </main>

    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} S.I.D.A.R.O.C.O System. Cashier Terminal.</p>
    </footer>
  </div>
</template>

<script>
import UserMenu from "@/components/userMenu.vue";

export default {
  components: { UserMenu },
  computed: {
    user() {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    },
  },
};
</script>

<style scoped lang="scss">
@use "../styles/colors.scss" as *;

.appShell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $fourthColor;
}

.topbar {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 0 22px;
  background: rgba($secondaryColor, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand .logo {
  height: 32px;
  width: auto;
  display: block;
}

.brand a {
  display: inline-block;
}

.roleTag {
  background: rgba($thirdColor, 0.9);
  color: $primaryColor;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav {
  display: flex;
  gap: 14px;
}

.navLink {
  color: $fourthColor;
  text-decoration: none;
  font-weight: 800;
  padding: 10px 12px;
  border-radius: 12px;
  opacity: 0.9;
}

.navLink:hover {
  background: rgba($fourthColor, 0.1);
  opacity: 1;
}

.content {
  flex: 1;
}

.footer {
  padding: 18px;
  background: $primaryColor;
  color: $fourthColor;
  text-align: center;
  font-size: 12px;
  opacity: 0.8;
}

.footer p {
  margin: 0;
}
</style>

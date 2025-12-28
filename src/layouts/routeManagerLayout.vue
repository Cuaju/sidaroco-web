<template>
  <div class="appShell">
    <header class="topbar">
      <div class="brand">
        <RouterLink to="/home" aria-label="ESTE ES ROUTER">
          <img class="logo" src="@/assets/images/Sidaroco.png" alt="Sidaroco" />
        </RouterLink>
      </div>

      <nav class="nav">
        <a class="navLink" @click="$router.push('/routes')">Routes</a>
      </nav>
      <UserMenu userName="Route Manager" avatar="R" />
    </header>

    <main class="content">
      <RouterView />
    </main>

    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} S.I.D.A.R.DASDA.C.O System. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import UserMenu from "@/components/userMenu.vue";

export default {
  components: { UserMenu },
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

.brand .logo {
  height: 32px;
  width: auto;
  display: block;
}

.brand a {
  display: inline-block;
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

.user {
  display: flex;
  align-items: center;
  gap: 10px;
  color: $fourthColor;
}

.userName {
  font-weight: 800;
  opacity: 0.9;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 900;

  background: $thirdColor;
  color: $primaryColor;
}

.content {
  flex: 1;
}

.footer {
  padding: 18px 22px;
  text-align: center;
  color: rgba($primaryColor, 0.8);
  font-weight: 700;
}
</style>
<template>
    <div class="appShell">
        <header class="topbar">
            <div class="brand">
                <RouterLink to="/driver" aria-label="Go to driver home">
                    <img class="logo" src="@/assets/images/Sidaroco.png" alt="Sidaroco" />
                </RouterLink>
                <span class="roleTag">Driver</span>
            </div>

            <nav class="nav">
                <RouterLink class="navLink" to="/driver">My Trips</RouterLink>
            </nav>

            <UserMenu :userName="user?.name ?? 'Driver'" :avatar="user?.name?.charAt(0).toUpperCase() ?? 'D'" />
        </header>

        <main class="content">
            <RouterView />
        </main>

        <footer class="footer">
            <p>© {{ new Date().getFullYear() }} S.I.D.A.R.O.C.O System. Driver Portal.</p>
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
    background: rgba($primaryColor, 0.95);
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
    padding: 10px 16px;
    border-radius: 12px;
    opacity: 0.9;
    transition: all 0.2s ease;

    &:hover,
    &.router-link-active {
        background: rgba($secondaryColor, 0.3);
        opacity: 1;
    }
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

<template>
    <div class="appShell">
        <header class="topbar">
            <div class="brand">
                <RouterLink to="/finance/daily">
                    <img class="logo" src="@/assets/images/Sidaroco.png" alt="Sidaroco" />
                </RouterLink>
            </div>

            <nav class="nav">
                <RouterLink class="navLink" to="/finance/daily">Daily</RouterLink>
                <RouterLink class="navLink" to="/finance/monthly">Monthly</RouterLink>
                <RouterLink class="navLink" to="/finance/route">By route</RouterLink>
                <RouterLink class="navLink" to="/finance/adminAccounts">Admin Accouts</RouterLink>
            </nav>

            <UserMenu userName="Finance Manager" avatar="F" />
        </header>

        <main class="content">
            <RouterView />
        </main>
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
    background: $fourthColor;
    display: flex;
    flex-direction: column;
}

.topbar {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background: rgba($secondaryColor, 0.95);
}

.brand {
    display: flex;
    align-items: center;
}

.brand .logo {
    height: 28px;
    max-height: 28px;
    width: auto;
    object-fit: contain;
    display: block;
}

.nav {
    display: flex;
    gap: 16px;
}

.navLink {
    color: $fourthColor;
    font-weight: 800;
    text-decoration: none;
    padding: 8px 14px;
    border-radius: 10px;
}

.navLink.router-link-active {
    background: rgba($fourthColor, 0.15);
}

.user {
    display: flex;
    gap: 10px;
    color: $fourthColor;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: $thirdColor;
    color: $primaryColor;
    display: grid;
    place-items: center;
    font-weight: 900;
}

.content {
    padding: 32px;
}

.content:has(#background) {
    padding: 0;
}
</style>

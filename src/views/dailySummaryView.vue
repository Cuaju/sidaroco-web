<template>
    <section class="financeView">
        <header class="viewHeader">
            <h2>Daily summary</h2>
            <input type="date" v-model="selectedDate" @change="loadReport" />
        </header>

        <div class="grid">
            <div class="card">
                <div class="row">
                    <span>Total revenue</span>
                    <strong>{{ report?.totalIncome ?? "—" }}</strong>
                </div>
                <div class="row">
                    <span>Tickets sold</span>
                    <strong>{{ report?.totalTickets ?? "—" }}</strong>
                </div>
                <div class="row">
                    <span>Date</span>
                    <strong>{{ formatDate(selectedDate) }}</strong>
                </div>
            </div>

            <div class="tableCard">
                <table>
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Tickets</th>
                            <th>Income</th>
                        </tr>
                    </thead>
                    <tbody v-if="report && Object.keys(report.byRoute || {}).length">
                        <tr v-for="(data, routeId) in report.byRoute" :key="routeId">
                            <td class="routeCell">{{ routesMap[routeId] ?? `Route ${routeId}` }}</td>
                            <td class="numberCell">{{ data.tickets }}</td>
                            <td class="numberCell">{{ data.income }}</td>
                        </tr>
                    </tbody>

                    <tbody v-else>
                        <tr>
                            <td colspan="3" class="emptyState">
                                Insufficient data for selected period
                            </td>
                        </tr>
                    </tbody>

                </table>
            </div>
        </div>
    </section>
</template>

<script>
import { getDailyReport } from "@/services/ticketsApi";
import { getRoutes } from "@/services/routesApi";

export default {
    name: "dailySummaryView",
    data() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        return {
            selectedDate: `${yyyy}-${mm}-${dd}`,
            report: null,
            routesMap: {},
        };
    },

    async mounted() {
        const routes = await getRoutes();
        this.routesMap = Object.fromEntries(
            routes.map(r => [String(r.id), r.name ?? `Route ${r.id}`])
        );

        await this.loadReport();
    },
    methods: {
        async loadReport() {
            this.report = await getDailyReport(this.selectedDate, this.token);
        },
        formatDate(value) {
            if (!value) return "—";

            const [year, month, day] = value.split("T")[0].split("-");

            return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        }
    },
};
</script>

<style scoped lang="scss">
@use "@/styles/finance.scss";
</style>

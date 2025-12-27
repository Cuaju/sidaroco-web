<template>
    <section class="financeView">
        <header class="viewHeader">
            <h2>Monthly summary</h2>
            <input type="month" v-model="selectedMonth" @change="loadReport" />
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
                    <span>Period</span>
                    <strong>{{ formatMonthYear(report?.year, report?.month) }}</strong>
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
                    <tbody>
                        <tr v-for="(data, routeId) in report?.byRoute" :key="routeId">
                            <td>{{ routeId }}</td>
                            <td>{{ data.tickets }}</td>
                            <td>{{ data.income }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>
</template>

<script>
import { getMonthlyReport } from "@/services/ticketsApi";

export default {
    name: "monthlySummaryView",
    data() {
        return {
            selectedMonth: new Date().toISOString().substring(0, 7),
            report: null,
        };
    },
    mounted() {
        this.loadReport();
    },
    methods: {
        async loadReport() {
            const [year, month] = this.selectedMonth.split("-");
            this.report = await getMonthlyReport(year, month);
        },
        formatMonthYear(year, month) {
            if (!year || !month) return "—";

            const d = new Date(year, month - 1, 1);
            return d.toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
            });
        }
    },
};
</script>

<style scoped lang="scss">
@use "@/styles/finance.scss";
</style>

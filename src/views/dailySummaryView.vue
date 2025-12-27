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
                    <strong>{{ formatDate(report?.date) }}</strong>
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
import { getDailyReport } from "@/services/ticketsApi";

export default {
    name: "dailySummaryView",
    data() {
        return {
            selectedDate: new Date().toISOString().substring(0, 10),
            report: null,
        };
    },
    mounted() {
        this.loadReport();
    },
    methods: {
        async loadReport() {
            this.report = await getDailyReport(this.selectedDate);
        },
        formatDate(value) {
            if (!value) return "—";
            const d = new Date(value);
            return d.toLocaleDateString("es-MX", {
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

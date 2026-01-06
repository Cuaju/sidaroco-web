<template>
    <section class="financeView">
        <header class="viewHeader">
            <h2>Daily summary</h2>
            <input type="date" v-model="selectedDate" @change="loadReport" />
            <button v-if="hasData" class="pdfBtn" @click="downloadPdf">
                Download PDF
            </button>

            <span v-else class="noData">Insufficient data to export</span>

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
                    <strong>{{ formatDateEnglish(selectedDate) }}</strong>
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
import { buildFinanceReportPdf } from "@/utils/reportPDFBuilder";
import logo from "@/assets/images/logoBase64";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "dailySummaryView",
    computed: {
        hasData() {
            return (
                this.report &&
                Object.keys(this.report.byRoute || {}).length > 0
            );
        }
    },

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
            const auth = useAuthStore();
            this.report = await getDailyReport(this.selectedDate, auth.token);
        },
        formatDateEnglish(value) {
            if (!value) return "—";

            const [year, month, day] = value.split("-").map(Number);

            const d = new Date(year, month - 1, day);

            const suffix =
                day % 10 === 1 && day !== 11 ? "st" :
                    day % 10 === 2 && day !== 12 ? "nd" :
                        day % 10 === 3 && day !== 13 ? "rd" : "th";

            const monthName = d.toLocaleDateString("en-US", { month: "long" });

            return `${monthName} ${day}${suffix}, ${year}`;
        },

        formatTimestamp() {
            return new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC"
            }) + " UTC";
        },
        downloadPdf() {
            buildFinanceReportPdf({
                title: "Daily Summary",
                periodLabel: this.formatDateEnglish(this.selectedDate),
                queriedAt: this.formatTimestamp(),
                summary: [
                    { label: "Total revenue", value: this.report.totalIncome },
                    { label: "Tickets sold", value: this.report.totalTickets }
                ],
                tableHeaders: ["Route", "Tickets", "Income"],
                tableRows: Object.entries(this.report.byRoute).map(
                    ([routeId, data]) => [
                        this.routesMap[routeId],
                        data.tickets,
                        data.income
                    ]
                ),
                logoBase64: logo
            });
        }
    },
};
</script>

<style scoped lang="scss">
@use "@/styles/finance.scss";
</style>

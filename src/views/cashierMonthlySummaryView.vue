<template>
    <section class="financeView">
        <header class="viewHeader">
            <h2>Monthly cashier report</h2>

            <div class="filters">
                <select v-model="selectedCashier" @change="loadReport">
                    <option disabled value="">Select cashier</option>
                    <option v-for="c in cashiers" :key="c.id" :value="c.id">
                        {{ c.profile?.fullName || c.username }}
                    </option>
                </select>

                <input type="month" v-model="selectedMonth" @change="loadReport" />

            </div>
        </header>

        <div class="grid">
            <div class="card">
                <div class="row">
                    <span>Cashier</span>
                    <strong>{{ selectedCashierLabel }}</strong>
                </div>
                <div class="row">
                    <span>Tickets sold</span>
                    <strong>{{ summaryTickets }}</strong>
                </div>
                <div class="row">
                    <span>Total income</span>
                    <strong>{{ summaryTotal }}</strong>
                </div>
                <div class="row">
                    <span>Period</span>
                    <strong>{{ formatMonthEnglish(report?.year, report?.month) }}</strong>
                </div>
            </div>

            <div class="tableCard">
                <table>
                    <thead>
                        <tr>
                            <th>Cashier</th>
                            <th>Tickets</th>
                            <th>Income</th>
                        </tr>
                    </thead>
                    <tbody v-if="hasData">
                        <tr>
                            <td>{{ selectedCashierLabel }}</td>
                            <td class="numberCell">{{ summaryTickets }}</td>
                            <td class="numberCell">{{ summaryTotal }}</td>
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
import { getMonthlyReportByCashier } from "@/services/ticketsApi";
import { getAdminAccounts } from "@/services/usersApi";
import { useAuthStore } from "@/stores/authStore";
import { buildFinanceReportPdf } from "@/utils/reportPDFBuilder";
import logo from "@/assets/images/logoBase64";

export default {
    name: "cashierMonthlySummaryView",

    data() {
        const now = new Date();
        return {
            selectedMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
            selectedCashier: "",
            cashiers: [],
            report: null
        };
    },

    computed: {
        hasData() {
            return this.report && this.summaryTickets > 0;
        },
        summaryTickets() {
            if (!this.report || !this.selectedCashier) return "—";
            const c = this.report.cashiers.find(
                c => c.cashierId === this.selectedCashier
            );
            return c?.tickets ?? 0;
        },
        summaryTotal() {
            if (!this.report || !this.selectedCashier) return "—";
            const c = this.report.cashiers.find(
                c => c.cashierId === this.selectedCashier
            );
            return c?.total ?? 0;
        },
        selectedCashierLabel() {
            const c = this.cashiers.find(c => c.id === this.selectedCashier);
            if (!c) return "—";
            return c.profile?.fullName || c.username;
        }
    },

    async mounted() {
        const auth = useAuthStore();
        const out = await getAdminAccounts(auth.token);

        this.cashiers = (out.accounts || [])
            .filter(a => a.userType === "Cashier" && a.isActive);
    },

    methods: {
        async loadReport() {
            if (!this.selectedCashier) return;

            const auth = useAuthStore();
            const [year, month] = this.selectedMonth.split("-");

            this.report = await getMonthlyReportByCashier(
                year,
                month,
                this.selectedCashier,
                auth.token
            );
        },

        formatMonthEnglish(year, month) {
            if (!year || !month) return "—";
            return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric"
            });
        },

        formatTimestamp() {
            return new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "UTC"
            }) + " UTC";
        },

        downloadPdf() {
            const [year, month] = this.selectedMonth.split("-");
            buildFinanceReportPdf({
                title: "Monthly Cashier Summary",
                periodLabel: this.formatMonthEnglish(year, month),
                queriedAt: this.formatTimestamp(),
                summary: [
                    { label: "Cashier", value: this.selectedCashierLabel },
                    { label: "Tickets sold", value: this.summaryTickets },
                    { label: "Total income", value: this.summaryTotal }
                ],
                tableHeaders: ["Cashier", "Tickets", "Income"],
                tableRows: [[
                    this.selectedCashierLabel,
                    this.summaryTickets,
                    this.summaryTotal
                ]],
                logoBase64: logo
            });
        }
    }
};
</script>

<style scoped lang="scss">
@use "@/styles/finance.scss";
</style>

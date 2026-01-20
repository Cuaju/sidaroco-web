<template>
    <section class="financeView">
        <header class="viewHeader">
            <h2>Daily Cashier Cut</h2>
            <input type="date" v-model="selectedDate" @change="loadReport" />
        </header>

        <div v-if="loading" class="loadingState">
            <p>Loading cashier data...</p>
        </div>

        <div v-else-if="error" class="errorState">
            <p>{{ error }}</p>
            <button class="retryBtn" @click="loadReport">Retry</button>
        </div>

        <div v-else-if="!report || report.cashiers?.length === 0" class="emptyState">
            <p>No sales recorded for {{ formatDateEnglish(selectedDate) }}</p>
        </div>

        <div v-else class="cashierCutContent">
            <!-- Summary Cards -->
            <div class="summaryRow">
                <div class="summaryCard">
                    <span class="summaryLabel">Total Cashiers</span>
                    <span class="summaryValue">{{ report.cashiers.length }}</span>
                </div>
                <div class="summaryCard">
                    <span class="summaryLabel">Total Tickets Sold</span>
                    <span class="summaryValue">{{ totalTickets }}</span>
                </div>
                <div class="summaryCard">
                    <span class="summaryLabel">Total Revenue</span>
                    <span class="summaryValue">${{ formatPrice(totalRevenue) }}</span>
                </div>
                <div class="summaryCard cash">
                    <span class="summaryLabel">Cash Total</span>
                    <span class="summaryValue">${{ formatPrice(totalCash) }}</span>
                </div>
                <div class="summaryCard card">
                    <span class="summaryLabel">Card Total</span>
                    <span class="summaryValue">${{ formatPrice(totalCard) }}</span>
                </div>
            </div>

            <!-- Cashier Sections -->
            <div class="cashiersList">
                <div v-for="cashier in report.cashiers" :key="cashier.cashierId" class="cashierSection">
                    <div class="cashierHeader" @click="toggleCashier(cashier.cashierId)">
                        <div class="cashierInfo">
                            <span class="cashierName">{{ cashier.cashierName }}</span>
                            <span class="cashierId">ID: {{ cashier.cashierId }}</span>
                        </div>
                        <div class="cashierStats">
                            <span class="statBadge tickets">{{ cashier.totalTickets }} tickets</span>
                            <span class="statBadge revenue">${{ formatPrice(cashier.totalIncome) }}</span>
                        </div>
                        <span class="expandIcon" :class="{ expanded: expandedCashiers[cashier.cashierId] }">
                            ▼
                        </span>
                    </div>

                    <div v-if="expandedCashiers[cashier.cashierId]" class="cashierDetails">
                        <!-- Cash Section -->
                        <div v-if="cashier.byPaymentMethod?.CASH" class="paymentSection cash">
                            <div class="paymentHeader">
                                <span class="paymentIcon">U</span>
                                <h4>Cash Payments</h4>
                            </div>
                            <div class="paymentGrid">
                                <div class="paymentStat">
                                    <span class="label">Tickets</span>
                                    <span class="value">{{ cashier.byPaymentMethod.CASH.tickets }}</span>
                                </div>
                                <div class="paymentStat">
                                    <span class="label">Total Sales</span>
                                    <span class="value">${{ formatPrice(cashier.byPaymentMethod.CASH.total) }}</span>
                                </div>
                                <div class="paymentStat highlight">
                                    <span class="label">Cash Received</span>
                                    <span class="value">${{ formatPrice(cashier.byPaymentMethod.CASH.amountReceived)
                                        }}</span>
                                </div>
                                <div class="paymentStat change">
                                    <span class="label">Change Given</span>
                                    <span class="value">-${{ formatPrice(cashier.byPaymentMethod.CASH.changeGiven)
                                        }}</span>
                                </div>
                            </div>
                            <div class="cashToDeliver">
                                <span class="label">Cash to Deliver</span>
                                <span class="value">${{ formatPrice(cashToDeliver(cashier)) }}</span>
                            </div>
                        </div>

                        <!-- Card Section -->
                        <div v-if="cashier.byPaymentMethod?.CARD" class="paymentSection card">
                            <div class="paymentHeader">
                                <span class="paymentIcon">Card</span>
                                <h4>Card Payments</h4>
                            </div>
                            <div class="paymentGrid">
                                <div class="paymentStat">
                                    <span class="label">Tickets</span>
                                    <span class="value">{{ cashier.byPaymentMethod.CARD.tickets }}</span>
                                </div>
                                <div class="paymentStat">
                                    <span class="label">Total</span>
                                    <span class="value">${{ formatPrice(cashier.byPaymentMethod.CARD.total) }}</span>
                                </div>
                            </div>

                            <!-- Card Transactions Table -->
                            <div v-if="cashier.byPaymentMethod.CARD.transactions?.length" class="transactionsTable">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Ticket ID</th>
                                            <th>Card (Last 4)</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="tx in cashier.byPaymentMethod.CARD.transactions" :key="tx.ticketId">
                                            <td>#{{ tx.ticketId }}</td>
                                            <td class="cardRef">****{{ tx.last4 }}</td>
                                            <td>${{ formatPrice(tx.amount) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- No Sales -->
                        <div v-if="!cashier.byPaymentMethod?.CASH && !cashier.byPaymentMethod?.CARD" class="noSales">
                            <p>No detailed payment information available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { getDailyCashierCut } from "@/services/ticketsApi";
import { useAuthStore } from "@/stores/authStore";

export default {
    name: "cashierDailyCutView",

    data() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        return {
            selectedDate: `${yyyy}-${mm}-${dd}`,
            report: null,
            loading: false,
            error: null,
            expandedCashiers: {}
        };
    },

    computed: {
        totalTickets() {
            if (!this.report?.cashiers) return 0;
            return this.report.cashiers.reduce((sum, c) => sum + (c.totalTickets || 0), 0);
        },
        totalRevenue() {
            if (!this.report?.cashiers) return 0;
            return this.report.cashiers.reduce((sum, c) => sum + (c.totalIncome || 0), 0);
        },
        totalCash() {
            if (!this.report?.cashiers) return 0;
            return this.report.cashiers.reduce((sum, c) => {
                return sum + (c.byPaymentMethod?.CASH?.total || 0);
            }, 0);
        },
        totalCard() {
            if (!this.report?.cashiers) return 0;
            return this.report.cashiers.reduce((sum, c) => {
                return sum + (c.byPaymentMethod?.CARD?.total || 0);
            }, 0);
        }
    },

    async mounted() {
        await this.loadReport();
    },

    methods: {
        async loadReport() {
            this.loading = true;
            this.error = null;

            try {
                const auth = useAuthStore();
                this.report = await getDailyCashierCut(this.selectedDate, auth.token);

                // Auto-expand first cashier if only one
                if (this.report?.cashiers?.length === 1) {
                    this.expandedCashiers[this.report.cashiers[0].cashierId] = true;
                }
            } catch (err) {
                console.error("Error loading cashier cut:", err);
                this.error = err.message || "Failed to load cashier data";
            } finally {
                this.loading = false;
            }
        },

        toggleCashier(cashierId) {
            this.expandedCashiers[cashierId] = !this.expandedCashiers[cashierId];
        },

        cashToDeliver(cashier) {
            const cash = cashier.byPaymentMethod?.CASH;
            if (!cash) return 0;
            // Cash to deliver = amountReceived - changeGiven = total sales in cash
            return cash.total || 0;
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

        formatPrice(value) {
            if (value === null || value === undefined) return "0.00";
            return Number(value).toFixed(2);
        }
    }
};
</script>

<style scoped lang="scss">
@use "@/styles/colors.scss" as *;

.financeView {
    width: 96vw;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 16px;
}

.viewHeader {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 28px;
    flex-wrap: wrap;

    h2 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 900;
        color: $primaryColor;
    }

    input[type="date"] {
        height: 44px;
        padding: 0 14px;
        border-radius: 10px;
        border: 1px solid rgba($primaryColor, 0.2);
        background: white;
        font-size: 1rem;
        font-weight: 600;
        color: $primaryColor;
        font-family: inherit;
        outline: none;

        &:focus {
            border-color: $secondaryColor;
            box-shadow: 0 0 0 3px rgba($secondaryColor, 0.15);
        }
    }
}

.loadingState,
.errorState,
.emptyState {
    padding: 60px 40px;
    background: white;
    border-radius: 16px;
    text-align: center;
    color: rgba($primaryColor, 0.5);
    font-weight: 600;
    font-size: 1.1rem;
}

.errorState {
    color: #dc3545;
}

.retryBtn {
    margin-top: 16px;
    padding: 12px 24px;
    border-radius: 10px;
    border: none;
    background: $secondaryColor;
    color: white;
    font-weight: 700;
    cursor: pointer;
}

// Summary Row
.summaryRow {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
}

.summaryCard {
    background: white;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    gap: 8px;

    .summaryLabel {
        font-size: 0.85rem;
        font-weight: 700;
        color: rgba($primaryColor, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .summaryValue {
        font-size: 1.6rem;
        font-weight: 900;
        color: $primaryColor;
    }

    &.cash {
        border-left: 4px solid #28a745;

        .summaryValue {
            color: #28a745;
        }
    }

    &.card {
        border-left: 4px solid #007bff;

        .summaryValue {
            color: #007bff;
        }
    }
}

// Cashiers List
.cashiersList {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.cashierSection {
    background: white;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
}

.cashierHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px 24px;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: rgba($primaryColor, 0.02);
    }
}

.cashierInfo {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .cashierName {
        font-size: 1.2rem;
        font-weight: 800;
        color: $primaryColor;
    }

    .cashierId {
        font-size: 0.8rem;
        color: rgba($primaryColor, 0.5);
        font-weight: 600;
    }
}

.cashierStats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.statBadge {
    padding: 8px 14px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.9rem;

    &.tickets {
        background: rgba($thirdColor, 0.2);
        color: darken($thirdColor, 15%);
    }

    &.revenue {
        background: rgba($secondaryColor, 0.15);
        color: $secondaryColor;
    }
}

.expandIcon {
    font-size: 0.9rem;
    color: rgba($primaryColor, 0.4);
    transition: transform 0.2s ease;

    &.expanded {
        transform: rotate(180deg);
    }
}

// Cashier Details
.cashierDetails {
    padding: 0 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-top: 1px solid rgba($primaryColor, 0.08);
    padding-top: 20px;
}

.paymentSection {
    padding: 20px;
    border-radius: 12px;

    &.cash {
        background: rgba(40, 167, 69, 0.06);
        border: 1px solid rgba(40, 167, 69, 0.15);
    }

    &.card {
        background: rgba(0, 123, 255, 0.06);
        border: 1px solid rgba(0, 123, 255, 0.15);
    }
}

.paymentHeader {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;

    .paymentIcon {
        font-size: 1.4rem;
    }

    h4 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: $primaryColor;
    }
}

.paymentGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.paymentStat {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
        font-size: 0.75rem;
        font-weight: 700;
        color: rgba($primaryColor, 0.5);
        text-transform: uppercase;
    }

    .value {
        font-size: 1.2rem;
        font-weight: 800;
        color: $primaryColor;
    }

    &.highlight .value {
        color: #28a745;
    }

    &.change .value {
        color: #dc3545;
    }
}

.cashToDeliver {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(40, 167, 69, 0.15);
    border-radius: 10px;
    margin-top: 8px;

    .label {
        font-weight: 800;
        color: $primaryColor;
        font-size: 1rem;
    }

    .value {
        font-size: 1.4rem;
        font-weight: 900;
        color: #28a745;
    }
}

// Transactions Table
.transactionsTable {
    margin-top: 12px;
    overflow-x: auto;

    table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
    }

    th,
    td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid rgba($primaryColor, 0.08);
    }

    th {
        font-weight: 700;
        color: rgba($primaryColor, 0.6);
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.5px;
    }

    td {
        font-weight: 600;
        color: $primaryColor;
    }

    .cardRef {
        font-family: monospace;
        font-size: 0.95rem;
        color: #007bff;
    }
}

.noSales {
    padding: 20px;
    text-align: center;
    color: rgba($primaryColor, 0.4);
    font-weight: 600;
}

@media (max-width: 600px) {
    .cashierHeader {
        flex-direction: column;
        align-items: flex-start;
    }

    .cashierStats {
        width: 100%;
    }

    .paymentGrid {
        grid-template-columns: 1fr 1fr;
    }
}
</style>

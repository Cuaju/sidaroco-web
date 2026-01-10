<template>
  <section class="financeView">
    <header class="viewHeader">
      <h2>Monthly route report</h2>

      <div class="filters">
        <select v-model="selectedRoute" @change="loadReport">
          <option disabled value="">Select route</option>
          <option v-for="r in routes" :key="r.id" :value="r.id">
            {{ r.origin.name }} → {{ r.destination.name }}
          </option>
        </select>

        <input type="month" v-model="selectedMonth" @change="loadReport" />

        <button v-if="hasData" class="pdfBtn" @click="downloadPdf">
          Download PDF
        </button>

        <span v-else class="noData">Insufficient data to export</span>
      </div>
    </header>

    <div class="grid">
      <div class="card">
        <div class="row">
          <span>Route</span>
          <strong>{{ selectedRouteLabel }}</strong>
        </div>
        <div class="row">
          <span>Tickets sold</span>
          <strong>{{ report?.totalTickets ?? "—" }}</strong>
        </div>
        <div class="row">
          <span>Total income</span>
          <strong>{{ report?.totalIncome ?? "—" }}</strong>
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
              <th>Route</th>
              <th>Tickets</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody v-if="hasData">
            <tr>
              <td class="routeCell">{{ selectedRouteLabel }}</td>
              <td class="numberCell">{{ report.totalTickets }}</td>
              <td class="numberCell">{{ report.totalIncome }}</td>
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
import { getMonthlyReportByRoute } from "@/services/ticketsApi";
import { getRoutes } from "@/services/routesApi";
import { buildFinanceReportPdf } from "@/utils/reportPDFBuilder";
import logo from "@/assets/images/logoBase64";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "routeMonthlySummaryView",
  computed: {
    hasData() {
      return this.report && this.report.totalTickets > 0;
    },
    selectedRouteLabel() {
      const r = this.routes.find(r => r.id === this.selectedRoute);
      if (!r) return "—";
      return `${r.origin.name} -> ${r.destination.name}`;
    }
  },

  data() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return {
      selectedMonth: `${yyyy}-${mm}`,
      selectedRoute: "",
      report: null,
      routes: [],
    };
  },
  async mounted() {
    const routes = await getRoutes({ take: 100 });

    this.routes = routes.sort((a, b) => {
      const aLabel = `${a.origin.name} -> ${a.destination.name}`.toLowerCase();
      const bLabel = `${b.origin.name} -> ${b.destination.name}`.toLowerCase();
      return aLabel.localeCompare(bLabel);
    });
  },
  methods: {
    async loadReport() {
      if (!this.selectedRoute) return;
      const auth = useAuthStore();
      const [year, month] = this.selectedMonth.split("-");
      this.report = await getMonthlyReportByRoute(
        year,
        month,
        this.selectedRoute,
        auth.token
      );
    },
    formatDateEnglish(value) {
      if (!value) return "—";

      const d = new Date(value);

      const day = d.getDate();
      const suffix =
        day % 10 === 1 && day !== 11 ? "st" :
          day % 10 === 2 && day !== 12 ? "nd" :
            day % 10 === 3 && day !== 13 ? "rd" : "th";

      return `${d.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      })} ${day}${suffix}, ${d.getFullYear()}`;
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
      const route = this.routes.find(r => r.id === this.selectedRoute);

      const routeName = route
        ? `${route.origin.name} -> ${route.destination.name}`
        : `Route ${this.selectedRoute}`;
      buildFinanceReportPdf({
        title: "Monthly Route Summary",
        periodLabel: this.formatMonthEnglish(year, month),
        queriedAt: this.formatTimestamp(),
        summary: [
          { label: "Route", value: routeName },
          { label: "Tickets sold", value: this.report.totalTickets },
          { label: "Total income", value: this.report.totalIncome }
        ],
        tableHeaders: ["Route", "Tickets", "Income"],
        tableRows: [[
          routeName,
          this.report.totalTickets,
          this.report.totalIncome
        ]],
        logoBase64: logo
      });
    }
  },
};
</script>

<style scoped lang="scss">
@use "@/styles/finance.scss";
</style>

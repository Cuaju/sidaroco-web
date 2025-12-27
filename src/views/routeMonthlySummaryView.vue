<template>
  <section class="financeView">
    <header class="viewHeader">
      <h2>Monthly route report</h2>

      <div class="filters">
        <select v-model="selectedRoute" @change="loadReport">
          <option disabled value="">Select route</option>
          <option v-for="r in routes" :key="r.id" :value="r.id">
            {{ r.name ?? `Route ${r.id}` }}
          </option>
        </select>

        <input type="month" v-model="selectedMonth" @change="loadReport" />
      </div>
    </header>

    <div class="card">
      <div class="row">
        <span>Route</span>
        <strong>{{ report?.routeId ?? "—" }}</strong>
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
        <strong>{{ report ? `${report.year}-${report.month}` : "—" }}</strong>
      </div>
    </div>
  </section>
</template>

<script>
import { getMonthlyReportByRoute } from "@/services/ticketsApi";
import { getRoutes } from "@/services/routesApi";

export default {
  name: "routeMonthlySummaryView",
  data() {
    return {
      selectedMonth: new Date().toISOString().substring(0, 7),
      selectedRoute: "",
      report: null,
      routes: [],
    };
  },
  async mounted() {
    this.routes = await getRoutes();
  },
  methods: {
    async loadReport() {
      if (!this.selectedRoute) return;
      const [year, month] = this.selectedMonth.split("-");
      this.report = await getMonthlyReportByRoute(
        year,
        month,
        this.selectedRoute
      );
    },
  },
};
</script>

<style scoped lang="scss">
@use "@/styles/finance.scss";
</style>

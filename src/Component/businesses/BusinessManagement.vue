<script setup>
import BusinessManagementHeader from "@/Component/businesses/BusinessManagementHeader.vue";
import BusinessOverviewPage from "@/Page/businesses/BusinessOverviewPage.vue";
import BusinessAgendaPage from "@/Page/businesses/BusinessAgendaPage.vue";
import BusinessServicesPage from "@/Page/businesses/BusinessServicesPage.vue";
import BusinessTeamPage from "@/Page/businesses/BusinessTeamPage.vue";
import BusinessResourcesPage from "@/Page/businesses/BusinessResourcesPage.vue";
import BusinessHoursPage from "@/Page/businesses/BusinessHoursPage.vue";
import BusinessClientsPage from "@/Page/businesses/BusinessClientsPage.vue";
import BusinessPaymentsPage from "@/Page/businesses/BusinessPaymentsPage.vue";
import BusinessReportsPage from "@/Page/businesses/BusinessReportsPage.vue";
import BusinessPromotionsPage from "@/Page/businesses/BusinessPromotionsPage.vue";
import BusinessSettingsPage from "@/Page/businesses/BusinessSettingsPage.vue";
import RecordEditorDialog from "@/Component/businesses/RecordEditorDialog.vue";
import CreateBookingDialog from "@/Component/businesses/CreateBookingDialog.vue";
import BookingDetailsDialog from "@/Component/businesses/BookingDetailsDialog.vue";
import DeleteRecordDialog from "@/Component/businesses/DeleteRecordDialog.vue";
import { provideBusinessManagement } from "../../Composable/businesses/businessContext.js";
const { state } = provideBusinessManagement();
</script>
<template>
  <div>
    <BusinessManagementHeader />

    <BusinessOverviewPage v-if="state.view === 'overview'" />

    <BusinessAgendaPage v-if="state.view === 'agenda'" />

    <BusinessServicesPage v-if="state.view === 'services'" />

    <BusinessTeamPage v-if="state.view === 'team'" />

    <BusinessResourcesPage v-if="state.view === 'resources'" />

    <BusinessHoursPage v-if="state.view === 'schedule'" />

    <BusinessClientsPage v-if="state.view === 'clients'" />

    <BusinessPaymentsPage v-if="state.view === 'payments'" />

    <BusinessReportsPage v-if="state.view === 'reports'" />

    <BusinessPromotionsPage v-if="state.view === 'promotions'" />

    <BusinessSettingsPage v-if="state.view === 'settings'" />

    <RecordEditorDialog />

    <CreateBookingDialog />

    <BookingDetailsDialog />

    <DeleteRecordDialog />
  </div>
</template>

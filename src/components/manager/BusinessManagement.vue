<script setup lang="ts">
import BusinessManagementHeader from "@/components/manager/BusinessManagementHeader.vue";
import BusinessOverviewPage from "@/views/manager/BusinessOverviewPage.vue";
import BusinessAgendaPage from "@/views/manager/BusinessAgendaPage.vue";
import BusinessServicesPage from "@/views/manager/BusinessServicesPage.vue";
import BusinessTeamPage from "@/views/manager/BusinessTeamPage.vue";
import BusinessResourcesPage from "@/views/manager/BusinessResourcesPage.vue";
import BusinessHoursPage from "@/views/manager/BusinessHoursPage.vue";
import BusinessClientsPage from "@/views/manager/BusinessClientsPage.vue";
import BusinessPaymentsPage from "@/views/manager/BusinessPaymentsPage.vue";
import BusinessReportsPage from "@/views/manager/BusinessReportsPage.vue";
import BusinessPromotionsPage from "@/views/manager/BusinessPromotionsPage.vue";
import BusinessSettingsPage from "@/views/manager/BusinessSettingsPage.vue";
import RecordEditorDialog from "@/components/manager/RecordEditorDialog.vue";
import CreateBookingDialog from "@/components/manager/CreateBookingDialog.vue";
import BookingDetailsDialog from "@/components/manager/BookingDetailsDialog.vue";
import DeleteRecordDialog from "@/components/manager/DeleteRecordDialog.vue";
import { provideBusinessManagement } from "@/composables/businesses/businessContext.ts";
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

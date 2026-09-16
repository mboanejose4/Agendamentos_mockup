<script setup lang="ts">
import AccountManagementHeader from "@/components/shared/account/AccountManagementHeader.vue";
import MyAppointmentsPage from "@/views/client/MyAppointmentsPage.vue";
import NotificationsPage from "@/views/shared/NotificationsPage.vue";
import ProfilePage from "@/views/shared/ProfilePage.vue";
import ProfessionalAgendaPage from "@/views/staff/ProfessionalAgendaPage.vue";
import ProfessionalServicesPage from "@/views/staff/ProfessionalServicesPage.vue";
import ProfessionalAvailabilityPage from "@/views/staff/ProfessionalAvailabilityPage.vue";
import ProfessionalHistoryPage from "@/views/staff/ProfessionalHistoryPage.vue";
import AppointmentDetailsDialog from "@/components/shared/account/AppointmentDetailsDialog.vue";
import AvailabilityBlockDialog from "@/components/staff/AvailabilityBlockDialog.vue";
import StaffBookingDialog from "@/components/staff/StaffBookingDialog.vue";
import DeleteAvailabilityBlockDialog from "@/components/staff/DeleteAvailabilityBlockDialog.vue";
import { provideAccountManagement } from "@/composables/account/accountContext.ts";
const { state } = provideAccountManagement();
</script>
<template>
  <div>
    <AccountManagementHeader />

    <MyAppointmentsPage v-if="state.view === 'appointments'" />

    <NotificationsPage v-if="state.view === 'notifications'" />

    <ProfilePage v-if="state.view === 'profile'" />

    <ProfessionalAgendaPage v-if="state.view === 'professional-agenda'" />

    <ProfessionalServicesPage v-if="state.view === 'professional-services'" />

    <ProfessionalAvailabilityPage
      v-if="state.view === 'professional-schedule'"
    />

    <ProfessionalHistoryPage v-if="state.view === 'professional-history'" />

    <AppointmentDetailsDialog />
    <AvailabilityBlockDialog />
    <StaffBookingDialog />
    <DeleteAvailabilityBlockDialog />
  </div>
</template>

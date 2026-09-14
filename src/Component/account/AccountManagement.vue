<script setup>
import AccountManagementHeader from "@/Component/account/AccountManagementHeader.vue";
import MyAppointmentsPage from "@/Page/account/MyAppointmentsPage.vue";
import NotificationsPage from "@/Page/account/NotificationsPage.vue";
import ProfilePage from "@/Page/account/ProfilePage.vue";
import ProfessionalAgendaPage from "@/Page/account/ProfessionalAgendaPage.vue";
import ProfessionalServicesPage from "@/Page/account/ProfessionalServicesPage.vue";
import ProfessionalAvailabilityPage from "@/Page/account/ProfessionalAvailabilityPage.vue";
import ProfessionalHistoryPage from "@/Page/account/ProfessionalHistoryPage.vue";
import AppointmentDetailsDialog from "@/Component/account/AppointmentDetailsDialog.vue";
import AvailabilityBlockDialog from "@/Component/account/AvailabilityBlockDialog.vue";
import DeleteAvailabilityBlockDialog from "@/Component/account/DeleteAvailabilityBlockDialog.vue";
import { provideAccountManagement } from "../../Composable/account/accountContext.js";
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
    <DeleteAvailabilityBlockDialog />
  </div>
</template>

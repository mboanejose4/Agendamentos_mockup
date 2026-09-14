<script setup>
import PlatformManagementHeader from "@/Component/platform/PlatformManagementHeader.vue";
import PlatformOverviewPage from "@/Page/platform/PlatformOverviewPage.vue";
import CompaniesPage from "@/Page/platform/CompaniesPage.vue";
import UsersPage from "@/Page/platform/UsersPage.vue";
import PlatformSettingsPage from "@/Page/platform/PlatformSettingsPage.vue";
import ActivityMonitoringPage from "@/Page/platform/ActivityMonitoringPage.vue";
import SupportPage from "@/Page/platform/SupportPage.vue";
import CompanyEditorDialog from "@/Component/platform/CompanyEditorDialog.vue";
import UserEditorDialog from "@/Component/platform/UserEditorDialog.vue";
import DeletePlatformRecordDialog from "@/Component/platform/DeletePlatformRecordDialog.vue";
import SupportTicketDialog from "@/Component/platform/SupportTicketDialog.vue";
import SupportReplyDialog from "@/Component/platform/SupportReplyDialog.vue";
import { providePlatformManagement } from "../../Composable/platform/platformContext.js";
const { state } = providePlatformManagement();
</script>
<template>
  <div>
    <PlatformManagementHeader />

    <PlatformOverviewPage v-if="state.view === 'platform-overview'" />

    <CompaniesPage v-if="state.view === 'companies'" />

    <UsersPage v-if="state.view === 'users'" />

    <PlatformSettingsPage v-if="state.view === 'platform-settings'" />

    <ActivityMonitoringPage v-if="state.view === 'monitoring'" />

    <SupportPage v-if="state.view === 'support'" />

    <CompanyEditorDialog />
    <UserEditorDialog />
    <DeletePlatformRecordDialog />
    <SupportTicketDialog />
    <SupportReplyDialog />
  </div>
</template>

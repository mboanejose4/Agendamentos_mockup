<script setup lang="ts">
import PlatformManagementHeader from "@/components/platform/PlatformManagementHeader.vue";
import PlatformOverviewPage from "@/views/platform/PlatformOverviewPage.vue";
import CompaniesPage from "@/views/platform/CompaniesPage.vue";
import UsersPage from "@/views/platform/UsersPage.vue";
import PlatformSettingsPage from "@/views/platform/PlatformSettingsPage.vue";
import ActivityMonitoringPage from "@/views/platform/ActivityMonitoringPage.vue";
import SupportPage from "@/views/platform/SupportPage.vue";
import CompanyEditorDialog from "@/components/platform/CompanyEditorDialog.vue";
import UserEditorDialog from "@/components/platform/UserEditorDialog.vue";
import DeletePlatformRecordDialog from "@/components/platform/DeletePlatformRecordDialog.vue";
import SupportTicketDialog from "@/components/platform/SupportTicketDialog.vue";
import SupportReplyDialog from "@/components/platform/SupportReplyDialog.vue";
import { providePlatformManagement } from "@/composables/platform/platformContext.ts";
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

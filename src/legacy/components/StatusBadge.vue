<template>
  <span class="status-badge" :class="statusClass">{{ status }}</span>
</template>
<script>
export default {
  name: "StatusBadge",
  props: { status: { type: String, required: true } },
  computed: {
    statusClass() {
      const s = this.status.toLowerCase();
      if (
        [
          "confirmada",
          "concluída",
          "activo",
          "aprovado",
          "liquidado",
          "online",
        ].some((x) => s.includes(x))
      )
        return "success";
      if (["pendente", "aguardando", "parcial"].some((x) => s.includes(x)))
        return "warning";
      if (["cancelada", "inactivo", "recusado"].some((x) => s.includes(x)))
        return "danger";
      return "neutral";
    },
  },
};
</script>

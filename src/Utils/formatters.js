export const money = (value = 0) =>
  `${new Intl.NumberFormat("pt-MZ", { maximumFractionDigits: 0 }).format(Number(value) || 0)} MT`;
export const dateLabel = (iso) =>
  iso
    ? new Intl.DateTimeFormat("pt-MZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${iso}T12:00:00`))
    : "";

/* Vocabulário fechado dos tipos de recurso.
   O identificador é guardado nos registos; o nome é o que a pessoa vê. Serviços
   e recursos escolhem da mesma lista, para que o tipo exigido por um serviço
   corresponda sempre ao tipo de um recurso existente. */
import type { ResourceTypeId } from "@/types/domain.ts";

export interface ResourceTypeOption {
  id: ResourceTypeId;
  name: string;
}

export const resourceTypes: readonly ResourceTypeOption[] = [
  { id: "room", name: "Sala" },
  { id: "table", name: "Mesa" },
  { id: "chair", name: "Cadeira" },
  { id: "equipment", name: "Equipamento" },
];

export const resourceTypeName = (
  type: ResourceTypeId | "" | undefined,
): string => resourceTypes.find((item) => item.id === type)?.name || type || "";

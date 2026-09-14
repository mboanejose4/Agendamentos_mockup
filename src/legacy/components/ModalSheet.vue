<template>
  <div v-if="store.modal" class="modal-backdrop" @click.self="closeModal">
    <section class="bottom-sheet action-sheet" role="dialog" aria-modal="true">
      <div class="sheet-handle"></div>
      <slot />
    </section>
  </div>
</template>
<script>
import { appStore as store, closeModal } from "../store.js";
export default {
  name: "ModalSheet",
  data: () => ({ store }),
  methods: { closeModal },
};
</script>

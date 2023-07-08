<script setup lang="ts">
import IntervalGameVue from '@/components/IntervalGame/IntervalGame.vue';
import PianoGameVue from '@/components/PianoGame.vue';
import PianoRollVue from '@/components/PianoRoll.vue';
import RegistrationVue from '@/components/Registration.vue';
import { useEnvStore } from '@/stores/env';
import { ref } from 'vue';
import Modal from '../components/Modal.vue';

const registrationIsOpen = ref(true);
</script>

<template>
  <main>
    <PianoRollVue style="width: 500px;" name-type="sharp" :key-width="50" :key-height="100" enable-audio />
    <PianoGameVue />
    <IntervalGameVue :level="0" range-start="C2" range-end="C4"/>
    <Modal
      v-if="registrationIsOpen" 
      title="Register" 
      fit-content
      content-padding="12px"
      no-footer
      @close="registrationIsOpen = false"
    >
      <RegistrationVue style="width: 200px;" />
    </Modal>
  </main>
</template>

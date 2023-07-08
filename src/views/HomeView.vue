<script setup lang="ts">
import IntervalGameVue from '@/components/IntervalGame/IntervalGame.vue';
import PianoGameVue from '@/components/PianoGame.vue';
import PianoRollVue from '@/components/PianoRoll.vue';
</script>

<template>
  <main>
    <PianoRollVue style="width: 500px;" name-type="sharp" :key-width="50" :key-height="100" enable-audio />
    <PianoGameVue />
    <IntervalGameVue :level="0" range-start="C2" range-end="C4"/>
  </main>
</template>

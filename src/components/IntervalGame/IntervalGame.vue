<script setup lang="ts">
import { getRandomNumber } from '@/utils/random';
import { computed } from '@vue/reactivity';
import { ref } from 'vue';
import { levelFunctions } from './games';

const props = defineProps<{
    level: number,
}>();

// Initialize level
const level = ref<number>(props.level);

// Control guess buttons
const shouldShowGuesses = ref<boolean>(false);
function showGuesses() {
    shouldShowGuesses.value = true;
}
function hideGuesses() {
    shouldShowGuesses.value = false;
}

// Initialize the function used to play the current level
const levelFunction = computed(() => {
    if (level.value >= levelFunctions.length) throw Error('level is out of range');
    return levelFunctions[level.value];
});

// Handle play button
const playing = ref<boolean>(false);
const handleGuess = ref<((guess: string) => string) | null>(null);
const intervalOptions = ref<string[]>([]);
function handleGuessWrapper(guess: string) {
    if (handleGuess.value === null) throw Error('handleGuess() was not initialized');
    hideGuesses();
    const incorrectExplanation = handleGuess.value(guess);
    if (incorrectExplanation) window.alert(incorrectExplanation);
    else window.alert('correct');
    playing.value = false;
}
async function play() {
    playing.value = true;
    level.value = getRandomNumber(0, levelFunctions.length - 1);
    const levelData = levelFunction.value(() => {
        showGuesses();
    });
    handleGuess.value = levelData.handleGuess;
    intervalOptions.value = levelData.intervalOptions;
}
</script>

<template>
    <div class="container">
        <button v-if="!playing" class="start" @click="play">Play</button>
        <template v-else-if="!shouldShowGuesses">{{ level }}</template>
        <button
            v-else
            v-for="interval in intervalOptions"
            :key="interval"
            @click="handleGuessWrapper(interval)"
        >
            {{ interval }}
        </button>
    </div>
</template>
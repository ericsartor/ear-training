<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import { useEnvStore } from './stores/env';

const envStore = useEnvStore();

const navOpen = ref(false);
const navHeight = ref('48px');
</script>

<template>
    
    <nav>
        <ul :class="{ open: navOpen }">
            <li>
                <RouterLink to="/">Home</RouterLink>
            </li>
            <li v-if="envStore.stage">
                <RouterLink to="/test">Test</RouterLink>
            </li>
        </ul>
        <button class="open" @click="navOpen = !navOpen">Open</button>
    </nav>

    <RouterView />
</template>

<style scoped>
nav {
    height: v-bind(navHeight);
}
nav > button.open {
    display: none;
}

nav > ul {
    display: flex;
    list-style-type: none;
}

@media (max-width: 600px) {
    nav > ul {
        --width: 100vw;
        position: fixed;
        flex-direction: column;
        width: var(--width);
        height: calc(100vh - v-bind(navHeight));
        right: var(--width);
        top: v-bind(navHeight);
        transition: right 0.5s;
        z-index: 1;
    }
    nav > ul.open {
        right: 0vw;
    }

    nav > button.open {
        display: block;
    }
}
</style>

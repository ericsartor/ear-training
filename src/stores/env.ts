import { defineStore } from "pinia";

export const useEnvStore = defineStore({
    id: 'env',
    state: () => ({
        nodeEnv: process.env.NODE_ENV,
    }),
    getters: {
        prod(state) {
            return state.nodeEnv === 'production';
        },
        stage(state) {
            return state.nodeEnv === 'development';
        },
    },
})
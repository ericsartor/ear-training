import { createNotePlayer } from "@/utils/notePlayer";
import { onUnmounted } from "vue";

export function useNotePlayer(maxGain: number = 1) {
    
    const notePlayer = createNotePlayer(maxGain);

    // Ensure we never leave audio playing or any routed nodes that aren't needed
    onUnmounted(() => {
        notePlayer.teardown();
    });

    return notePlayer;
};
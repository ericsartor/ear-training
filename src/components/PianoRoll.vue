<script setup lang="ts">
import { notes, type Note } from '@/utils/notes';
import { ref } from 'vue';
import { useEventListener, useMousePressed } from '@vueuse/core';
import { useNotePlayer } from '@/composables/useNotePlayer';

const emit = defineEmits<{
  (e: 'note', note: Note): void
}>();

const props = defineProps<{
    nameType: 'sharp' | 'flat'
    keyWidth: number
    keyHeight: number
    rangeStart?: {
        name: string
        octave: number
    }
    rangeEnd?: {
        name: string
        octave: number
    }
    enableAudio?: boolean
    enableKeyboard?: boolean
}>();

// Validate range notes
if (props.rangeStart?.name.length !== 1) throw Error('rangeStart note must be a natural');
if (props.rangeEnd?.name.length !== 1) throw Error('rangeStart note must be a natural');

// Create note groups
const noteRange = (() => {
    const rangeStart = props.rangeStart;
    const rangeEnd = props.rangeEnd;
    if (rangeStart !== undefined && rangeEnd !== undefined) {
        const rangeStartIndex = notes.findIndex((n) => {
            return (n.flatName === rangeStart.name || n.sharpName === rangeStart.name) &&
                n.octave === rangeStart.octave;
        });
        if (rangeStartIndex === -1) throw Error(`invalid range start: ${JSON.stringify(rangeStart)}`)
        const rangeEndIndex = notes.findIndex((n) => {
            return (n.flatName === rangeEnd.name || n.sharpName === rangeEnd.name) &&
                n.octave === rangeEnd.octave;
        });
        if (rangeEndIndex === -1) throw Error(`invalid range end: ${JSON.stringify(props.rangeEnd)}`)
        return notes.slice(rangeStartIndex, rangeEndIndex + 1);
    }
    return notes;
})();
const naturals = noteRange.filter(({ sharpName }) => sharpName.length === 1);
const nonNaturals = noteRange.filter((note) => !naturals.includes(note));

// Key width
const naturalKeyWidth = props.keyWidth;
const nonNaturalKeyWidth = naturalKeyWidth / 2;

// Key height
const naturalKeyHeight = props.keyHeight;
const nonNaturalKeyHeight = naturalKeyHeight / 2;

// Helper for placing black keys
function getNonNaturalLeft(nonNatural: Note): number {
    const nextNatural = notes[notes.indexOf(nonNatural) + 1];
    const previousNatural = nextNatural ? null : notes[notes.indexOf(nonNatural) - 1];
    const naturalIndex = naturals.indexOf(nextNatural ?? previousNatural);
    const naturalLeft = naturalKeyWidth * naturalIndex;
    return nextNatural ? naturalLeft - (nonNaturalKeyWidth / 2) : naturalLeft + naturalKeyWidth - (nonNaturalKeyWidth / 2);
}

// Prepare note player
const notePlayer = useNotePlayer();
const activeNote = ref<Note | null>(null);
function startNote(note: Note) {
    activeNote.value = note;
    if (props.enableAudio === true) notePlayer.startNote(note);
    emit('note', note);
}
function stopNote() {
    activeNote.value = null;
    if (props.enableAudio === true) notePlayer.stopNote();
}

// Track mouse for use on keys
const { pressed: mousePressed } = useMousePressed();

// Set up keyboard
const whiteKeys = [
    'z',
    'x',
    'c',
    'v',
    'b',
    'n',
    'm',
    ',',
    '.',
    '/',
];
const blackKeys = [
    's',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    ';',
];
const keyMap: { [key: string]: Note } = {};
let lastNoteWasWhite = false;
for (const note of noteRange) {
    if (note.flatName.length === 1) {
        const key = whiteKeys.shift();
        if (key === undefined) break;
        if (lastNoteWasWhite) blackKeys.shift(); // Get rid of unused black key
        keyMap[key] = note;
        lastNoteWasWhite = true;
    } else {
        const key = blackKeys.shift();
        if (key === undefined) break;
        lastNoteWasWhite = false;
        keyMap[key] = note;
    }
}
useEventListener('keydown', (event) => {
    const key = event.key.toLowerCase().replace('key', '');
    if (!keyMap[key]) return;
    startNote(keyMap[key]);
});
useEventListener('keyup', (event) => {
    const key = event.key.toLowerCase().replace('key', '');
    if (!keyMap[key]) return;
    // stopNote(keyMap[key]);
    stopNote();
});
</script>

<template>
    <div class="container">
        <div class="keys">
            <div class="key natural"
                v-for="note in naturals"
                :key="note.frequency"
                :style="{
                    background: note.index === activeNote?.index ? 'red' : undefined,
                }"
                @mousedown="startNote(note)"
                @mouseenter="mousePressed && startNote(note)"
                @mouseup="stopNote"
                @mouseleave="stopNote"
            >
                <span class="name">
                    {{ props.nameType === 'sharp' ? note.sharpName : note.flatName }}
                    {{ note.octave }}
                </span>
            </div>
            <div class="key non-natural"
                v-for="note in nonNaturals"
                :key="note.frequency"
                :style="{
                    left: getNonNaturalLeft(note) + 'px',
                    background: note.index === activeNote?.index ? 'red' : undefined,
                }"
                @mousedown="startNote(note)"
                @mouseenter="mousePressed && startNote(note)"
                @mouseup="stopNote"
                @mouseleave="stopNote"
            >
                <span class="name">
                    {{ props.nameType === 'sharp' ? note.sharpName : note.flatName }}
                    {{ note.octave }}
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    overflow: scroll;
}

.keys {
    user-select: none;
    display: flex;
    flex-flow: row nowrap;
    position: relative;
    font-family: 'BenchNine';
}

.key {
    flex-shrink: 0;
}

.key:hover {
    background-color: yellow;
}

.key.natural {
    width: v-bind(naturalKeyWidth + 'px');
    height: v-bind(naturalKeyHeight + 'px');
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-end;
    align-items: center;
    background-color: white;
    border-right: 1px solid black;
    border-bottom: 1px solid black;
}
.key.natural:first-of-type {
    border-left: 1px solid black;
}

.key.non-natural {
    width: v-bind(nonNaturalKeyWidth + 'px');
    height: v-bind(nonNaturalKeyHeight + 'px');
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-end;
    text-align: center;
    position: absolute;
    top: 0;
    background-color: black;
    color: white;
}

.key.natural:hover {
    background-color: yellow;
}
.key.non-natural:hover {
    background-color: maroon;
}
</style>
import type { Note } from "@/utils/notes";

// Need to start as null and wait for user gesture to create context
let audioCtx: AudioContext | null = null;
let masterMerger: ChannelMergerNode | null = null;

// Define some constants for the WebAudio logic
const HARMONIC_GAIN_MULTIPLIER = 0.5; // Amount to reduce each harmonic's gain by
const HARMONIC_COUNT = 16; // Number of harmonics to generate
const TRANSIENT_FADE_TIME = 0.015; // Seconds to fade in/out when changing gain levels to avoid pops

export function createNotePlayer(maxGain = 1) {
    
    // Set up master gain which controls the muting of the oscillators
    let masterGain: GainNode | null = null

    // Set up audio routing logic
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    let routed = false;
    function routeAudio() {

        // Initialize after user gesture
        if (audioCtx === null) {
            audioCtx = new AudioContext();
            masterMerger = audioCtx.createChannelMerger(10);
            masterMerger.connect(audioCtx.destination);
        }
        masterGain = audioCtx.createGain();
        if (!masterMerger) throw Error('merger was not created');
        masterGain.connect(masterMerger);

        // Create nodes for each item in the harmonic series
        let gainAmount = maxGain;
        for (let i = 1; i <= HARMONIC_COUNT; i++) {

            // Create nodes
            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            // Track nodes
            oscillators.push(oscillator);
            gains.push(gain);

            // Set up oscillator
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(0, audioCtx.currentTime);
            oscillator.start();
            
            // Initialize gain with relative value
            gainAmount *= HARMONIC_GAIN_MULTIPLIER;
            gain.gain.setValueAtTime(gainAmount, audioCtx.currentTime);

            // Route nodes
            oscillator.connect(gain);
            gain.connect(masterGain);

        }

        routed = true;

    }

    // Define controls
    let playing = false;
    const getPlaying = () => playing;
    let currentNote: Note | null = null;
    const getCurrentNote = () => currentNote;
    function startNote(note: Note) {
        if (playing) return;
        if (!routed) routeAudio();
        if (!audioCtx) throw Error('no audio context');
        if (masterGain === null) throw Error('master gain wasnt initialized in startNote()');
        for (let i = 1; i <= HARMONIC_COUNT; i++) {
            oscillators[i - 1].frequency.setTargetAtTime(note.frequency * i, audioCtx.currentTime, TRANSIENT_FADE_TIME);
        }
        masterGain.gain.setTargetAtTime(1, audioCtx.currentTime, TRANSIENT_FADE_TIME);
        playing = true;
        currentNote = note;
    }
    function stopNote() {
        if (!playing) return;
        if (!routed) routeAudio();
        if (!audioCtx) throw Error('no audio context');
        if (masterGain === null) throw Error('master gain wasnt initialized in stopNote()');
        masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, TRANSIENT_FADE_TIME);
        playing = false;
        currentNote = null;
    }
    function playNoteForTime(note: Note, timeMs: number) {
        return new Promise<void>((resolve) => {
            if (!routed) routeAudio();
            startNote(note);
            setTimeout(() => {
                stopNote();
                resolve();
            }, timeMs);
        });
    }

    function teardown() {
        stopNote();
        oscillators.forEach((oscillator) =>{
            oscillator.disconnect()
        });
        gains.forEach((gain) =>{
            gain.disconnect()
        });
        masterGain?.disconnect();
    }

    return {
        getPlaying,
        getCurrentNote,
        startNote,
        stopNote,
        playNoteForTime,
        teardown,
        audioCtx,
    };
}
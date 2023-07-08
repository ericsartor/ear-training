import { createNotePlayer } from "@/utils/notePlayer";
import { generateIntervals, getInterval, getNoteRange, type Note } from "@/utils/notes";
import { getRandomFromArray } from "@/utils/random";
import { wait } from "@/utils/wait";

// Create note players
const firstNotePlayer = createNotePlayer(0.5);
const secondNotePlayer = createNotePlayer(0.5);

type LevelFunction = (callback: Function) => {
    intervalOptions: string[]
    handleGuess: (guess: string) => string
};

// Play one note, then the second note, with overlap
const levelGenerator = (
    noteRange: Note[],
    playFunction: (lowerNote: Note, higherNote: Note) => Promise<void>,
) => {

    return (callback: Function) => {

        // Generate notes
        const [ lowerNote, higherNote ] = [
            getRandomFromArray(noteRange), 
            getRandomFromArray(noteRange),
        ].sort((a, b) => a.index - b.index);
    
        // Play notes, then run callback
        (async () => {
            await playFunction(lowerNote, higherNote);
            callback();
        })();
    
        // Return data for game
        return {
    
            intervalOptions: generateIntervals(noteRange),

            handleGuess(intervalGuess: string) {
    
                // Get correct answer
                const interval = getInterval(lowerNote, higherNote);
    
                // Return empty string on correct guess
                if (intervalGuess === interval) {
                    return ''; // Correct
                }
    
                // Return explanation on incorrect answer
                return `Incorrect, it was ${interval} (${lowerNote.flatName + lowerNote.octave}`
                    + ` -> ${higherNote.flatName + higherNote.octave})`;
    
            },
            
        };
        
    };

};

export const levelFunctions: LevelFunction[] = [

    // One octave, notes play at same time
    levelGenerator(getNoteRange('C2', 'C3'), async (lowerNote: Note, higherNote: Note) => {
        const playTime = 4000;
        firstNotePlayer.playNoteForTime(lowerNote, playTime);
        await wait(playTime / 2);
        await secondNotePlayer.playNoteForTime(higherNote, playTime / 2);
    }),

    // Two octaves, notes play at same time
    levelGenerator(getNoteRange('C2', 'C4'), async (lowerNote: Note, higherNote: Note) => {
        const playTime = 4000;
        firstNotePlayer.playNoteForTime(lowerNote, playTime);
        await wait(playTime / 2);
        await secondNotePlayer.playNoteForTime(higherNote, playTime / 2);
    }),

    // One octave, notes play consecutively
    levelGenerator(getNoteRange('C2', 'C3'), async (lowerNote: Note, higherNote: Note) => {
        const playTime = 2000;
        await firstNotePlayer.playNoteForTime(lowerNote, playTime);
        await secondNotePlayer.playNoteForTime(higherNote, playTime);
    }),

    // Two octaves, notes play consecutively
    levelGenerator(getNoteRange('C2', 'C4'), async (lowerNote: Note, higherNote: Note) => {
        const playTime = 2000;
        await firstNotePlayer.playNoteForTime(lowerNote, playTime);
        await secondNotePlayer.playNoteForTime(higherNote, playTime);
    }),

    // One octave, notes play with a gap
    levelGenerator(getNoteRange('C2', 'C3'), async (lowerNote: Note, higherNote: Note) => {
        const playTime = 2000;
        await firstNotePlayer.playNoteForTime(lowerNote, playTime);
        await wait(playTime);
        await secondNotePlayer.playNoteForTime(higherNote, playTime);
    }),

    // Two octaves, notes play with a gap
    levelGenerator(getNoteRange('C2', 'C4'), async (lowerNote: Note, higherNote: Note) => {
        const playTime = 2000;
        await firstNotePlayer.playNoteForTime(lowerNote, playTime);
        await wait(playTime);
        await secondNotePlayer.playNoteForTime(higherNote, playTime);
    }),

];
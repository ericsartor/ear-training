export type Note = {
    frequency: number
    sharpName: string
    flatName: string
    index: number
    octave: number
};

const intervalTypes = [
    'P',
    'm',
    'M',
    'm',
    'M',
    'P',
    'd',
    'P',
    'm',
    'M',
    'm',
    'M',
];
const intervalDegrees = [
    1,
    2,
    2,
    3,
    3,
    4,
    5,
    5,
    6,
    6,
    7,
    7,
];

export const getInterval = (noteA: Note, noteB: Note): string => {
    const indexDelta = Math.abs(noteA.index - noteB.index);
    const degreeIndex = indexDelta % intervalTypes.length;
    const intervalType = intervalTypes[degreeIndex];
    const interval = intervalDegrees[degreeIndex] + (Math.floor(indexDelta / intervalDegrees.length) * 7);
    return `${intervalType}${interval}`;
};

export const generateIntervals = (noteRange: Note[]): string[] => {
    return noteRange.map((note) => getInterval(note, noteRange[0]));
};

// Generated below
export const notes: Note[] = [];

const parseNameAndOctave = (noteName: string): { name: string, octave: number } => {
    const match = noteName.match(/^([A-G][#b]?)([0-9]+)$/);
    if (match === null) throw Error('invalid note name');
    const [ _, name, octave] = match;
    return { name, octave: Number(octave) };
};

export const getNoteRange = (startNoteName: string, endNoteName: string) => {

    // Get indeces of both provided notes
    const [ startIndex, endIndex ] = [startNoteName, endNoteName].map((noteName) => {
        const { name, octave } = parseNameAndOctave(noteName);
        const index: number = notes.findIndex(
            (n) => (n.sharpName === name || n.flatName === name) && n.octave === octave,
        );
        if (index === -1) throw Error('invalid note');
        return index;
    });

    // Get note range
    return notes.slice(startIndex, endIndex + 1)

};

const sharpNoteNames = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const flatNoteNames = ['Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G'];
const SCIENTIFIC_PITCH_NOTATION_START_FREQUENCY = 16.35159; // Technically it's 16.35160, but there's a rounding error

// Generate notes from A440 (including 440) down to 16HZ
let frequency = 440;
let sharpName = 'A';
let flatName = 'A';
while (frequency >= SCIENTIFIC_PITCH_NOTATION_START_FREQUENCY) {

    // Create note
    notes.unshift({ frequency, sharpName, flatName, index: 0, octave: 0 });

    // Move frequency down
    frequency *= Math.pow(2, -1/12)

    // Move note names down (with wrapping)
    let nextSharpNoteIndex = sharpNoteNames.indexOf(sharpName) - 1;
    if (nextSharpNoteIndex < 0) nextSharpNoteIndex = sharpNoteNames.length - 1;
    sharpName = sharpNoteNames[nextSharpNoteIndex];
    let nextFlatNoteIndex = flatNoteNames.indexOf(flatName) - 1;
    if (nextFlatNoteIndex < 0) nextFlatNoteIndex = flatNoteNames.length - 1;
    flatName = flatNoteNames[nextFlatNoteIndex];
}

// Generate notes from A440 (Excluding 440) up to the 8000HZ
frequency = 440;
sharpName = 'A';
flatName = 'A';
while (frequency < 8000) {
    // Move frequency up
    frequency *= Math.pow(2, 1/12)

    // Move note name up (with wrapping)
    let nextSharpNoteIndex = sharpNoteNames.indexOf(sharpName) + 1;
    if (nextSharpNoteIndex > sharpNoteNames.length - 1) nextSharpNoteIndex = 0;
    sharpName = sharpNoteNames[nextSharpNoteIndex];
    let nextFlatNoteIndex = flatNoteNames.indexOf(flatName) + 1;
    if (nextFlatNoteIndex > flatNoteNames.length - 1) nextFlatNoteIndex = 0;
    flatName = flatNoteNames[nextFlatNoteIndex];

    // Create note
    notes.push({ frequency, sharpName, flatName, index: 0, octave: 0 });
}

// Index notes and add octaves
notes.forEach((note, i) => {
    note.octave = notes.filter((n) => n.sharpName === note.sharpName).indexOf(note);
    note.index = i;
});
const simpleWeek = {
    monday: {},
    tuesday: {},
    wednesday: {},
    thursday: {},
    friday: {},
    saturday: {},
    sunday: {},
};
const initialprogram = {
    p1: { ...simpleWeek },
    p2: { ...simpleWeek },
    p3: { ...simpleWeek },
    p4: { ...simpleWeek },
};

export default function generatetimeTable(program) {
    if (typeof program !== "object") return initialprogram;
    const newProgram = {};

    for (const key in initialprogram)
        newProgram[key] = program[key] || initialprogram[key];

    for (const key in initialprogram)
        for (const subKey in initialprogram[key])
            newProgram[key][subKey] =
                newProgram[key][subKey] || initialprogram[key][subKey];

    return newProgram;
}

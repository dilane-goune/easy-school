export default function timeGenerator(time) {
    const hours = "" + parseInt(time / 3600000);

    let remenderHrs = time / 3600000 - hours;
    const minutes = `${parseInt(remenderHrs * 60)}`.padStart(2, "0");

    const renderMins = remenderHrs * 60 - minutes;

    const seconds = `${parseInt(renderMins * 60)}`.padStart(2, "0");
    return { hours, minutes, seconds };
}

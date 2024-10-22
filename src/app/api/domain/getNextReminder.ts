export const getNextReminderTimestamp = (startTimestamp: number, frequencyInDays: number): number => {
    const frequencyInMillis = frequencyInDays * 24 * 60 * 60 * 1000;
    const currentTime = Date.now(); // Current time in milliseconds

    // If the startTimestamp is still in the future, return it directly
    if (startTimestamp > currentTime) {
        return startTimestamp;
    }

    let nextReminder = startTimestamp;

    // Increment nextReminder by frequencyInMillis until it is in the future
    while (nextReminder <= currentTime) {
        nextReminder += frequencyInMillis;
    }

    return nextReminder;
};


export const countDays = (startTimestamp: number, endTimestamp: number): number => {
    const differenceInMilliseconds = endTimestamp - startTimestamp;
    const differenceInDays = Math.ceil(differenceInMilliseconds / (24 * 60 * 60 * 1000));
    return differenceInDays;
}
export const getNextReminderTimestamp = (startTimestamp: number, frequencyInDays: number): number => {
    const frequencyInMillis = frequencyInDays * 24 * 60 * 60 * 1000;
    const currentTime = Date.now();

    if (startTimestamp > currentTime) {
        return startTimestamp;
    }

    let nextReminder = startTimestamp;
    while (nextReminder <= currentTime) {
        nextReminder += frequencyInMillis;
    }

    return nextReminder;
};

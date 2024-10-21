export const getNextReminderTimestamp = (startTimestamp: number, frequencyInDays: number): number => {
    const frequencyInMillis = frequencyInDays * 24 * 60 * 60 * 1000;
    const currentTimeMinusOneDay = Date.now() - 24 * 60 * 60 * 1000

    if (startTimestamp > currentTimeMinusOneDay) {
        return startTimestamp;
    }

    let nextReminder = startTimestamp;
    while (nextReminder <= currentTimeMinusOneDay) {
        nextReminder += frequencyInMillis;
    }

    return nextReminder;
};

export const countDays = (startTimestamp: number, endTimestamp: number): number => {
    const differenceInMilliseconds = endTimestamp - startTimestamp;
    const differenceInDays = Math.ceil(differenceInMilliseconds / (24 * 60 * 60 * 1000));
    return differenceInDays;
}
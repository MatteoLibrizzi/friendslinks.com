import { KVRemindersRepository } from "../reporitory/Reminders";
import { countDays, getNextReminderTimestamp } from "../domain/getNextReminder";

export async function POST(request: Request) {
    const body = await request.json()

    const onlyActiveReminders = body.onlyActiveReminders ?? false

    const remindersRepo = new KVRemindersRepository()

    let remindersByContactInfo

    if (onlyActiveReminders) {
        remindersByContactInfo = await remindersRepo.getActiveRemindersByContactInfo(body.contactInfo)
    } else {
        remindersByContactInfo = await remindersRepo.getRemindersByContactInfo(body.contactInfo)
    }

    const reminders = remindersByContactInfo.map((reminder) => {
        const decoratedReminder = {
            ...reminder,
            nextReminderTimestamp: getNextReminderTimestamp(reminder.startDateTimestamp, reminder.frequencyInDays),
            streakInDays: countDays(reminder.streakStartsSinceTimestamp ?? new Date().getTime(), new Date().getTime())
        }
        return decoratedReminder
    })

    return new Response(JSON.stringify({ reminders }))
}
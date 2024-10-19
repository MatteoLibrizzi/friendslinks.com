import { KVRemindersRepository } from "../reporitory/Reminders";
import { getNextReminderTimestamp } from "../domain/getNextReminder";

export async function POST(request: Request) {
    const body = await request.json()

    const remindersRepo = new KVRemindersRepository()

    const remindersByContactInfo = await remindersRepo.getActiveRemindersByContactInfo(body.contactInfo)

    console.log(remindersByContactInfo)

    const reminders = remindersByContactInfo.map((reminder) => {
        return {
            ...reminder,
            nextReminderTimestamp: getNextReminderTimestamp(reminder.startDateTimestamp, reminder.frequencyInDays)
        }
    })

    return new Response(JSON.stringify({ reminders }))
}
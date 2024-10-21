import { DDBRemindersRepository } from "../../reporitory/Reminders";
import { countDays, getNextReminderTimestamp } from "../../domain/getNextReminder";

export async function GET(request: Request, { params }: any) {
    const contactInfo = params.contactInfo

    if (!contactInfo) {
        return new Response("Missing contact info", { status: 400 })
    }

    const searchParams = request.url.split("?")[1]
    const onlyActiveReminders = new URLSearchParams(searchParams).get("onlyActiveReminders") ?? false

    const remindersRepo = new DDBRemindersRepository()

    let remindersByContactInfo
    if (onlyActiveReminders) {
        remindersByContactInfo = await remindersRepo.getActiveRemindersByContactInfo(contactInfo)
    } else {
        remindersByContactInfo = await remindersRepo.getRemindersByContactInfo(contactInfo)
    }

    const reminders = remindersByContactInfo.map((reminder) => {
        const decoratedReminder = {
            ...reminder,
            nextReminderTimestamp: getNextReminderTimestamp(reminder.startDateTimestamp, reminder.frequencyInDays),
            streakInDays: countDays(reminder.streakSinceTimestamp ?? new Date().getTime(), new Date().getTime())
        }
        return decoratedReminder
    })

    return new Response(JSON.stringify({ reminders }))
}
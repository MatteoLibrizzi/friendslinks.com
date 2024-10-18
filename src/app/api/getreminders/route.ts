"use server";

import { KVRemindersRepository } from "../reporitory/Reminders";
import { getNextReminder } from "../domain/getNextReminder";

export async function POST(request: Request) {
    const body = await request.json()

    const remindersRepo = new KVRemindersRepository()

    const remindersByContactInfo = await remindersRepo.getRemindersByContactInfo(body.contactInfo)

    const reminders = remindersByContactInfo.map((reminder) => {
        return {
            ...reminder,
            nextReminderTimestamp: getNextReminder(reminder.startDateTimestamp, reminder.frequencyInDays)
        }
    })

    return new Response(JSON.stringify({ reminders }))
}
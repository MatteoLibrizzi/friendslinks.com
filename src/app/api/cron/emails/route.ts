import { mailHandler } from "../../constants";
import { getReminderEmailHtml } from "../../domain/getEmailText";
import { getNextReminderTimestamp } from "../../domain/getNextReminder";
import { KVRemindersRepository } from "../../reporitory/Reminders";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const remindersRepo = new KVRemindersRepository()

    const contacts = await remindersRepo.getAllContacts()
    const uniqueContacts = [...new Set(contacts)]
    const remindersByContacts = await Promise.all(uniqueContacts.map(async (contact) => {
        const reminders = await remindersRepo.getActiveRemindersByContactInfo(contact)
        return reminders
    }))

    const reminders = remindersByContacts.flat()

    await Promise.all(reminders.map(async (reminder) => {
        const nextReminderTimestamp = getNextReminderTimestamp(reminder.startDateTimestamp, reminder.frequencyInDays)
        const nextReminderDate = new Date(nextReminderTimestamp).toLocaleDateString()
        const todayDate = new Date().toLocaleDateString()

        console.log('Comparing: ', todayDate, nextReminderDate)

        if (todayDate === nextReminderDate) {
            // send reminder
            console.log("Sending reminder to ", reminder.contactInfo, " with id: ", reminder.id)
            await mailHandler.send({
                to: reminder.contactInfo,
                from: "FriendsRemind.me <no-reply@mail.friendsremind.me>",
                subject: `Remember to text ${reminder.friendName}`,
                // TODO test all emails
                html: getReminderEmailHtml(reminder)
            })
        }
    }))

    return new Response(``);
}
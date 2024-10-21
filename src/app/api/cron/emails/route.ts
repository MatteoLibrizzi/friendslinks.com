import { mailHandler } from "../../constants";
import { getReminderEmailHtml } from "../../domain/getEmailText";
import { getNextReminderTimestamp } from "../../domain/getNextReminder";
import { DDBRemindersRepository } from "../../reporitory/Reminders";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const remindersRepo = new DDBRemindersRepository()

    const reminders = await remindersRepo.getAllReminders()

    await Promise.all(reminders.map(async (reminder) => {
        const nextReminderTimestamp = getNextReminderTimestamp(reminder.startDateTimestamp, reminder.frequencyInDays)
        const nextReminderDate = new Date(nextReminderTimestamp).toDateString()
        const todayDate = new Date().toDateString()

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
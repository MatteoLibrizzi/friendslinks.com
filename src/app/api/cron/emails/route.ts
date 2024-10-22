import { mailHandler } from "../../constants";
import { getReminderEmailHtml } from "../../domain/getEmailText";
import { getNextReminderTimestamp } from "../../domain/getNextReminder";
import { DDBRemindersRepository } from "../../reporitory/Reminders";

export const dynamic = 'force-dynamic';


export async function GET(request: Request) {
    const remindersRepo = new DDBRemindersRepository()

    const reminders = await remindersRepo.getAllReminders()

    await Promise.all(reminders.filter(reminder => reminder.active).map(async (reminder) => {
        const nextReminderTimestamp = getNextReminderTimestamp(reminder.startDateTimestamp, reminder.frequencyInDays)
        const nextReminderDate = new Date(nextReminderTimestamp).toDateString()
        const todayDate = new Date().toDateString()

        console.log('Today: ', todayDate, "\nNextReminder: ", nextReminderDate, "\n")

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

    await Promise.all(reminders.map(async (reminder) => {
        console.log("Checking streak for reminder: ", reminder)
        const mostRecentStreakTimestamp = reminder.streakTimestampsPoints[reminder.streakTimestampsPoints.length - 1]
        const frequencyTimestamp = reminder.frequencyInDays * 24 * 60 * 60 * 1000
        const yesterdayTimestamp = new Date().getTime() - 24 * 60 * 60 * 1000

        console.log(mostRecentStreakTimestamp)
        console.log("Most recent streak timestamp: ", new Date(mostRecentStreakTimestamp).toISOString())
        console.log("Yesterday timestamp: ", new Date(yesterdayTimestamp).toISOString())
        // console.log("Frequency timestamp: ", new Date(frequencyTimestamp).toISOString())

        if (yesterdayTimestamp > mostRecentStreakTimestamp + frequencyTimestamp) {
            console.log("Streak expired for reminder: ", reminder)
            await remindersRepo.setStreakInactive(reminder.id)
        }
    }))

    return new Response(``);
}
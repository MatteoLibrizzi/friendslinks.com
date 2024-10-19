import { mailHandler } from "../../constants";
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
                html: `
                <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Friendly Reminder</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #FF5E6C;">Don't forget to reach out to your friend!</h2>
  <p>Hey, it's time to send a message to 
    <strong>${reminder.friendName ? reminder.friendName : "Your Friend"}</strong>.
  </p>
  <p>You've set a reminder to stay in touch every 
    <strong>${reminder.frequencyInDays}</strong> 
    days, and today is the day!</p>

  <p>We hope this reminder helps you stay connected!</p>
  <p>Best regards,</p>
  <p>The FriendsRemind.me Team</p>

  <a href="https://www.friendsremind.me/removereminder/${reminder.id}" 
     style="background-color: #FF5E6C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;" 
     target="_blank">
    Remove Reminder
  </a>
  <a href="https://www.friendsremind.me/reminders" 
     style="background-color: #FF5E6C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;" 
     target="_blank">
    Check Active Reminders
  </a>
</body>
</html>
                `
            })
        }
    }))

    return new Response(``);
}
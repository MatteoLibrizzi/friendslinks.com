import { KVRemindersRepository } from "../reporitory/Reminders";
import { v4 } from "uuid";
import { mailHandler } from "../constants";

export async function POST(request: Request) {
    const body = await request.json()
    console.log(body)

    const id = v4()
    const remindersRepo = new KVRemindersRepository()

    const reminder = {
        contactInfo: body.contactInfo,
        notificationMethod: body.notificationMethod,
        frequencyInDays: body.frequencyInDays,
        startDateTimestamp: body.startDateTimestamp,
        friendName: body.friendName,
        id,
        active: true
    }
    remindersRepo.addReminder(reminder)

    await mailHandler.send({
        from: "Reminders Creator <no-reply@mail.friendsremind.me>",
        to: ["librizzimatteo.ml@gmail.com"],
        subject: "New reminder",
        text: "New reminder for " + JSON.stringify(reminder),
    })

    if (body.notificationMethod === "email") {
        await mailHandler.send({
            from: "Friends Reminders<no-reply@mail.friendsremind.me>",
            to: [body.contactInfo],
            subject: `New reminder to contact ${body.friendName ?? "Your Friend"}`,
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #FF5E6C;">Thank you for creating a new reminder!</h2>
  <p>It will help you stay in contact with 
    <strong>${body.friendName ? body.friendName : "Your Friend"}</strong>.
  </p>
  <p>You will receive a reminder every 
    <strong>${body.frequencyInDays}</strong> 
    days starting on 
    <strong>${new Date(body.startDateTimestamp).toDateString()}</strong>.
  </p>

  <!-- The link styled as a button with the theme color -->
  <a href="https://www.friendsremind.me/removereminder/${id}" 
     style="background-color: #FF5E6C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;" 
     target="_blank">
    Remove Reminder
  </a>

  <p>Best regards,</p>
  <p>The Reminder Team</p>
</body>
</html>
`
        })
    }

    return new Response("OK")
}
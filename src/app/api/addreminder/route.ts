import { DDBRemindersRepository, Reminder } from "../reporitory/Reminders";
import { v4 } from "uuid";
import { mailHandler } from "../constants";
import { getSignUpEmailHtml } from "../domain/getEmailText";

export async function POST(request: Request) {
    const body = await request.json()

    const id = v4()
    const remindersRepo = new DDBRemindersRepository()

    const reminder: Reminder = {
        contactInfo: body.contactInfo,
        notificationMethod: body.notificationMethod,
        frequencyInDays: body.frequencyInDays,
        startDateTimestamp: body.startDateTimestamp,
        friendName: body.friendName,
        streakSinceTimestamp: new Date().getTime(),
        streakTimestampsPoints: [new Date().getTime()],
        id,
        active: true
    }
    await remindersRepo.addReminder(reminder)

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
            html: getSignUpEmailHtml(reminder)
        })
    }

    return new Response("OK")
}
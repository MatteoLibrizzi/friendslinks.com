import { KVRemindersRepository } from "../reporitory/Reminders";
import { v4 } from "uuid";
import { mailHandler } from "../constants";

export async function POST(request: Request) {
    const body = await request.json()
    console.log(body)

    const remindersRepo = new KVRemindersRepository()
    remindersRepo.addReminder({
        contactInfo: body.contactInfo,
        notificationMethod: body.notificationMethod,
        frequencyInDays: body.frequencyInDays,
        startDateTimestamp: body.startDateTimestamp,
        friendName: body.friendName,
        id: v4()
    })

    await mailHandler.send({
        from: "admin@mail.friendsremind.me",
        to: ["librizzimatteo.ml@gmail.com"],
        subject: "New reminder",
        text: "New reminder for " + body.contactInfo + " " + body.notificationMethod + " " + body.frequencyInDays + " " + body.startDateTimestamp + " " + body.friendName + " " + body.id,
    })

    if (body.notificationMethod === "email") {
        await mailHandler.send({
            from: "reminders@mail.friendsremind.me",
            to: [body.contactInfo],
            subject: `New reminder to contact ${body.friendName ?? "Your Friend"}`,
            text: `Thank you for creating a new reminder, it will help you stay in contact with ${body.friendName ?? "Your Friend"}.\nYou will receive a reminder every ${body.frequencyInDays} days starting on ${new Date(body.startDateTimestamp).toDateString()}`
        })
    }

    return new Response("OK")
}
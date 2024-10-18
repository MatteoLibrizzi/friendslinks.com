"use server";

import { MailGunEmailHandler } from "../emailHandler/EmailHandler";
import { KVRemindersRepository } from "../reporitory/Reminders";
import { v4 } from "uuid";
const mailHandler = new MailGunEmailHandler()

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


    return new Response("OK", { status: 200 })
}
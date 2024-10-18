import formData from "form-data"
import Mailgun, { MailgunMessageData } from "mailgun.js"
import { KVRemindersRepository } from "../reporitory/Reminders";
import { v4 } from "uuid";

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || ''
const mailGun = new Mailgun(formData)
const mailGunClient = mailGun.client({
    username: 'api', key: MAILGUN_API_KEY, url: 'https://api.eu.mailgun.net'
});
const mailGunDomain = 'mail.friendsremind.me'


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

    await mailGunClient.messages.create(mailGunDomain, {
        from: "admin@mail.friendsremind.me",
        to: ["librizzimatteo.ml@gmail.com"],
        subject: "New reminder",
        text: "New reminder for " + body.contactInfo + " " + body.notificationMethod + " " + body.frequencyInDays + " " + body.startDateTimestamp + " " + body.friendName + " " + body.id,
    })


    return new Response("OK", { status: 200 })
}
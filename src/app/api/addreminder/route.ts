import { kv } from "@vercel/kv";
import { KVRemindersRepository } from "../reporitory/Reminders";
import { v4 } from "uuid";

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


    return new Response("OK")
}
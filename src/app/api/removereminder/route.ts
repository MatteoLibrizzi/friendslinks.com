

import { KVRemindersRepository } from "../reporitory/Reminders";

export async function POST(request: Request) {
    const body = await request.json()

    const remindersRepository = new KVRemindersRepository()
    // TODO add concept of streak when the reminder is keps ✅
    // TODO return success if reminder is already inactive
    try {
        await remindersRepository.deleteReminder(body.reminderId)
    } catch (e) {
        console.error('Error deleting the reminder: ', e)
        return new Response('', { status: 500 })
    }

    return new Response("OK")
}
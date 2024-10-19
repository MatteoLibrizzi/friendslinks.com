

import { KVRemindersRepository } from "../reporitory/Reminders";

// TODO Implement remove reminders based on id
export async function POST(request: Request) {
    const body = await request.json()

    const remindersRepository = new KVRemindersRepository()

    try {
        await remindersRepository.deleteReminder(body.reminderId)
    } catch (e) {
        console.error('Error deleting the reminder: ', e)
        return new Response('', { status: 500 })
    }

    return new Response("OK")
}
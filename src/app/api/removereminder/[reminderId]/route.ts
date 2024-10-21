

import { KVRemindersRepository } from "../../reporitory/Reminders";

export async function POST(request: Request, { params }: any) {

    const remindersRepository = new KVRemindersRepository()
    try {
        const reminderId = params.reminderId
        if (!reminderId) {
            return new Response('Reminder not found', { status: 404 })
        }
        await remindersRepository.deactivateReminder(reminderId)
    } catch (e) {
        console.error('Error deleting the reminder: ', e)
        return new Response('', { status: 500 })
    }

    return new Response("OK")
}

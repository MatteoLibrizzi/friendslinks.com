

import { DDBRemindersRepository } from "../../reporitory/Reminders";

export async function GET(request: Request, { params }: any) {

    const remindersRepository = new DDBRemindersRepository()
    try {
        const reminderId = params.reminderId
        if (!reminderId) {
            return new Response('Reminder not found', { status: 404 })
        }
        await remindersRepository.addStreakPoint(reminderId, Date.now())
    } catch (e) {
        console.error('Error deleting the reminder: ', e)
        return new Response('', { status: 500 })
    }

    return new Response("OK")
}

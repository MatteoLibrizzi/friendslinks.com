import { KVRemindersRepository } from "../../reporitory/Reminders";
import { getNextReminder } from "../../domain/getNextReminder";

export async function POST(request: Request) {
    const body = await request.json()

    const remindersRepo = new KVRemindersRepository()

    const reminder = await remindersRepo.getReminderById(body.reminderId)

    return new Response(JSON.stringify(reminder))
}
import { DDBRemindersRepository } from "../../reporitory/Reminders";

export async function GET(request: Request, { params }: any) {
    const remindersRepo = new DDBRemindersRepository()

    if (params.reminderId) {
        const reminder = await remindersRepo.getReminderById(params.reminderId)

        return new Response(JSON.stringify(reminder))
    }

    return new Response("Not found", { status: 404 })
}
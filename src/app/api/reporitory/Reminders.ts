import { kv } from "@vercel/kv";


interface Reminder {
    id: string;
    notificationMethod: "email"
    contactInfo: string;
    frequencyInDays: number;
    startDateTimestamp: number;
    friendName: string;
}

export abstract class RemindersRepository {
    abstract addReminder: (reminder: Reminder) => Promise<void>;
    abstract getRemindersByContactInfo: (contactInfo: string) => Promise<Reminder[]>;
    abstract getAllEmails: () => Promise<string[]>;
}

export class KVRemindersRepository extends RemindersRepository {
    addReminder = async (reminder: Reminder): Promise<void> => {
        await kv.lpush(`reminders:${reminder.contactInfo}`, reminder)
        await kv.lpush(`reminders:contacts`, reminder.contactInfo)

        console.log(`Added reminder to reminders:${reminder.contactInfo}, new list length: `, await kv.llen(`reminders:${reminder.contactInfo}`))
    }
    // TODO clear db and add with new schema
    getRemindersByContactInfo = async (contactInfo: string): Promise<Reminder[]> => {
        const numberOfReminders = await kv.llen(`reminders:${contactInfo}`)
        const reminders = await kv.lrange(`reminders:${contactInfo}`, 0, numberOfReminders - 1) as any[]

        return reminders ?? []
    }

    getAllEmails: () => Promise<string[]> = async () => {
        const numberOfEmails = await kv.llen(`reminders:contacts`)
        const emails = await kv.lrange(`reminders:contacts`, 0, numberOfEmails - 1) as any[]

        return emails ?? []
    }
}
import { kv } from "@vercel/kv";


interface Reminder {
    id: string;
    notificationMethod: "email"
    contactInfo: string;
    frequencyInDays: number;
    startDateTimestamp: number;
    friendName: string;
    active: boolean;
    streakStartsSinceTimestamp: number
}

export abstract class RemindersRepository {
    abstract addReminder: (reminder: Reminder) => Promise<void>;
    abstract getActiveRemindersByContactInfo: (contactInfo: string) => Promise<Reminder[]>;
    abstract getRemindersByContactInfo: (contactInfo: string) => Promise<Reminder[]>;
    abstract getReminderById: (reminderId: string) => Promise<Reminder>;
    abstract getAllContacts: () => Promise<string[]>;
    abstract deleteReminder: (reminderId: string) => Promise<void>;
}

export class KVRemindersRepository extends RemindersRepository {
    addReminder = async (reminder: Reminder): Promise<void> => {
        await kv.lpush(`reminders:${reminder.contactInfo}`, reminder)

        const isNewContact = await kv.lpos(`reminders:contacts`, reminder.contactInfo) === null
        if (isNewContact) {
            await kv.lpush(`reminders:contacts`, reminder.contactInfo)
        }
        await kv.set(`reminder:${reminder.id}`, reminder.contactInfo)
    }

    getReminderById: (reminderId: string) => Promise<Reminder> = async (reminderId) => {
        const contactInfo = await kv.get(`reminder:${reminderId}`)

        if (!contactInfo) {
            throw new Error("Reminder not found")
        }

        const reminders = await kv.lrange(`reminders:${contactInfo}`, 0, -1) as any[]
        const reminder = reminders.find((reminder) => reminder.id === reminderId)

        if (!reminder) {
            throw new Error("Reminder not found")
        }

        return reminder
    }

    getActiveRemindersByContactInfo = async (contactInfo: string): Promise<Reminder[]> => {
        const reminders = await kv.lrange(`reminders:${contactInfo}`, 0, - 1) as any[]

        return reminders.filter(reminder => reminder.active) ?? []
    }


    getRemindersByContactInfo = async (contactInfo: string): Promise<Reminder[]> => {
        const reminders = await kv.lrange(`reminders:${contactInfo}`, 0, - 1) as any[]

        return reminders ?? []
    }

    getAllContacts: () => Promise<string[]> = async () => {
        const contacts = await kv.lrange(`reminders:contacts`, 0, - 1) as any[]

        return contacts ?? []
    }

    deleteReminder: (reminderId: string) => Promise<void> = async (reminderId) => {
        const quickReminder = await this.getReminderById(reminderId)
        if (!quickReminder.active) {
            return
        }
        
        const contactInfo = await kv.get(`reminder:${reminderId}`)

        if (!contactInfo) {
            throw new Error("Reminder not found")
        }

        const reminders = await kv.lrange(`reminders:${contactInfo}`, 0, -1) as any[]

        const reminderIndex = reminders.findIndex((reminder) => reminder.id === reminderId)
        const reminder = reminders[reminderIndex]

        if (!reminder) {
            throw new Error("Reminder not found")
        }

        const inactiveReminder = {
            ...reminder,
            active: false
        }

        await kv.lset(`reminders:${contactInfo}`, reminderIndex, inactiveReminder)
    }
}

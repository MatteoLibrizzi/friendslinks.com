import { DeleteItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { kv } from "@vercel/kv";
import { DDB_CLIENT } from "../constants";


export interface Reminder {
    id: string;
    notificationMethod: "email"
    contactInfo: string;
    frequencyInDays: number;
    startDateTimestamp: number;
    friendName: string;
    active: boolean;
    streakActiveSinceTimestamp: number
    streakActive: boolean // modified every day by cronjob for day-1
}

export abstract class RemindersRepository {
    abstract addReminder: (reminder: Reminder) => Promise<void>;
    abstract getActiveRemindersByContactInfo: (contactInfo: string) => Promise<Reminder[]>;
    abstract getRemindersByContactInfo: (contactInfo: string) => Promise<Reminder[]>;
    abstract getReminderById: (reminderId: string) => Promise<Reminder>;
    abstract getAllContacts: () => Promise<string[]>;
    abstract deactivateReminder: (reminderId: string) => Promise<void>;
    abstract reactivateReminder: (reminderId: string) => Promise<void>;
    abstract setStreakInactive: (reminderId: string) => Promise<void>;
    abstract setStreakActiveSinceTimestamp: (reminderId: string, streakActiveSinceTimestamp: number) => Promise<void>;
    abstract addStreakPoint: (reminderId: string, timestamp: number) => Promise<void>;
}

export class KVRemindersRepository extends RemindersRepository {
    addStreakPoint: (reminderId: string, timestamp: number) => Promise<void> = async () => {
        throw new Error("Method not implemented.")
        // TODO implement
    }
    reactivateReminder: (reminderId: string) => Promise<void> = async () => { throw new Error("Method not implemented.") }
    setStreakInactive: (reminderId: string) => Promise<void> = async () => {
        throw new Error("Method not implemented.")
        // TODO implement
    }
    setStreakActiveSinceTimestamp: (reminderId: string, streakActiveSinceTimestamp: number) => Promise<void> = async () => {
        throw new Error("Method not implemented.")
        // TODO Implement
    }
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
        console.log("All active reminders: ", reminders)

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

    deactivateReminder: (reminderId: string) => Promise<void> = async (reminderId) => {
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


export class DDBRemindersRepository extends RemindersRepository {
    remindersTableName: string
    constructor() {
        super()
        this.remindersTableName = "devFriendsReminders-RemindersTableF916C7DB-17P8RIV3XKJ1K"
    }


    addReminder = async (reminder: Reminder): Promise<void> => {
        const Item = marshall({
            ...reminder,
            data: `DATA#${reminder.contactInfo}`
        });

        const params = {
            TableName: this.remindersTableName,
            Item,
        };

        const command = new PutItemCommand(params);
        try {
            console.log("Sending PutItemCommand...");
            await DDB_CLIENT.send(command);
            console.log("PutItemCommand finished");
        } catch (err) {
            console.error("Error adding reminder:", err);
            throw err;
        }
    }

    getReminderById = async (reminderId: string): Promise<Reminder> => {
        const params = {
            TableName: this.remindersTableName,
            KeyConditionExpression: "#id = :id",
            // TODO add condition to only get the DATA# sk
            ExpressionAttributeNames: {
                "#id": "id",
            },
            ExpressionAttributeValues: marshall({
                ":id": reminderId,
            }),
        };

        const command = new QueryCommand(params);
        try {
            const result = await DDB_CLIENT.send(command);
            if (result.Items && result.Items.length > 0) {
                return unmarshall(result.Items[0]).reminder as Reminder;
            } else {
                throw new Error('Reminder not found');
            }
        } catch (err) {
            console.error("Error getting reminder by ID:", err);
            throw err;
        }
    }

    getActiveRemindersByContactInfo = async (contactInfo: string): Promise<Reminder[]> => {
        const sk = `DATA#${contactInfo}`
        const params = {
            TableName: this.remindersTableName,
            FilterExpression: "#data = :data",
            ExpressionAttributeNames: {
                "#data": "data",
            },
            ExpressionAttributeValues: marshall({
                ":data": sk,
            }),
        };

        const command = new ScanCommand(params);
        try {
            const result = await DDB_CLIENT.send(command);
            const reminders = result.Items?.map(item => unmarshall(item).reminder as Reminder) || [];
            return reminders.filter(reminder => reminder.active);
        } catch (err) {
            console.error("Error getting active reminders by contactInfo:", err);
            throw err;
        }
    }

    getRemindersByContactInfo = async (contactInfo: string): Promise<Reminder[]> => {
        const sk = `DATA#${contactInfo}`
        const params = {
            TableName: this.remindersTableName,
            FilterExpression: "#data = :data",
            ExpressionAttributeNames: {
                "#data": "data",
            },
            ExpressionAttributeValues: marshall({
                ":data": sk,
            }),
        };

        const command = new ScanCommand(params);
        try {
            const result = await DDB_CLIENT.send(command);
            return result.Items?.map(item => unmarshall(item).reminder as Reminder) || [];
        } catch (err) {
            console.error("Error getting reminders by contact info:", err);
            throw err;
        }
    }


    getAllContacts = async (): Promise<string[]> => {
        const params = {
            TableName: this.remindersTableName,
            ProjectionExpression: "#data",
            // TODO filter for sk beginning with DATA#
            ExpressionAttributeNames: {
                "#data": "data",
            }
        };

        const command = new ScanCommand(params);
        try {
            const result = await DDB_CLIENT.send(command);
            const contacts = result.Items?.map(item => unmarshall(item).contactInfo.split('#')[1]) || [];
            return Array.from(new Set(contacts)); // Remove duplicates
        } catch (err) {
            console.error("Error getting all contacts:", err);
            throw err;
        }
    }


    deactivateReminder = async (reminderId: string): Promise<void> => {
        // Get the reminder by its ID
        const reminder = await this.getReminderById(reminderId);

        if (!reminder.active) {
            return; // Already deactivated, no need to proceed
        }

        const sk = `DATA#${reminder.contactInfo}`
        const params = {
            TableName: this.remindersTableName,
            Key: marshall({
                id: reminder.id,
                data: sk,
            }),
            UpdateExpression: "SET #active = :active",
            ExpressionAttributeNames: {
                "#active": "active", // Mapping the 'active' attribute name to avoid reserved words
            },
            ExpressionAttributeValues: marshall({
                ":active": false, // Set the 'active' field to false
            }),
        };

        const command = new UpdateItemCommand(params);
        try {
            console.log("Sending UpdateItemCommand...");
            await DDB_CLIENT.send(command);
            console.log("UpdateItemCommand finished: Reminder deactivated");
        } catch (err) {
            console.error("Error deactivating reminder:", err);
            throw err;
        }
    };


    reactivateReminder: (reminderId: string) => Promise<void> = async (reminderId) => {
        const reminder = await this.getReminderById(reminderId);

        if (reminder.active) {
            return; // Already active, no need to reactivate
        }

        const sk = `DATA#${reminder.contactInfo}`
        const params = {
            TableName: this.remindersTableName,
            Key: marshall({
                id: reminder.id,
                data: sk,
            }),
            UpdateExpression: "SET #active = :active",
            ExpressionAttributeNames: {
                "#active": "active",
            },
            ExpressionAttributeValues: marshall({
                ":active": true,
            }),
        };

        const command = new UpdateItemCommand(params);
        try {
            console.log("Sending UpdateItemCommand to reactivate reminder...");
            await DDB_CLIENT.send(command);
            console.log("Reminder reactivated successfully");
        } catch (err) {
            console.error("Error reactivating reminder:", err);
            throw err;
        }
    };

    setStreakInactive: (reminderId: string) => Promise<void> = async (reminderId) => {
        // Assuming you want to remove the 'STREAKSINCE#{dateSince}' item from DynamoDB
        const params = {
            TableName: this.remindersTableName,
            Key: marshall({
                id: reminderId,
                data: `STREAKSINCE#` // Since we don't have a specific date, we'll just target the prefix.
            }),
            // Remove the item representing the active streak
            ConditionExpression: "attribute_exists(id) AND begins_with(data, :prefix)",
            ExpressionAttributeValues: marshall({
                ":prefix": "STREAKSINCE#"
            }),
        };

        const command = new DeleteItemCommand(params);
        try {
            console.log("Sending DeleteItemCommand to remove streak...");
            await DDB_CLIENT.send(command);
            console.log("Streak removed successfully");
        } catch (err) {
            console.error("Error setting streak inactive:", err);
            throw err;
        }
    };

    setStreakActiveSinceTimestamp: (reminderId: string, streakActiveSinceTimestamp: number) => Promise<void> = async (reminderId, streakActiveSinceTimestamp) => {
        // Format the date as a string to append in the sort key (e.g., "STREAKSINCE#2023-10-12")
        const dateSince = new Date(streakActiveSinceTimestamp).toISOString().split('T')[0]; // e.g., '2023-10-12'

        const params = {
            TableName: this.remindersTableName,
            Item: marshall({
                id: reminderId,
                data: `STREAKSINCE#${dateSince}`,
                streakActiveSinceTimestamp,
            }),
            ConditionExpression: "attribute_not_exists(id) OR begins_with(data, :prefix)",
            ExpressionAttributeValues: marshall({
                ":prefix": "STREAKSINCE#"
            }),
        };

        const command = new PutItemCommand(params);
        try {
            console.log("Sending PutItemCommand to set streak active since timestamp...");
            await DDB_CLIENT.send(command);
            console.log("Streak active since timestamp set successfully");
        } catch (err) {
            console.error("Error setting streak active since timestamp:", err);
            throw err;
        }
    };

    addStreakPoint: (reminderId: string, timestamp: number) => Promise<void> = async (reminderId, timestamp) => {
        // Format the timestamp as a string to append in the sort key (e.g., "STREAKPOINT#2023-10-12")
        const date = new Date(timestamp).toISOString().split('T')[0]; // e.g., '2023-10-12'

        const params = {
            TableName: this.remindersTableName,
            Item: marshall({
                id: reminderId,
                data: `STREAKPOINT#${date}`, // Sort key with the streak point date
                timestamp,
            }),
        };

        const command = new PutItemCommand(params);
        try {
            console.log("Sending PutItemCommand to add streak point...");
            await DDB_CLIENT.send(command);
            console.log("Streak point added successfully");
        } catch (err) {
            console.error("Error adding streak point:", err);
            throw err;
        }
    };


}
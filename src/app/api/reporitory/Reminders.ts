import { BatchWriteItemCommand, DeleteItemCommand, PutItemCommand, QueryCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
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
    streakSinceTimestamp: number | null
    streakTimestampsPoints: number[]
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
    abstract setStreakActiveSinceTimestamp: (reminderId: string, streakSinceTimestamp: number) => Promise<void>;
    abstract addStreakPoint: (reminderId: string, timestamp: number) => Promise<void>;
    abstract getAllRemindersGroupedByContactInfo: () => Promise<{ [contactInfo: string]: Reminder[] }>;
    abstract getAllReminders: () => Promise<Reminder[]>;
}

export class KVRemindersRepository extends RemindersRepository {
    getAllReminders: () => Promise<Reminder[]> = async () => {
        throw new Error()
    }
    getAllRemindersGroupedByContactInfo: () => Promise<{ [contactInfo: string]: Reminder[]; }> = async () => {
        throw new Error()
    }
    addStreakPoint: (reminderId: string, timestamp: number) => Promise<void> = async () => {
        throw new Error("Method not implemented.")
        // TODO implement
    }
    reactivateReminder: (reminderId: string) => Promise<void> = async () => { throw new Error("Method not implemented.") }
    setStreakInactive: (reminderId: string) => Promise<void> = async () => {
        throw new Error("Method not implemented.")
        // TODO implement
    }
    setStreakActiveSinceTimestamp: (reminderId: string, streakSinceTimestamp: number) => Promise<void> = async () => {
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


// TODO check this for mistakes while you were sleep deprived
export class DDBRemindersRepository extends RemindersRepository {
    remindersTableName: string
    constructor() {
        super()
        this.remindersTableName = "devFriendsReminders-RemindersTableF916C7DB-17P8RIV3XKJ1K"
    }


    addReminder = async (reminder: Reminder): Promise<void> => {
        const items = [];

        // 1. Add the main reminder item (DATA#{contactInfo})
        const mainItem = marshall({
            data: `DATA#${reminder.contactInfo}`,
            ...reminder,
        });

        items.push({
            PutRequest: {
                Item: mainItem
            }
        });

        // 2. If streakSince is provided, add the STREAKSINCE#{dateSince} item
        if (reminder.streakSinceTimestamp) {
            const streakSinceItem = marshall({
                id: reminder.id,
                data: `STREAKSINCE#${reminder.streakSinceTimestamp}`,
                active: true,
                streakSinceTimestamp: reminder.streakSinceTimestamp
            });

            items.push({
                PutRequest: {
                    Item: streakSinceItem
                }
            });
        }

        // 3. If there are streakPoints, add each as STREAKPOINT#{date} items
        if (reminder.streakTimestampsPoints && reminder.streakTimestampsPoints.length > 0) {
            reminder.streakTimestampsPoints.forEach((timestamp) => {
                const streakPointItem = marshall({
                    id: reminder.id,
                    data: `STREAKPOINT#${timestamp}`,
                    timestamp,
                });

                items.push({
                    PutRequest: {
                        Item: streakPointItem
                    }
                });
            });
        }

        const params = {
            RequestItems: {
                [this.remindersTableName]: items,
            },
        };

        const command = new BatchWriteItemCommand(params);
        try {
            console.log("Sending BatchWriteItemCommand...");
            await DDB_CLIENT.send(command);
            console.log("BatchWriteItemCommand finished");
        } catch (err) {
            console.error("Error adding reminder and streak items:", err);
            throw err;
        }
    };


    getReminderById = async (reminderId: string): Promise<Reminder> => {
        // Step 1: Get the main reminder item
        const reminderParams = {
            TableName: this.remindersTableName,
            KeyConditionExpression: "#id = :id AND begins_with(#data, :dataPrefix)",
            ExpressionAttributeNames: {
                "#id": "id",
                "#data": "data",
            },
            ExpressionAttributeValues: marshall({
                ":id": reminderId,
                ":dataPrefix": "DATA#", // Only retrieve DATA# items
            }),
        };

        const reminderCommand = new QueryCommand(reminderParams);

        try {
            const reminderResult = await DDB_CLIENT.send(reminderCommand);
            if (!reminderResult.Items || reminderResult.Items.length === 0) {
                throw new Error('Reminder not found');
            }

            // Unmarshall the reminder item
            const reminder = unmarshall(reminderResult.Items[0]) as Reminder;

            const { streakSinceTimestamp, streakTimestampsPoints } = await this.getStreakDataForReminder(reminder.id)
            reminder.streakSinceTimestamp = streakSinceTimestamp
            reminder.streakTimestampsPoints = streakTimestampsPoints

            return reminder;
        } catch (err) {
            console.error("Error getting reminder by ID:", err);
            throw err;
        }
    };


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
            const reminders = result.Items?.map(item => unmarshall(item) as Reminder) || [];
            return await Promise.all(reminders.filter(reminder => reminder.active).map(async reminder => {
                const { streakSinceTimestamp, streakTimestampsPoints } = await this.getStreakDataForReminder(reminder.id)
                reminder.streakSinceTimestamp = streakSinceTimestamp
                reminder.streakTimestampsPoints = streakTimestampsPoints
                return reminder
            }))
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
            const reminders = result.Items?.map(item => unmarshall(item).reminder as Reminder) || [];

            return await Promise.all(reminders.map(async reminder => {
                const { streakSinceTimestamp, streakTimestampsPoints } = await this.getStreakDataForReminder(reminder.id)
                reminder.streakSinceTimestamp = streakSinceTimestamp
                reminder.streakTimestampsPoints = streakTimestampsPoints
                return reminder

            }))
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

    // TODO use this in cron job for expired ones
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

    // TODO use this when is inactive and begings again (make it idempotent so you can use it anyway)
    setStreakActiveSinceTimestamp: (reminderId: string, streakSinceTimestamp: number) => Promise<void> = async (reminderId, streakSinceTimestamp) => {
        const params = {
            TableName: this.remindersTableName,
            Item: marshall({
                id: reminderId,
                data: `STREAKSINCE#${streakSinceTimestamp}`,
                streakSinceTimestamp,
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

    // TODO modify repo to work with operations on reminder, encapsulate streak object
    addStreakPoint: (reminderId: string, timestamp: number) => Promise<void> = async (reminderId, timestamp) => {
        const params = {
            TableName: this.remindersTableName,
            Item: marshall({
                id: reminderId,
                data: `STREAKPOINT#${timestamp}`, // Sort key with the streak point date
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

    getAllRemindersGroupedByContactInfo = async (): Promise<{ [contactInfo: string]: Reminder[] }> => {
        // Step 1: Scan for items with SK starting with DATA
        const params = {
            TableName: this.remindersTableName,
            FilterExpression: "begins_with(#data, :dataPrefix)",
            ExpressionAttributeNames: {
                "#data": "data", // Sort key
            },
            ExpressionAttributeValues: marshall({
                ":dataPrefix": "DATA#", // Filter for DATA# items
            }),
        };

        const command = new ScanCommand(params);

        try {
            const result = await DDB_CLIENT.send(command);
            const reminders: Reminder[] = result.Items?.map(item => unmarshall(item) as Reminder) || [];

            // Step 2: Group reminders by contactInfo
            const groupedReminders: { [contactInfo: string]: Reminder[] } = {};

            for (const reminder of reminders) {
                if (!groupedReminders[reminder.contactInfo]) {
                    groupedReminders[reminder.contactInfo] = [];
                }
                groupedReminders[reminder.contactInfo].push(reminder);
            }

            // Step 3: Fetch streak data for each reminder (if needed)
            for (const contactInfo in groupedReminders) {
                for (const reminder of groupedReminders[contactInfo]) {
                    // Here you could call methods like setStreakInactive, etc., if needed.
                    // For this example, we'll assume you want to populate streak data using the existing methods.
                    // This is where you would retrieve the streak data if required.
                    // For example, using the method you previously implemented:
                    const streakItems = await this.getStreakDataForReminder(reminder.id); // Assuming this method exists
                    reminder.streakSinceTimestamp = streakItems.streakSinceTimestamp; // Populate streak data
                    reminder.streakTimestampsPoints = streakItems.streakTimestampsPoints; // Populate streak points
                }
            }

            return groupedReminders; // Return the grouped reminders
        } catch (err) {
            console.error("Error getting all reminders grouped by contact info:", err);
            throw err;
        }
    };

    private getStreakDataForReminder = async (reminderId: string) => {
        const streakParams = {
            TableName: this.remindersTableName,
            KeyConditionExpression: "#id = :id AND begins_with(#data, :streakPrefix)",
            ExpressionAttributeNames: {
                "#id": "id",
                "#data": "data",
            },
            ExpressionAttributeValues: marshall({
                ":id": reminderId,
                ":streakPrefix": "STREAK", // Retrieve STREAK items
            }),
        };

        const streakCommand = new QueryCommand(streakParams);
        const streakResult = await DDB_CLIENT.send(streakCommand);

        const streakData = {
            streakSinceTimestamp: null,
            streakTimestampsPoints: [] as number[],
        };

        if (streakResult.Items) {
            for (const item of streakResult.Items) {
                const unmarshalledItem = unmarshall(item);
                if (unmarshalledItem.data.startsWith("STREAKSINCE#")) {
                    streakData.streakSinceTimestamp = unmarshalledItem.streakSinceTimestamp; // Assuming this is the correct field
                } else if (unmarshalledItem.data.startsWith("STREAKPOINT#")) {
                    streakData.streakTimestampsPoints.push(unmarshalledItem.timestamp); // Collect timestamps
                }
            }
        }

        return streakData; // Return the streak data
    };

    getAllReminders = async (): Promise<Reminder[]> => {
        const params = {
            TableName: this.remindersTableName,
            FilterExpression: "begins_with(#data, :dataPrefix)", // Filter for SK that begins with DATA#
            ExpressionAttributeNames: {
                "#data": "data",
            },
            ExpressionAttributeValues: marshall({
                ":dataPrefix": "DATA#", // Prefix to filter
            }),
        };

        const command = new ScanCommand(params);
        const allReminders: Reminder[] = [];

        try {
            console.log("Scanning for all reminders...");
            const result = await DDB_CLIENT.send(command);
            const items = result.Items;

            if (items && items.length > 0) {
                // Process each item to include both reminders and their streak data
                for (const item of items) {
                    const reminder = unmarshall(item) as Reminder

                    // Get associated streak data for the reminder
                    const streakData = await this.getStreakDataForReminder(reminder.id);
                    reminder.streakSinceTimestamp = streakData.streakSinceTimestamp;
                    reminder.streakTimestampsPoints = streakData.streakTimestampsPoints;

                    allReminders.push(reminder);
                }
            }

            console.log("Scan completed. Total reminders retrieved:", allReminders.length);
            return allReminders;
        } catch (err) {
            console.error("Error getting all reminders:", err);
            throw err;
        }
    };


}
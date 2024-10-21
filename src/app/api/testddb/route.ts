import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall, marshall } from "@aws-sdk/util-dynamodb";// TODO maybe use marshal instead of ddb parser
import { DDB_CLIENT } from "../constants";
export async function GET(request: Request) {
    const Item = marshall({
        id: "123",
        data: "456",

    })

    console.log("Item: ", Item)
    const params = {
        TableName: "devFriendsReminders-RemindersTableF916C7DB-17P8RIV3XKJ1K",
        Item
    };

    const command = new PutItemCommand(params);

    try {
        console.log("Sending...")
        await DDB_CLIENT.send(command);
        console.log("Finished")
    } catch (err) {
        console.error("Error creating checkout session:", err);
        throw err;
    }


    return new Response("OK")
}


import formData from "form-data"
import Mailgun, { MailgunMessageData } from "mailgun.js"
import { MAILGUN_API_KEY } from "../constants"
import { IMailgunClient } from "mailgun.js/Interfaces"

export abstract class EmailHandler {
    abstract send: (sendEmailInput: MailgunMessageData) => Promise<void>
}

export class MailGunEmailHandler extends EmailHandler {
    client: IMailgunClient
    domain: string

    constructor() {
        super()
        const mailGun = new Mailgun(formData)
        this.client = mailGun.client({
            username: 'api', key: MAILGUN_API_KEY, url: 'https://api.eu.mailgun.net'
        });
        this.domain = 'mail.friendsremind.me'
    }
    send: (sendEmailInput: MailgunMessageData) => Promise<void> = async (sendEmailInput) => {
        try {
            await this.client.messages.create(this.domain, sendEmailInput)
        } catch (e) {
            console.error("Error while sending message with mailgun: ", e)
        }
    }
}
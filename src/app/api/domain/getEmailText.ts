import { Reminder } from "../reporitory/Reminders"
import { countDays } from "./getNextReminder"


export const getSignUpEmailHtml = ({ friendName, startDateTimestamp, frequencyInDays, contactInfo, id, streakStartsSinceTimestamp }: Reminder) => {
    const friendNameOrDefault = friendName ?? "Your Friend"
    const daysFrequencyString = `${frequencyInDays} ${frequencyInDays === 1 ? "day" : "days"}`
    const streakDays = countDays(streakStartsSinceTimestamp, new Date().getTime())
    const streakDaysString = `${streakDays} ${streakDays === 1 ? "day" : "days"}`
    const url = `https://friendsremind.me/`
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FriendReminder!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td>
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="background-color: #FF5E6C; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to FriendReminder!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="margin-bottom: 20px;">Hello there!</p>
                            <p style="margin-bottom: 20px;">Thank you for signing up for FriendReminder. We're excited to help you stay connected with your friends. Here are the details of your reminder:</p>
                            <table cellpadding="10" cellspacing="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 8px;">
                                <tr>
                                    <td width="50%" style="font-weight: bold;">Friend to Remember:</td>
                                    <td>${friendNameOrDefault}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="font-weight: bold;">Reminder Frequency:</td>
                                    <td>Every ${daysFrequencyString}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="font-weight: bold;">Start Date:</td>
                                    <td>${new Date(startDateTimestamp).toDateString()}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="font-weight: bold;">Reminder Email:</td>
                                    <td>${contactInfo}</td>
                                </tr>
                                <tr>
                                    <td width="50%" style="font-weight: bold;">Current Streak:</td>
                                    <td>${streakDaysString} (Just getting started!)</td>
                                </tr>
                            </table>
                            <p style="margin-top: 20px;">We'll send you a friendly reminder every ${daysFrequencyString} to text ${friendNameOrDefault}. Keep up the streak and stay connected!</p>
                            <p style="margin-top: 20px;">If you need to make any changes to your reminder settings, please use the buttons below or visit our website.</p>
                            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 30px;">
                                <tr>
                                    <td align="center">
                                    <a href="https://friendsremind.me/reminders/${contactInfo}" style="display: inline-block; background-color: #FF5E6C; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold; margin-right: 10px;">View All Reminders</a>    
                                    <a href="https://friendsremind.me/removereminder/${id}" style="display: inline-block; background-color: #333333; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold;">Remove Reminder</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin-top: 30px;">Best regards,<br>The FriendsRemind.me Team</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #FF5E6C; padding: 20px; text-align: center;">
                            <p style="color: #ffffff; margin: 0; font-size: 14px;">&copy; 2024 FriendsRemind.me. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `
}
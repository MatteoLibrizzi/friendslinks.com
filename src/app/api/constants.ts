import { Stripe } from 'stripe';
import {
    DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { MailGunEmailHandler } from './emailHandler/EmailHandler';

export const DDB_CLIENT = new DynamoDBClient({
    region: 'eu-west-1'
});
export const S3_CLIENT = new S3Client({
    region: 'eu-west-1'
});

export const APP_URL = process.env.APP_URL = ""

const stripeKey = process.env.STRIPE_SECRET_KEY || ""
export const STRIPE = new Stripe(stripeKey)

export const STRIPE_SUCCESS_URL = process.env.STRIPE_SUCCESS_URL || "http://localhost:3000"
export const STRIPE_CANCEL_URL = process.env.STRIPE_CANCEL_URL || "http://localhost:3000"
export const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET || ""


export const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || ''
export const mailHandler = new MailGunEmailHandler()
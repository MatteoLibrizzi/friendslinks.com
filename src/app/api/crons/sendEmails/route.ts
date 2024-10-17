
export async function GET(req: Request) {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        console.log("Not authorized")
    } else {
        console.log("Authorized")
    }
    // TODO setup cron job to retrieve emails to go out on that day
    // and send those emails

    return new Response('Hello World!', { status: 200 })
}
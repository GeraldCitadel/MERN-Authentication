import nodemailer from "nodemailer"




const transporter = nodemailer.createTransport({
host: process.env.MAILGUN_SMTP_HOST,
port: 587,
auth: {
    user: process.env.MAILGUN_SMTP_USERNAME,
    pass: process.env.MAILGUN_SMTP_PASSWORD
}
})


export default transporter
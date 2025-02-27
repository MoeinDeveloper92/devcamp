const nodemailer = require("nodemailer")

const sendEmail = async (options) => {

    //create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMPT_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    const message = {
        from: `${process.env.FROM_NAME} , <${process.env.FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }

    const info = await transporter.sendMail(message)

    console.log(`Message send: %s ${info.messageId}`)
}


module.exports = sendEmail
import nodemailer from "nodemailer";

export const nodemailerService = {
    async sendEmail(
        email: string,
        code: string,
        template: (code: string) => string,
    ): Promise<boolean> {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "nkplwow@gmail.com",
                pass: "klqhisiwjzzcbqnx",
            },
        });

        let info = await transporter.sendMail({
            from: '"Kek 👻" <nkplwow@gmail.com>',
            to: email,
            subject: "Your code is here",
            html: template(code), // html body
        });

        return !!info;
    },
}
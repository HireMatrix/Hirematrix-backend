import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { sender, transport } from "./email.config.js";

export const sendVerificationEmail = async (email, verificationToken, acessToken) => {
    const recipients = [email];

    try {
        const response = await transport.sendMail({
            from: sender,
            to: recipients,
            subject: 'Your Verfication token',
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken).replaceAll("{temporaryToken}", acessToken),
            category: "Email Verfication"
        })

        console.log("Email sent successfully", response);
    } catch (error) {
        console.log("Error in sending the email", error);
        throw new Error("Error in sending the email", error);
    }
};

export const sendWelcomeEmail = async (email, name) => {
    const recipients = [email];

    try {
        const response = await transport.sendMail({
            from: sender,
            to: recipients,
            subject: "Welcome to HireMatrix!",
            html: WELCOME_EMAIL_TEMPLATE.replace("{UserName}", name),
            category: "Welcome Email"
        })

        console.log("Email sent successfully", response);
    } catch (error) {
        console.log("Error in Sending the welcome email", error);
        throw new Error("Error in sending the welcome email", error);
    }
};

export const sendForgotPasswordEmail = async (email, token) => {
    const recipients = [email];

    console.log(token);

    try {
        const response = await transport.sendMail({
            from: sender,
            to: recipients,
            subject: "Reset your Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replaceAll("{resetUrl}", token),
            category: "Reset Password"
        });
    
        console.log("Email sent successfully", response);
    } catch (error) {
        console.log("Error in sending the email", error);
        throw new Error("Error in sending email", error);
    }
}

export const sendResetPasswordSuccess = async (email)  => {
    const recipients = [email];
    
    try {
        const response = await transport.sendMail({
            from: sender,
            to: recipients,
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        })

        console.log("Email sent successfully", response);
    } catch (error) {
        console.log("Error in sending the email", error);
        throw new Error("Error in sending the email", error);
    }
}
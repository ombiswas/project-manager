import sgMail from "@sendgrid/mail";
import { env } from "../src/config/env.js";

if (env.SEND_GRID_API) {
  sgMail.setApiKey(env.SEND_GRID_API);
}

const fromEmail = env.FROM_EMAIL;

export const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: `TaskHub <${fromEmail}>`,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }

    return false;
  }
};

const nodemailer = require('nodemailer');

const createTransporter = async () => {
  // If SMTP credentials exist in environment variables
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback to Nodemailer Ethereal test account in development
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('[Email] Created ephemeral Ethereal test account for dev emails:', testAccount.user);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('[Email] Could not create Ethereal account, falling back to dummy logger:', err.message);
    return {
      sendMail: async (options) => {
        console.log('[Email Simulation] Sending mail to:', options.to);
        console.log('[Email Simulation] Subject:', options.subject);
        console.log('[Email Simulation] HTML Content Preview:', options.html);
        return { messageId: 'simulated-' + Date.now() };
      },
    };
  }
};

module.exports = { createTransporter };


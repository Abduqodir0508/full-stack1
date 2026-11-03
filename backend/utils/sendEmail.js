const nodemailer = require('nodemailer');
const { createTransporter } = require('../config/emailConfig');

const sendVerificationEmail = async ({ to, name, verificationToken }) => {
  try {
    const transporter = await createTransporter();

    // Prefer frontend URL for modern SPA navigation; fallback to backend URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${verificationToken}`;
    const directApiUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/verify-email/${verificationToken}`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">MiniStore</h1>
          <p style="color: #64748b; margin-top: 4px; font-size: 14px;">Your Modern E-Commerce Destination</p>
        </div>
        
        <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Hello, ${name}! 👋</h2>
          <p style="color: #334155; line-height: 1.6; font-size: 15px;">
            Thank you for creating an account on <strong>MiniStore</strong>. Please confirm your email address to activate your account and start exploring our curated catalog.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
            Verify My Email
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; text-align: center;">
          Or verify directly via API: <br />
          <a href="${directApiUrl}" style="color: #4f46e5; word-break: break-all;">${directApiUrl}</a>
        </p>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
          This verification token will expire in 24 hours. If you did not create this account, you can safely ignore this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"MiniStore Team" <noreply@ministore.local>',
      to,
      subject: 'Verify your MiniStore account',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Verification email sent to: ${to} (MessageId: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Ethereal Preview URL]: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Email Sending Error]: ${error.message}`);
    // Don't crash user registration if email service has issues, but return failure info
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
};


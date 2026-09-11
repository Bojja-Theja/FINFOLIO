import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email configuration - in production, use environment variables
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

const transporter = nodemailer.createTransport(emailConfig);

export interface NotificationData {
  userId: number;
  email: string;
  subject: string;
  message: string;
  type: 'alert' | 'reminder' | 'achievement' | 'warning';
  priority?: 'low' | 'normal' | 'high';
}

export const sendEmailNotification = async (data: NotificationData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const { userId, email, subject, message, type, priority = 'normal' } = data;

    // Create HTML email template based on type
    const htmlTemplate = createEmailTemplate(type, subject, message);

    const mailOptions = {
      from: `"CapStack AI" <${emailConfig.auth.user}>`,
      to: email,
      subject: `[CapStack] ${subject}`,
      html: htmlTemplate,
      priority: priority
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to user ${userId}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    const errorMessage = `Failed to send email to user ${data.userId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    logger.error(errorMessage);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const sendAlert = async (userId: number, email: string, message: string, type: 'warning' | 'error' | 'info' | 'success') => {
  const subjectMap = {
    warning: 'Financial Alert: Action Required',
    error: 'Critical Financial Alert',
    info: 'Financial Update',
    success: 'Financial Achievement Unlocked!'
  };

  const priorityMap = {
    warning: 'high' as const,
    error: 'high' as const,
    info: 'normal' as const,
    success: 'normal' as const
  };

  return await sendEmailNotification({
    userId,
    email,
    subject: subjectMap[type],
    message,
    type: 'alert',
    priority: priorityMap[type]
  });
};

export const sendAchievementNotification = async (userId: number, email: string, achievement: string, details: string) => {
  return await sendEmailNotification({
    userId,
    email,
    subject: `🎉 ${achievement}`,
    message: details,
    type: 'achievement',
    priority: 'normal'
  });
};

export const sendReminder = async (userId: number, email: string, reminder: string, dueDate?: Date) => {
  const subject = dueDate ? `Reminder: ${reminder}` : `Financial Reminder`;
  const message = dueDate
    ? `${reminder}\n\nDue Date: ${dueDate.toLocaleDateString()}`
    : reminder;

  return await sendEmailNotification({
    userId,
    email,
    subject,
    message,
    type: 'reminder',
    priority: 'normal'
  });
};

export const scheduleReminder = (userId: number, email: string, reminder: string, date: Date) => {
  // In a real implementation, you'd use a job scheduler like Bull or Agenda
  // For now, we'll just log it
  logger.info(`Scheduling reminder for user ${userId} on ${date}: ${reminder}`);

  // TODO: Implement actual scheduling with a job queue
  // This would typically involve:
  // 1. Storing the reminder in database
  // 2. Using a job scheduler to send at the right time

  return { success: true, scheduled: true };
};

const createEmailTemplate = (type: string, subject: string, message: string): string => {
  const baseStyles = `
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
  `;

  const headerStyles = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px;
    text-align: center;
    border-radius: 10px 10px 0 0;
  `;

  const contentStyles = `
    background: #ffffff;
    padding: 30px;
    border: 1px solid #e0e0e0;
    border-top: none;
    border-radius: 0 0 10px 10px;
  `;

  const buttonStyles = `
    background: #667eea;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 6px;
    display: inline-block;
    margin: 20px 0;
    font-weight: bold;
  `;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return '🚨';
      case 'achievement': return '🎉';
      case 'reminder': return '⏰';
      case 'warning': return '⚠️';
      default: return '💡';
    }
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="${baseStyles}">
      <div style="${headerStyles}">
        <h1 style="margin: 0; font-size: 24px;">${getTypeIcon(type)} CapStack AI</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Personal Financial Guardian</p>
      </div>

      <div style="${contentStyles}">
        <h2 style="color: #667eea; margin-top: 0;">${subject}</h2>

        <div style="white-space: pre-line; margin: 20px 0;">
          ${message}
        </div>

        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            <strong>Why did you receive this?</strong><br>
            You're receiving this notification because you have important financial updates from CapStack AI.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard"
             style="${buttonStyles}">
            View Dashboard
          </a>
        </div>

        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            CapStack AI - Building Financial Safety Nets<br>
            <a href="#" style="color: #667eea; text-decoration: none;">Unsubscribe</a> |
            <a href="#" style="color: #667eea; text-decoration: none;">Privacy Policy</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
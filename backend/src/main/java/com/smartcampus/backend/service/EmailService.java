package com.smartcampus.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public void sendInvitationEmail(String recipientEmail, String recipientName, String invitationToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject("Invitation to Join Smart Campus Operations Hub");

            String invitationLink = "http://localhost:3000/accept-invitation?token=" + invitationToken;
            
            String htmlContent = buildInvitationEmailHtml(recipientName, invitationLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Invitation email sent successfully to: {}", recipientEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            logger.error("Failed to send invitation email to: {}", recipientEmail, e);
            throw new RuntimeException("Failed to send invitation email", e);
        }
    }

    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(recipientEmail);
            helper.setSubject("Reset your Smart Campus password");

            String resetLink = frontendBaseUrl + "/reset-password?token=" + resetToken;
            String htmlContent = buildPasswordResetEmailHtml(recipientName, resetLink);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", recipientEmail);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            logger.error("Failed to send password reset email to: {}", recipientEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    private String buildPasswordResetEmailHtml(String recipientName, String resetLink) {
        String displayName = recipientName == null || recipientName.isBlank() ? "there" : recipientName;

        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 20px; text-align: center; border-radius: 6px 6px 0 0; }
                    .content { background-color: white; padding: 24px; border-radius: 0 0 6px 6px; }
                    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
                    .info-box { background-color: #eef2ff; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>

                        <p>We received a request to reset your password for the <strong>Smart Campus Operations Hub</strong>.</p>

                        <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>

                        <center>
                            <a href="%s" class="button">Reset Password</a>
                        </center>

                        <div class="info-box">
                            <strong>Security note:</strong> If you did not request this password reset, you can ignore this email and your password will remain unchanged.
                        </div>

                        <p>If the button does not work, copy and paste this URL into your browser:</p>
                        <p><a href="%s">%s</a></p>

                        <p>Best regards,<br>
                        <strong>Smart Campus Operations Hub Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(displayName, resetLink, resetLink, resetLink);
    }

    private String buildInvitationEmailHtml(String recipientName, String invitationLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                    .content { background-color: white; padding: 20px; border-radius: 0 0 5px 5px; }
                    .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; 
                              text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #777; font-size: 12px; margin-top: 20px; }
                    .info-box { background-color: #e7f3ff; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Smart Campus Operations Hub!</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        
                        <p>You have been invited to join the <strong>Smart Campus Operations Hub</strong> as a Lecturer.</p>
                        
                        <p>Please click the button below to accept your invitation and create your account:</p>
                        
                        <center>
                            <a href="%s" class="button">Accept Invitation</a>
                        </center>
                        
                        <div class="info-box">
                            <strong>Note:</strong> This invitation link will expire in 7 days. If you don't accept it by then, 
                            you'll need to request a new invitation from the administrator.
                        </div>
                        
                        <p>If you have any questions, please contact the campus administration.</p>
                        
                        <p>Best regards,<br>
                        <strong>Smart Campus Operations Hub Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(recipientName, invitationLink);
    }

    public void sendNotificationEmail(String recipientEmail, String subject, String message) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(fromEmail);
            email.setTo(recipientEmail);
            email.setSubject(subject);
            email.setText(message);
            
            mailSender.send(email);
            logger.info("Notification email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            logger.error("Failed to send notification email to: {}", recipientEmail, e);
            throw new RuntimeException("Failed to send notification email", e);
        }
    }
}

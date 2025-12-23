import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpSecure = this.configService.get<boolean>('SMTP_SECURE', false);

    if (!smtpHost) {
      this.logger.warn('SMTP not configured. Email notifications will be logged only.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: smtpUser && smtpPassword ? {
        user: smtpUser,
        pass: smtpPassword,
      } : undefined,
    });

    this.logger.log('Email transporter initialized');
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.log(`[Email Preview] To: ${options.to}, Subject: ${options.subject}`);
      return;
    }

    try {
      const from = this.configService.get<string>('SMTP_FROM', 'Bricolage <noreply@bricolage.app>');

      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = 'Bienvenue à Bricolage!';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue à Bricolage!</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Votre compte a été créé avec succès. Vous pouvez maintenant accéder à notre plateforme de location d'outils.</p>
              <p>Votre adhésion est valable pour un an à partir d'aujourd'hui.</p>
              <p><strong>Rappel:</strong> Les locations commencent le vendredi et se terminent le vendredi suivant.</p>
              <p>Cordialement,<br>L'équipe Bricolage</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Bienvenue ${name}! Votre compte a été créé avec succès.`;

    await this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Send rental confirmation email
   */
  async sendRentalConfirmation(
    email: string,
    name: string,
    toolName: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const subject = 'Confirmation de location - Bricolage';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .details { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Confirmation de Location</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Votre demande de location a été confirmée!</p>
              <div class="details">
                <h3>Détails de la location</h3>
                <p><strong>Outil:</strong> ${toolName}</p>
                <p><strong>Date de début:</strong> ${startDate.toLocaleDateString('fr-FR')}</p>
                <p><strong>Date de fin:</strong> ${endDate.toLocaleDateString('fr-FR')}</p>
              </div>
              <p><strong>Rappel:</strong> Merci de retourner l'outil dans le même état et à la date prévue.</p>
              <p>Cordialement,<br>L'équipe Bricolage</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Location confirmée: ${toolName} du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;

    await this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Send rental return reminder
   */
  async sendReturnReminder(
    email: string,
    name: string,
    toolName: string,
    returnDate: Date,
  ): Promise<void> {
    const subject = 'Rappel: Retour de location - Bricolage';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .warning { background-color: #fff3cd; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rappel de Retour</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <p>Ceci est un rappel concernant votre location en cours.</p>
              <div class="warning">
                <h3>Information de retour</h3>
                <p><strong>Outil:</strong> ${toolName}</p>
                <p><strong>Date de retour prévue:</strong> ${returnDate.toLocaleDateString('fr-FR')}</p>
              </div>
              <p>Merci de retourner l'outil à temps pour éviter des frais supplémentaires.</p>
              <p>Cordialement,<br>L'équipe Bricolage</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Rappel: Retour de ${toolName} prévu le ${returnDate.toLocaleDateString('fr-FR')}`;

    await this.sendEmail({ to: email, subject, html, text });
  }

  /**
   * Send membership expiry notification
   */
  async sendMembershipExpiryNotification(
    email: string,
    name: string,
    expiryDate: Date,
  ): Promise<void> {
    const subject = 'Renouvellement d\'adhésion - Bricolage';
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #F44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .alert { background-color: #ffebee; padding: 15px; margin: 15px 0; border-left: 4px solid #F44336; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Renouvellement d'Adhésion</h1>
            </div>
            <div class="content">
              <p>Bonjour ${name},</p>
              <div class="alert">
                <p><strong>Votre adhésion expire bientôt!</strong></p>
                <p>Date d'expiration: ${expiryDate.toLocaleDateString('fr-FR')}</p>
              </div>
              <p>Pour continuer à profiter de nos services, merci de renouveler votre adhésion.</p>
              <p>Contactez-nous pour plus d'informations.</p>
              <p>Cordialement,<br>L'équipe Bricolage</p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Votre adhésion expire le ${expiryDate.toLocaleDateString('fr-FR')}. Merci de la renouveler.`;

    await this.sendEmail({ to: email, subject, html, text });
  }
}

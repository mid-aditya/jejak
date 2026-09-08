import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  /**
   * Send email confirmation email after user registration.
   * Contains a confirmation link: {BASE_URL}/api/v1/auth/confirm-email?token={token}
   */
  async sendEmailConfirmation(
    to: string,
    fullName: string,
    confirmationUrl: string,
  ): Promise<void> {
    const fromName = this.configService.get('SMTP_FROM_NAME', 'Jejak App');
    const fromEmail = this.configService.get('SMTP_FROM_EMAIL', 'noreply@jejak.app');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: 'Verifikasi Email - Jejak App',
      html: this.buildConfirmationEmailHtml(fullName, confirmationUrl),
      text: this.buildConfirmationEmailText(fullName, confirmationUrl),
    });
  }

  /**
   * Send password reset email.
   * Contains a reset link: {BASE_URL}/api/v1/auth/reset-password?token={token}
   */
  async sendPasswordReset(
    to: string,
    fullName: string,
    resetUrl: string,
  ): Promise<void> {
    const fromName = this.configService.get('SMTP_FROM_NAME', 'Jejak App');
    const fromEmail = this.configService.get('SMTP_FROM_EMAIL', 'noreply@jejak.app');

    await this.transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: 'Reset Password - Jejak App',
      html: this.buildPasswordResetEmailHtml(fullName, resetUrl),
      text: this.buildPasswordResetEmailText(fullName, resetUrl),
    });
  }

  private buildConfirmationEmailHtml(fullName: string, url: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a7a4a, #2d9d6e); padding: 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px 24px; }
    .body h2 { color: #333; font-size: 18px; margin: 0 0 16px; }
    .body p { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #1a7a4a; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 16px 0; }
    .btn:hover { background: #2d9d6e; }
    .link-box { background: #f8f8f8; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 13px; color: #888; margin-top: 16px; }
    .footer { padding: 16px 24px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏔️ Jejak App</h1>
    </div>
    <div class="body">
      <h2>Halo, ${fullName}!</h2>
      <p>Terima kasih telah mendaftar di Jejak App. Klik tombol di bawah untuk memverifikasi alamat email Anda:</p>
      <div style="text-align: center;">
        <a href="${url}" class="btn">Verifikasi Email</a>
      </div>
      <p>Link ini akan kadaluarsa dalam 24 jam.</p>
      <p>Jika Anda tidak merasa mendaftar di Jejak App, abaikan email ini.</p>
      <div class="link-box">
        Atau salin dan buka link ini di browser:<br>
        <a href="${url}" style="color: #1a7a4a;">${url}</a>
      </div>
    </div>
    <div class="footer">
      Jejak App — Aplikasi Pendakian Indonesia<br>
      Email ini dikirim otomatis, jangan dibalas.
    </div>
  </div>
</body>
</html>`;
  }

  private buildConfirmationEmailText(fullName: string, url: string): string {
    return `Halo ${fullName}!

Terima kasih telah mendaftar di Jejak App.

Klik link berikut untuk memverifikasi email Anda:
${url}

Link ini akan kadaluarsa dalam 24 jam.

Jika Anda tidak merasa mendaftar di Jejak App, abaikan email ini.

---
Jejak App — Aplikasi Pendakian Indonesia`;
  }

  private buildPasswordResetEmailHtml(fullName: string, url: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #e74c3c, #c0392b); padding: 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; }
    .body { padding: 32px 24px; }
    .body h2 { color: #333; font-size: 18px; margin: 0 0 16px; }
    .body p { color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #e74c3c; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 16px 0; }
    .btn:hover { background: #c0392b; }
    .link-box { background: #f8f8f8; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 13px; color: #888; margin-top: 16px; }
    .footer { padding: 16px 24px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏔️ Jejak App</h1>
    </div>
    <div class="body">
      <h2>Reset Password</h2>
      <p>Halo, ${fullName}!</p>
      <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah:</p>
      <div style="text-align: center;">
        <a href="${url}" class="btn">Reset Password</a>
      </div>
      <p>Link ini hanya berlaku selama 1 jam.</p>
      <p>Jika Anda tidak merasa meminta reset password, abaikan email ini — akun Anda tetap aman.</p>
      <div class="link-box">
        Atau salin dan buka link ini di browser:<br>
        <a href="${url}" style="color: #e74c3c;">${url}</a>
      </div>
    </div>
    <div class="footer">
      Jejak App — Aplikasi Pendakian Indonesia<br>
      Email ini dikirim otomatis, jangan dibalas.
    </div>
  </div>
</body>
</html>`;
  }

  private buildPasswordResetEmailText(fullName: string, url: string): string {
    return `Reset Password — Jejak App

Halo ${fullName}!

Kami menerima permintaan untuk mereset password akun Anda.

Klik link berikut untuk reset password:
${url}

Link ini hanya berlaku selama 1 jam.

Jika Anda tidak merasa meminta reset password, abaikan email ini — akun Anda tetap aman.

---
Jejak App — Aplikasi Pendakian Indonesia`;
  }
}

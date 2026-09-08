import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { UserService } from "../user/user.service";
import { User } from "../user/user.entity";
import { EmailService } from "../email/email.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import axios from "axios";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, fullName } = registerDto;

    if (!email) {
      throw new BadRequestException("Email is required");
    }

    // Check if email already exists
    const existingEmail = await this.userService.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (email NOT verified yet)
    const user = await this.userService.createUser({
      email,
      password: hashedPassword,
      fullName,
      roles: ["solo_traveler"],
      emailVerified: false,
    });

    // Generate confirmation token (UUID v4)
    const confirmationToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.userService.setEmailConfirmationToken(user.id, confirmationToken, expiry);

    // Build confirmation URL
    const baseUrl = this.configService.get("BASE_URL", "https://jejak.codeit.id");
    const confirmationUrl = `${baseUrl}/api/v1/auth/confirm-email?token=${confirmationToken}`;

    // Send confirmation email (fire-and-forget, don't fail registration if email fails)
    this.emailService
      .sendEmailConfirmation(email, fullName, confirmationUrl)
      .catch((err) => console.error("Failed to send confirmation email:", err.message));

    return {
      message: "Registration successful. Please check your email to verify your account.",
    };
  }

  async confirmEmail(token: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException("Confirmation token is required");
    }

    const user = await this.userService.findByEmailConfirmationToken(token);
    if (!user) {
      throw new BadRequestException("Invalid confirmation token");
    }

    const isExpired =
      user.emailConfirmationExpiry && new Date() > new Date(user.emailConfirmationExpiry);
    if (isExpired) {
      throw new BadRequestException("Confirmation token has expired. Please request a new one.");
    }

    await this.userService.confirmEmail(user.id, token);

    return {
      message: "Email verified successfully. You can now login.",
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const { emailOrPhone, password } = loginDto;

    // Find user by email or phone
    let user = await this.userService.findByEmail(emailOrPhone);
    if (!user) {
      user = await this.userService.findByPhone(emailOrPhone);
    }

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user has password (social login users may not have password)
    if (!user.password) {
      throw new UnauthorizedException("Please login with social provider");
    }

    // Email/password users MUST verify email first
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        "Please verify your email first. Check your inbox for the confirmation link.",
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    // Never return the password hash to the client
    const { password: _password, ...safeUser } = user;
    return { user: safeUser as User, tokens };
  }

  async socialLogin(
    provider: "google" | "facebook" | "instagram",
    token: string,
  ): Promise<{
    user: User;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    // Validate token with provider
    let socialEmail: string;
    let socialId: string;
    let avatar: string | undefined;

    switch (provider) {
      case "google": {
        const googleUser = await this.validateGoogleToken(token);
        socialEmail = googleUser.email;
        socialId = googleUser.id;
        avatar = googleUser.picture;
        break;
      }
      case "facebook": {
        const facebookUser = await this.validateFacebookToken(token);
        socialEmail = facebookUser.email;
        socialId = facebookUser.id;
        avatar = facebookUser.picture?.url;
        break;
      }
      case "instagram": {
        const instagramUser = await this.validateInstagramToken(token);
        socialEmail = instagramUser.id + "@instagram.user";
        socialId = instagramUser.id;
        avatar = instagramUser.profile_picture;
        break;
      }
    }

    // Create or link user
    const user = await this.userService.createOrLinkSocialUser(
      provider,
      socialId,
      socialEmail,
      socialEmail.split("@")[0], // Use email prefix as fullName
      avatar,
    );

    // Update last login
    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    // Never return the password hash to the client
    const { password: _password, ...safeUser } = user;
    return { user: safeUser as User, tokens };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_SECRET"),
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.userService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or inactive");
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  async verifyEmail(
    userId: string,
    otp: string,
  ): Promise<{ verified: boolean }> {
    // Legacy OTP method — for future use with SMS
    const user = await this.userService.findById(userId);
    user.emailVerified = true;
    await this.userService.saveUser(user);
    return { verified: true };
  }

  async verifyPhone(
    userId: string,
    otp: string,
  ): Promise<{ verified: boolean }> {
    // Legacy OTP method — for future use with SMS
    const user = await this.userService.findById(userId);
    user.phoneVerified = true;
    await this.userService.saveUser(user);
    return { verified: true };
  }

  async forgotPassword(emailOrPhone: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(emailOrPhone);
    const userByPhone = await this.userService.findByPhone(emailOrPhone);
    const userFound = user || userByPhone;

    // Always return success to prevent email enumeration
    if (!userFound) {
      return { message: "If an account with that email exists, a password reset link has been sent." };
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userService.setPasswordResetToken(userFound.id, resetToken, expiry);

    // Build reset URL
    const baseUrl = this.configService.get("BASE_URL", "https://jejak.codeit.id");
    const resetUrl = `${baseUrl}/api/v1/auth/reset-password?token=${resetToken}`;

    // Send reset email
    this.emailService
      .sendPasswordReset(userFound.email, userFound.fullName, resetUrl)
      .catch((err) => console.error("Failed to send password reset email:", err.message));

    return { message: "If an account with that email exists, a password reset link has been sent." };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException("Reset token is required");
    }

    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException("Password must be at least 8 characters");
    }

    const user = await this.userService.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestException("Invalid reset token");
    }

    const isExpired =
      user.passwordResetExpiry && new Date() > new Date(user.passwordResetExpiry);
    if (isExpired) {
      throw new BadRequestException("Reset token has expired. Please request a new one.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.resetPassword(user.id, hashedPassword);

    return { message: "Password has been reset successfully. You can now login." };
  }

  async resendConfirmation(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists
      return { message: "If that email is registered and unverified, a new confirmation link has been sent." };
    }

    if (user.emailVerified) {
      return { message: "Email is already verified. Please login." };
    }

    // Generate new confirmation token
    const confirmationToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.userService.setEmailConfirmationToken(user.id, confirmationToken, expiry);

    const baseUrl = this.configService.get("BASE_URL", "https://jejak.codeit.id");
    const confirmationUrl = `${baseUrl}/api/v1/auth/confirm-email?token=${confirmationToken}`;

    this.emailService
      .sendEmailConfirmation(email, user.fullName, confirmationUrl)
      .catch((err) => console.error("Failed to resend confirmation email:", err.message));

    return { message: "If that email is registered and unverified, a new confirmation link has been sent." };
  }

  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { sub: user.id, email: user.email, roles: user.roles };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get("JWT_EXPIRY", "15m"),
    });

    const refreshToken = this.jwtService.sign(
      { ...payload, type: "refresh" },
      { expiresIn: this.configService.get("JWT_REFRESH_EXPIRY", "7d") },
    );

    return { accessToken, refreshToken };
  }

  private async validateGoogleToken(
    token: string,
  ): Promise<{ id: string; email: string; picture?: string }> {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  }

  private async validateFacebookToken(token: string): Promise<any> {
    const response = await axios.get(`https://graph.facebook.com/me`, {
      params: { fields: "id,email,picture", access_token: token },
    });
    return response.data;
  }

  private async validateInstagramToken(token: string): Promise<any> {
    const response = await axios.get("https://graph.instagram.com/me", {
      params: { fields: "id,username,profile_picture", access_token: token },
    });
    return response.data;
  }

  async validateUser(payload: { sub: string }): Promise<User | null> {
    return this.userService.findById(payload.sub);
  }
}

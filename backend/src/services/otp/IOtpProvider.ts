export type OtpPurpose = 'REGISTER' | 'FORGOT_PASSWORD' | 'VERIFY_PHONE';

export interface OtpPayload {
  recipient: string; // Email address or BD phone number
  code: string;      // Plain 6-digit OTP
  purpose: OtpPurpose;
  userName?: string;
}

export interface IOtpProvider {
  sendOtp(payload: OtpPayload): Promise<boolean>;
}

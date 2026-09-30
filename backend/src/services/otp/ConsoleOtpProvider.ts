import { IOtpProvider, OtpPayload } from './IOtpProvider.js';

export class ConsoleOtpProvider implements IOtpProvider {
  async sendOtp(payload: OtpPayload): Promise<boolean> {
    console.log('\n======================================================');
    console.log(`[ROVIN OTP CONSOLE GATEWAY]`);
    console.log(`Purpose   : ${payload.purpose}`);
    console.log(`Recipient : ${payload.recipient}`);
    console.log(`Code      : >>> ${payload.code} <<< (Valid for 5 minutes)`);
    console.log(`Timestamp : ${new Date().toISOString()}`);
    console.log('======================================================\n');
    return true;
  }
}

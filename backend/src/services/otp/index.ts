import { IOtpProvider } from './IOtpProvider.js';
import { ConsoleOtpProvider } from './ConsoleOtpProvider.js';
import { EmailOtpProvider } from './EmailOtpProvider.js';

let otpProviderInstance: IOtpProvider | null = null;

export function getOtpProvider(): IOtpProvider {
  if (!otpProviderInstance) {
    const providerType = (process.env.OTP_PROVIDER || 'CONSOLE').toUpperCase();

    switch (providerType) {
      case 'EMAIL':
        otpProviderInstance = new EmailOtpProvider();
        break;
      case 'CONSOLE':
      default:
        otpProviderInstance = new ConsoleOtpProvider();
        break;
    }
  }

  return otpProviderInstance;
}

export * from './IOtpProvider.js';

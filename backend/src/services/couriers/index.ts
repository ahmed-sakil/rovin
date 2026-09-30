import { ICourierProvider } from './ICourierProvider.js';
import { SteadfastCourierService } from './SteadfastCourierService.js';
import { PathaoCourierService } from './PathaoCourierService.js';
import { ManualCourierService } from './ManualCourierService.js';

export function getCourierService(provider: 'STEADFAST' | 'PATHAO' | 'MANUAL'): ICourierProvider {
  switch (provider) {
    case 'STEADFAST':
      return new SteadfastCourierService();
    case 'PATHAO':
      return new PathaoCourierService();
    case 'MANUAL':
    default:
      return new ManualCourierService();
  }
}

export * from './ICourierProvider.js';

import { Address } from './address';

export interface PersonTracking {
  id: number;
  lastName: string;
  firstName: string;
  dni: number;
  indicatorType: string;
  address: Address;
  phone: number;
}

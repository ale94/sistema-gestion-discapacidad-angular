export interface FreePassRequest {
  personId: number;
  reason?: string;
  status?: string;
  freePassExpiration?: string;
  requestDate?: string;
}

export interface FreePassResponse {
  id: number;
  personId: number;
  dni: number;
  fullName: string;
  reason: string;
  active: boolean;
  renewals: FreePassRenewalResponse[];
  status: string;
  createdAt: string;
  updatedAt: string;
  requestDate: string;
}

export interface FreePassRenewalRequest {
  freePassId: number;
  year: number;
  renewalDate?: string;
}

export interface FreePassRenewalResponse {
  id: number;
  freePassId: number;
  year: number;
  createdAt: string;
  renewalDate: string;
}

export interface NationalFreePassRequest {
  personId: number;
  tripDate?: string;
  ticketQuantity?: number;
  origin?: string;
  destination?: string;
  status?: string;
  reason?: string;
  freePassExpiration?: string;
  requestDate?: string;
}

export interface NationalFreePassResponse {
  id: number;
  personId: number;
  dni: number;
  fullName: string;
  tripDate: string;
  ticketQuantity: number;
  origin: string;
  destination: string;
  status: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
  requestDate: string;
}

export interface FreePassStatusRequest {
  status: string;
}

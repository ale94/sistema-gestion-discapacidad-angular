export interface FreePassRequest {
  personId: number;
  reason?: string;
  status?: string;
  freePassExpiration?: string;
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
}

export interface FreePassRenewalRequest {
  freePassId: number;
  year: number;
}

export interface FreePassRenewalResponse {
  id: number;
  freePassId: number;
  year: number;
  createdAt: string;
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
}

export interface FreePassStatusRequest {
  status: string;
}

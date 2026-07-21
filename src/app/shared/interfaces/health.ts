export interface Health {
  id: number;
  cudNumber: string;
  activeCud: boolean;
  expirationDate?: string;
  rehabilitationTreatment: boolean;
  diagnostic: string;
  disabilityType: string;
}

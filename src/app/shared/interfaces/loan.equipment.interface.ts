export interface LoanEquipment {
  id: number;
  requestDate: string;
  expiration: string;
  type: string;
  equipmentNumber: string;
  year: string;
  applicant: string;
  dni: number;
  address: string;
  phone: number;
  returnDate?: string;
}

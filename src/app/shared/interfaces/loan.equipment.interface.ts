export interface LoanEquipment {
  id: number;
  requestDate: Date;
  expiration: Date;
  type: string;
  equipmentNumber: number;
  year: number;
  applicant: string;
  dni: string;
  address: string;
  phone: string;
  returnDate?: Date;
}

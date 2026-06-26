export interface LoanEquipment {
  id: number;
  requestDate: Date;
  expiration: Date;
  type: string;
  equipmentNumber: string;
  year: string;
  applicant: string;
  dni: number;
  address: string;
  phone: number;
  returnDate?: Date;
}

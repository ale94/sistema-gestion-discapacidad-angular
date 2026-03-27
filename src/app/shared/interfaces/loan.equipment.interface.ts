export interface LoanEquipment {
  id: number;
  requestDate: Date;
  expiration: Date;
  type: string;
  equipmentNumber: number;
  year: number;
  applicant: string;
  dni: number;
  address: string;
  phone: number;
  returnDate?: Date;
}

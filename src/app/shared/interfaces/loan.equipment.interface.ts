export interface LoanEquipment {
  id: number;
  equipmentId: number;
  personId: number;
  deliveryDate: string;
  returnDate?: string;
  state: LoanState;
  observations?: string;
}

export type LoanState = 'ACTIVO' | 'DEVUELTO' | 'EXPIRADO';

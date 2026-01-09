export interface Equipment {
  id: number;
  code: string;
  type: string;
  description: string;
  state: EquipmentState;
  loanDate: string;
  returnDate: string;
}

export type EquipmentState = 'DISPONIBLE' | 'PRESTADO' | 'REPARACION' | 'BAJA';

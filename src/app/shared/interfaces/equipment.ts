import { EquipmentType } from "./equipment-type";

export interface Equipment {
  id: number;
  code: string;
  totalStock: number;
  status: EquipmentState;
  createdAt: Date;
  equipmentType: EquipmentType
}

export type EquipmentState = 'DISPONIBLE' | 'PRESTADO' | 'REPARACION' | 'BAJA';



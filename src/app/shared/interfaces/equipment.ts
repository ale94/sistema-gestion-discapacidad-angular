import { EquipmentType } from "./equipment-type";

export interface Equipment {
  // id: number;
  description: string;
  code: string;
  totalStock: number;
  totalAvailable: number;
  status: EquipmentState;
  // createdAt: Date;
  // equipmentType: EquipmentType
}

export type EquipmentState = 'DISPONIBLE' | 'PRESTADO' | 'REPARACION' | 'BAJA';



export enum TransportRequestStatus {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  DOCUMENTACION_INCOMPLETA = 'DOCUMENTACION_INCOMPLETA',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
  FINALIZADA = 'FINALIZADA'
}

export enum TransportRequestType {
  PASE_PROVINCIAL = 'PASE PROVINCIAL',
  PASAJE_NACIONAL = 'PASAJE NACIONAL',
  AMBOS = 'AMBOS'
}

export interface TransportRequest {
  id?: string;
  dni: string;
  firstName: string;
  lastName: string;
  dateBirth: string;
  phone: string;
  email: string;
  address: string;
  type: TransportRequestType;
  status: TransportRequestStatus;
  observations: string;
  createdAt: string;
  isRegisteredBeneficiary?: boolean;
}

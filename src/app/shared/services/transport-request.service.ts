import { inject, Injectable, signal, computed } from '@angular/core';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../interfaces/transport-request.interface';
import { FreePassService } from './free-pass.service';
import { PersonService } from './person.service';
import { FreePassResponse, NationalFreePassResponse } from '../interfaces/free-pass.interface';

@Injectable({
  providedIn: 'root',
})
export class TransportRequestService {
  private freePassService = inject(FreePassService);
  private personService = inject(PersonService);

  private requestsSignal = signal<TransportRequest[]>([]);
  requests = computed(() => this.requestsSignal());

  syncFromBackend() {
    const all: TransportRequest[] = [];

    for (const fp of this.freePassService.freePasses()) {
      all.push(this.fpToTransportRequest(fp));
    }

    for (const np of this.freePassService.nationalFreePasses()) {
      all.push(this.npToTransportRequest(np));
    }

    for (const r of this.freePassService.renewals()) {
      const parent = this.freePassService.freePasses().find(fp => fp.id === r.freePassId);
      const names = parent
        ? this.splitFullName(parent.fullName)
        : { first: '', last: '' };
      all.push({
        id: `renewal-${r.id}`,
        dni: '',
        firstName: names.first,
        lastName: names.last,
        dateBirth: '',
        phone: '',
        email: '',
        address: '',
        type: TransportRequestType.RENOVACION,
        status: TransportRequestStatus.APROBADA,
        observations: `Renovación año ${r.year}`,
        createdAt: r.createdAt,
        isRegisteredBeneficiary: true,
      });
    }

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.requestsSignal.set(all);
  }

  private splitFullName(fullName: string): { first: string; last: string } {
    const parts = fullName ? fullName.split(', ') : ['', ''];
    return { last: parts[0] || '', first: parts[1] || '' };
  }

  private fpToTransportRequest(fp: FreePassResponse): TransportRequest {
    const names = this.splitFullName(fp.fullName);
    return {
      id: `fp-${fp.id}`,
      dni: String(fp.dni ?? ''),
      firstName: names.first,
      lastName: names.last,
      dateBirth: '',
      phone: '',
      email: '',
      address: '',
      type: TransportRequestType.PASE_PROVINCIAL,
      status: this.mapStatus(fp.status),
      observations: fp.reason || '',
      createdAt: fp.createdAt,
      isRegisteredBeneficiary: true,
    };
  }

  private npToTransportRequest(np: NationalFreePassResponse): TransportRequest {
    const names = this.splitFullName(np.fullName);
    return {
      id: `np-${np.id}`,
      dni: String(np.dni ?? ''),
      firstName: names.first,
      lastName: names.last,
      dateBirth: '',
      phone: '',
      email: '',
      address: '',
      type: TransportRequestType.PASAJE_NACIONAL,
      status: this.mapStatus(np.status),
      observations: `${np.origin || ''} → ${np.destination || ''} | ${np.reason || ''}`,
      createdAt: np.createdAt,
      isRegisteredBeneficiary: true,
      tripDate: np.tripDate,
      ticketQuantity: np.ticketQuantity,
      origin: np.origin,
      destination: np.destination,
    };
  }

  private mapStatus(backendStatus: string): TransportRequestStatus {
    switch (backendStatus) {
      case 'APROBADO': return TransportRequestStatus.APROBADA;
      case 'RECHAZADO': return TransportRequestStatus.RECHAZADA;
      case 'DOCUMENTACIÓN_INCOMPLETA': return TransportRequestStatus.DOCUMENTACION_INCOMPLETA;
      case 'PENDIENTE': return TransportRequestStatus.PENDIENTE;
      default: return TransportRequestStatus.PENDIENTE;
    }
  }

  addRequest(req: TransportRequest): void {
    let personId = req.personId;

    if (!personId) {
      const person = this.personService.findByDni(req.dni);
      if (person) {
        personId = person.id;
      }
    }

    if (!personId) {
      const localId = `manual-${Date.now()}`;
      this.requestsSignal.update(reqs => [{ ...req, id: localId }, ...reqs]);
      return;
    }

    if (req.type === TransportRequestType.PASE_PROVINCIAL || req.type === TransportRequestType.AMBOS) {
      const exists = this.freePassService.freePasses().find(fp => fp.personId === personId);
      if (!exists) {
        this.freePassService.createFreePass({
          personId,
          reason: req.observations,
          freePassExpiration: req.freePassExpiration
        }).subscribe({
          next: () => this.syncFromBackend(),
          error: (err) => alert(err.error?.message || 'Error al crear pase libre. La persona ya podría tener uno.')
        });
      } else {
        alert('Esta persona ya posee un Pase Provincial.');
      }
    }

    if (req.type === TransportRequestType.PASAJE_NACIONAL || req.type === TransportRequestType.AMBOS) {
      this.freePassService.createNationalFreePass({
        personId,
        reason: req.observations,
        freePassExpiration: req.freePassExpiration,
        tripDate: req.tripDate,
        ticketQuantity: req.ticketQuantity,
        origin: req.origin,
        destination: req.destination,
      }).subscribe({
        next: () => this.syncFromBackend(),
        error: (err) => alert(err.error?.message || 'Error al crear pasaje nacional.')
      });
    }
  }

  updateRequest(id: string, updatedData: Partial<TransportRequest>): void {
    this.requestsSignal.update(reqs =>
      reqs.map(req => (req.id === id ? { ...req, ...updatedData } : req))
    );
  }

  deleteRequest(id: string): void {
    if (id.startsWith('fp-')) {
      this.freePassService.deleteFreePass(Number(id.replace('fp-', '')))
        .subscribe({
          next: () => this.syncFromBackend(),
          error: (err) => console.error('Error al eliminar pase libre:', err)
        });
    } else if (id.startsWith('np-')) {
      this.freePassService.deleteNationalFreePass(Number(id.replace('np-', '')))
        .subscribe({
          next: () => this.syncFromBackend(),
          error: (err) => console.error('Error al eliminar pase nacional:', err)
        });
    } else {
      this.requestsSignal.update(reqs => reqs.filter(req => req.id !== id));
    }
  }
}

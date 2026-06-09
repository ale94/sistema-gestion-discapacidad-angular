import { inject, Injectable, signal, computed } from '@angular/core';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../interfaces/transport-request.interface';
import { FreePassService } from './free-pass.service';
import { FreePassResponse, NationalFreePassResponse } from '../interfaces/free-pass.interface';

@Injectable({
  providedIn: 'root',
})
export class TransportRequestService {
  private freePassService = inject(FreePassService);

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
      dni: '',
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
      dni: '',
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
    const fpList = this.freePassService.freePasses();
    const person = fpList.find(fp => {
      const name = fp.fullName.toLowerCase();
      return name.includes(req.firstName.toLowerCase()) && name.includes(req.lastName.toLowerCase());
    });

    if ((req.type === TransportRequestType.PASE_PROVINCIAL || req.type === TransportRequestType.AMBOS) && person) {
      const exists = fpList.find(fp => fp.personId === person.personId);
      if (!exists) {
        this.freePassService.createFreePass({ personId: person.personId, reason: req.observations })
          .subscribe({ next: () => this.syncFromBackend() });
      }
    }

    if ((req.type === TransportRequestType.PASAJE_NACIONAL || req.type === TransportRequestType.AMBOS) && person) {
      this.freePassService.createNationalFreePass({ personId: person.personId, reason: req.observations })
        .subscribe({ next: () => this.syncFromBackend() });
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
        .subscribe({ next: () => this.syncFromBackend() });
    } else if (id.startsWith('np-')) {
      this.freePassService.deleteNationalFreePass(Number(id.replace('np-', '')))
        .subscribe({ next: () => this.syncFromBackend() });
    } else {
      this.requestsSignal.update(reqs => reqs.filter(req => req.id !== id));
    }
  }
}

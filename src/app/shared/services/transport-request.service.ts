import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, of, tap, catchError, throwError, switchMap } from 'rxjs';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../interfaces/transport-request.interface';
import { FreePassService } from './free-pass.service';
import { PersonService } from './person.service';
import { NotificationService } from './notification.service';
import { FreePassResponse, NationalFreePassResponse } from '../interfaces/free-pass.interface';

@Injectable({
  providedIn: 'root',
})
export class TransportRequestService {
  private freePassService = inject(FreePassService);
  private personService = inject(PersonService);
  private notification = inject(NotificationService);

  private requestsSignal = signal<TransportRequest[]>([]);
  requests = computed(() => this.requestsSignal());

  syncFromBackend() {
    const existingMap = new Map<string, TransportRequest>();
    for (const r of this.requestsSignal()) {
      existingMap.set(r.id!, r);
    }
    const all: TransportRequest[] = [];

    for (const fp of this.freePassService.freePasses()) {
      all.push(this.mergeExisting(this.fpToTransportRequest(fp), existingMap));
    }

    for (const np of this.freePassService.nationalFreePasses()) {
      all.push(this.mergeExisting(this.npToTransportRequest(np), existingMap));
    }

    for (const r of this.freePassService.renewals()) {
      const parent = this.freePassService.freePasses().find(fp => fp.id === r.freePassId);
      const names = parent
        ? this.splitFullName(parent.fullName)
        : { first: '', last: '' };
      all.push({
        id: `renewal-${r.id}`,
        dni: parent ? String(parent.dni ?? '') : '',
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
        personId: parent?.personId,
      });
    }

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    this.requestsSignal.set(all);
  }

  private mergeExisting(req: TransportRequest, existingMap: Map<string, TransportRequest>): TransportRequest {
    const old = existingMap.get(req.id!);
    if (!old) return req;
    return {
      ...req,
      firstName: old.firstName || req.firstName,
      lastName: old.lastName || req.lastName,
      dateBirth: req.dateBirth || old.dateBirth,
      phone: req.phone || old.phone,
      email: req.email || old.email,
      address: req.address || old.address,
    };
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
      personId: fp.personId,
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
      observations: np.reason || '',
      createdAt: np.createdAt,
      isRegisteredBeneficiary: true,
      personId: np.personId,
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
      this.notification.show('No se encontró la persona. Registre la persona primero.');
      return;
    }

    if (req.type === TransportRequestType.PASE_PROVINCIAL) {
      const exists = this.freePassService.freePasses().find(fp => fp.personId === personId);
      if (!exists) {
        this.freePassService.createFreePass({
          personId,
          reason: req.observations,
          status: this.toBackendStatus(req.status)
        }).subscribe({
          next: () => this.syncFromBackend(),
          error: (err) => {
            console.error('Error al crear pase libre:', err);
            this.notification.show('Error al guardar en el servidor. Intente nuevamente.');
          }
        });
      } else {
        this.notification.show('Esta persona ya posee un Pase Provincial.');
      }
    }

    if (req.type === TransportRequestType.PASAJE_NACIONAL) {
      const exists = this.freePassService.nationalFreePasses().find(np => np.personId === personId);
      if (!exists) {
        this.freePassService.createNationalFreePass({
          personId,
          reason: req.observations,
          status: this.toBackendStatus(req.status),
          freePassExpiration: req.freePassExpiration,
          tripDate: req.tripDate,
          ticketQuantity: req.ticketQuantity,
          origin: req.origin,
          destination: req.destination,
        }).subscribe({
          next: () => this.syncFromBackend(),
          error: (err) => {
            console.error('Error al crear pasaje nacional:', err);
            this.notification.show('Error al guardar en el servidor. Intente nuevamente.');
          }
        });
      } else {
        this.notification.show('Esta persona ya posee un Pasaje Nacional.');
      }
    }
  }

  updateRequest(id: string, updatedData: Partial<TransportRequest>): void {
    console.log('[updateRequest] id:', id, 'updatedData:', updatedData);

    const isConvertingToNational = id.startsWith('fp-') && updatedData.type === TransportRequestType.PASAJE_NACIONAL;
    const isConvertingToProvincial = id.startsWith('np-') && updatedData.type === TransportRequestType.PASE_PROVINCIAL;

    if (isConvertingToNational || isConvertingToProvincial) {
      this.handleTypeConversion(id, updatedData);
      return;
    }

    this.requestsSignal.update(reqs =>
      reqs.map(req => (req.id === id ? { ...req, ...updatedData } : req))
    );

    if (id.startsWith('fp-')) {
      const freePassId = Number(id.replace('fp-', ''));

      if (updatedData.status) {
        const backendStatus = this.toBackendStatus(updatedData.status);
        if (backendStatus) {
          this.freePassService.updateFreePassStatus(freePassId, backendStatus).subscribe({
            error: (err) => console.error('Error al actualizar estado del pase libre:', err)
          });
        }
      }

      this.freePassService.updateFreePass(freePassId, {
        personId: updatedData.personId || 0,
        reason: updatedData.observations,
        freePassExpiration: updatedData.freePassExpiration,
      }).subscribe({
        next: () => this.syncFromBackend(),
        error: (err) => {
          console.error('Error al actualizar pase libre:', err);
          this.notification.show('Error al actualizar pase libre: ' + (err.error?.message || err.message || JSON.stringify(err)));
        }
      });
    } else if (id.startsWith('np-')) {
      const nationalId = Number(id.replace('np-', ''));
      this.freePassService.updateNationalFreePass(nationalId, {
        personId: updatedData.personId || 0,
        reason: updatedData.observations,
        status: this.toBackendStatus(updatedData.status),
        freePassExpiration: updatedData.freePassExpiration,
        tripDate: updatedData.tripDate,
        ticketQuantity: updatedData.ticketQuantity,
        origin: updatedData.origin,
        destination: updatedData.destination,
      }).subscribe({
        next: () => this.syncFromBackend(),
        error: (err) => {
          console.error('Error al actualizar pasaje nacional:', err);
          this.notification.show('Error al actualizar pasaje nacional: ' + (err.error?.message || err.message || JSON.stringify(err)));
        }
      });
    }
  }

  private handleTypeConversion(id: string, updatedData: Partial<TransportRequest>): void {
    const isToNational = id.startsWith('fp-');
    const personId = updatedData.personId || 0;

    if (isToNational) {
      const freePassId = Number(id.replace('fp-', ''));
      this.freePassService.deleteFreePass(freePassId).pipe(
        switchMap(() => this.freePassService.createNationalFreePass({
          personId,
          reason: updatedData.observations,
          status: this.toBackendStatus(updatedData.status),
          freePassExpiration: updatedData.freePassExpiration,
          tripDate: updatedData.tripDate,
          ticketQuantity: updatedData.ticketQuantity,
          origin: updatedData.origin,
          destination: updatedData.destination,
        }))
      ).subscribe({
        next: () => {
          this.freePassService.loadAll();
          this.notification.show('Pase convertido de Provincial a Nacional correctamente.');
        },
        error: (err) => {
          console.error('Error al convertir pase a nacional:', err);
          this.notification.show('Error al convertir el tipo de pase. Intente nuevamente.');
          this.freePassService.loadAll();
        }
      });
    } else {
      const nationalId = Number(id.replace('np-', ''));
      this.freePassService.deleteNationalFreePass(nationalId).pipe(
        switchMap(() => this.freePassService.createFreePass({
          personId,
          reason: updatedData.observations,
          status: this.toBackendStatus(updatedData.status),
        }))
      ).subscribe({
        next: () => {
          this.freePassService.loadAll();
          this.notification.show('Pase convertido de Nacional a Provincial correctamente.');
        },
        error: (err) => {
          console.error('Error al convertir pase a provincial:', err);
          this.notification.show('Error al convertir el tipo de pase. Intente nuevamente.');
          this.freePassService.loadAll();
        }
      });
    }
  }

  private toBackendStatus(status?: TransportRequestStatus): string | undefined {
    if (!status) return undefined;
    switch (status) {
      case TransportRequestStatus.APROBADA: return 'APROBADO';
      case TransportRequestStatus.RECHAZADA: return 'RECHAZADO';
      case TransportRequestStatus.DOCUMENTACION_INCOMPLETA: return 'DOCUMENTACIÓN_INCOMPLETA';
      case TransportRequestStatus.PENDIENTE: return 'PENDIENTE';
      default: return undefined;
    }
  }

  deleteRequest(id: string): Observable<void> {
    if (id.startsWith('fp-')) {
      return this.freePassService.deleteFreePass(Number(id.replace('fp-', ''))).pipe(
        tap(() => this.syncFromBackend())
      );
    } else if (id.startsWith('np-')) {
      return this.freePassService.deleteNationalFreePass(Number(id.replace('np-', ''))).pipe(
        tap(() => this.syncFromBackend())
      );
    } else if (id.startsWith('renewal-')) {
      return this.freePassService.deleteRenewal(Number(id.replace('renewal-', ''))).pipe(
        tap(() => this.syncFromBackend())
      );
    } else {
      this.requestsSignal.update(reqs => reqs.filter(req => req.id !== id));
      return of(void 0);
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { catchError, throwError, tap } from 'rxjs';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../interfaces/transport-request.interface';
import { Person } from '../interfaces/person';

@Injectable({
  providedIn: 'root',
})
export class TransportRequestService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080';

  private requestsSignal = signal<TransportRequest[]>(this.loadFromStorage());
  requests = computed(() => this.requestsSignal());

  private personsSignal = signal<Person[]>([]);
  persons = computed(() => this.personsSignal());

  constructor() {
    this.loadPersons();
    effect(() => {
      localStorage.setItem('transportRequestsData', JSON.stringify(this.requestsSignal()));
    });
  }

  loadPersons() {
    this.http
      .get<Person[]>(`${this.url}/persons`)
      .pipe(
        catchError(() => {
          this.personsSignal.set([]);
          return [];
        })
      )
      .subscribe((data) => this.personsSignal.set(data ?? []));
  }

  checkIfRegistered(dni: string): boolean {
    return this.persons().some((p: Person) => p.dni.toString() === dni);
  }

  addRequest(req: TransportRequest): void {
    const newReq = {
      ...req,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isRegisteredBeneficiary: this.checkIfRegistered(req.dni),
    };
    this.requestsSignal.update(reqs => [newReq, ...reqs]);
  }

  updateRequest(id: string, updatedData: Partial<TransportRequest>): void {
    const dni = updatedData.dni ?? '';
    this.requestsSignal.update(reqs =>
      reqs.map(req => (req.id === id ? { ...req, ...updatedData, isRegisteredBeneficiary: this.checkIfRegistered(dni || req.dni) } : req))
    );
  }

  deleteRequest(id: string): void {
    this.requestsSignal.update(reqs => reqs.filter(req => req.id !== id));
  }

  private loadFromStorage(): TransportRequest[] {
    try {
      const stored = localStorage.getItem('transportRequestsData');
      return stored ? JSON.parse(stored) : this.getMockData();
    } catch {
      return this.getMockData();
    }
  }

  private getMockData(): TransportRequest[] {
    const base = {
      phone: '3814445555',
      email: 'juan@example.com',
      address: 'San Martín 123',
      observations: 'Presentó certificado médico.',
    };
    const list: TransportRequest[] = [];
    const names = [
      { firstName: 'Juan', lastName: 'Pérez', dni: '12345678' },
      { firstName: 'María', lastName: 'Gómez', dni: '87654321' },
      { firstName: 'Carlos', lastName: 'López', dni: '11223344' },
      { firstName: 'Ana', lastName: 'Martínez', dni: '44332211' },
      { firstName: 'Luis', lastName: 'Fernández', dni: '55667788' },
      { firstName: 'Sofía', lastName: 'Díaz', dni: '99887766' },
      { firstName: 'Pedro', lastName: 'Ruiz', dni: '12121212' },
      { firstName: 'Laura', lastName: 'Sánchez', dni: '34343434' },
      { firstName: 'Diego', lastName: 'Acosta', dni: '56565656' },
      { firstName: 'Valentina', lastName: 'Medina', dni: '78787878' },
    ];
    names.forEach((n, i) => {
      list.push({
        id: `${i + 1}`,
        ...base,
        ...n,
        dateBirth: '1980-05-12',
        type: i % 3 === 0 ? TransportRequestType.PASE_PROVINCIAL : i % 3 === 1 ? TransportRequestType.PASAJE_NACIONAL : TransportRequestType.AMBOS,
        status: i < 3 ? TransportRequestStatus.APROBADA : i < 6 ? TransportRequestStatus.PENDIENTE : i < 8 ? TransportRequestStatus.EN_REVISION : i < 9 ? TransportRequestStatus.DOCUMENTACION_INCOMPLETA : TransportRequestStatus.RECHAZADA,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        isRegisteredBeneficiary: i % 2 === 0,
      });
    });
    return list;
  }
}

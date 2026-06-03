import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Person } from '../interfaces/person';

@Injectable({
  providedIn: 'root',
})
export class PersonService {

  private http = inject(HttpClient);
  private url = 'http://localhost:8080';
  persons = signal<Person[]>([]);

  constructor() {
    this.loadPersons();
  }

  loadPersons() {
    this.http.get<Person[]>(`${this.url}/persons`)
      .pipe(
        catchError(() => {
          const mock = this.getMockData();
          this.persons.set(mock);
          return [];
        }),
        tap((data) => {
          const normalized = (data ?? []).map(p => ({ ...p, dni: Number(p.dni) }));
          this.persons.set(normalized.length ? normalized : this.getMockData());
        })
      )
      .subscribe();
  }

  findByDni(dni: string): Person | undefined {
    const normalized = String(dni).trim();
    return this.persons().find(p => String(p.dni) === normalized);
  }

  addPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.url}/persons`, person)
      .pipe(
        tap(newPerson =>
          this.persons.update((persons) => [...persons, newPerson])),
        catchError(() => {
          return throwError(() => new Error("No se pudo crear una persona"))
        })
      )
  }

  updatePerson(updatedPerson: Person): Observable<Person> {
    return this.http.put<Person>(`${this.url}/persons/${updatedPerson.id}`, updatedPerson)
      .pipe(
        tap(person =>
          this.persons.update((persons) =>
            persons.map((p) => (p.id === person.id ? person : p)))
        ),
        catchError(() => {
          return throwError(() => new Error("No se pudo actualizar una persona"))
        })
      )
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/persons/${id}`)
      .pipe(
        tap(() =>
          this.persons.update((persons) => persons.filter((p) => p.id !== id))),
        catchError(() => {
          return throwError(() => new Error("No se pudo borrar una persona"))
        })
      )
  }

  private getMockData(): Person[] {
    function baseAddress() {
      return {
        id: 0, street: 'Av. San Martín 1000', city: 'San Miguel de Tucumán', province: 'Tucumán', postalCode: '4000'
      } as any;
    }
    function baseDate() {
      return new Date('1990-01-01');
    }
    return [
      { id: 1, firstName: 'Juan', lastName: 'Pérez', dni: 12345678, civilStatus: 'Soltero', dateBirth: baseDate(), tutor: '', phone: 3814445555, gender: 'Masculino', registrationDate: baseDate(), education: { id: 0, level: 'Primario', institution: '', complete: true } as any, work: { id: 0, situation: 'Desempleado', employment: '' } as any, health: { id: 0, cudNumber: 'CUD-001', activeCud: true, rehabilitationTreatment: false, diagnostic: 'Discapacidad motriz', disabilityType: 'Motriz' } as any, address: baseAddress(), benefit: { id: 0, federalProgram: false, pension: false, auh: false, merchandise: false, freePass: true } as any, familyMembers: [] },
      { id: 2, firstName: 'María', lastName: 'Gómez', dni: 87654321, civilStatus: 'Casada', dateBirth: baseDate(), tutor: '', phone: 3815556666, gender: 'Femenino', registrationDate: baseDate(), education: { id: 0, level: 'Secundario', institution: '', complete: true } as any, work: { id: 0, situation: 'Empleado', employment: 'Comercio' } as any, health: { id: 0, cudNumber: 'CUD-002', activeCud: true, rehabilitationTreatment: true, diagnostic: 'Discapacidad visual', disabilityType: 'Visual' } as any, address: baseAddress(), benefit: { id: 0, federalProgram: true, pension: true, auh: false, merchandise: false, freePass: true } as any, familyMembers: [] },
      { id: 3, firstName: 'Carlos', lastName: 'López', dni: 11223344, civilStatus: 'Soltero', dateBirth: baseDate(), tutor: '', phone: 3817778888, gender: 'Masculino', registrationDate: baseDate(), education: { id: 0, level: 'Terciario', institution: '', complete: false } as any, work: { id: 0, situation: 'Desempleado', employment: '' } as any, health: { id: 0, cudNumber: 'CUD-003', activeCud: true, rehabilitationTreatment: false, diagnostic: 'Discapacidad auditiva', disabilityType: 'Auditiva' } as any, address: baseAddress(), benefit: { id: 0, federalProgram: false, pension: false, auh: true, merchandise: false, freePass: true } as any, familyMembers: [] },
      { id: 4, firstName: 'Ana', lastName: 'Martínez', dni: 44332211, civilStatus: 'Viuda', dateBirth: baseDate(), tutor: '', phone: 3819990000, gender: 'Femenino', registrationDate: baseDate(), education: { id: 0, level: 'Primario', institution: '', complete: true } as any, work: { id: 0, situation: 'Pensionado', employment: '' } as any, health: { id: 0, cudNumber: 'CUD-004', activeCud: true, rehabilitationTreatment: true, diagnostic: 'Discapacidad motriz', disabilityType: 'Motriz' } as any, address: baseAddress(), benefit: { id: 0, federalProgram: true, pension: true, auh: false, merchandise: false, freePass: true } as any, familyMembers: [] },
      { id: 5, firstName: 'Luis', lastName: 'Fernández', dni: 55667788, civilStatus: 'Casado', dateBirth: baseDate(), tutor: '', phone: 3811234567, gender: 'Masculino', registrationDate: baseDate(), education: { id: 0, level: 'Secundario', institution: '', complete: true } as any, work: { id: 0, situation: 'Empleado', employment: 'Administración' } as any, health: { id: 0, cudNumber: 'CUD-005', activeCud: false, rehabilitationTreatment: false, diagnostic: 'Discapacidad intelectual', disabilityType: 'Intelectual' } as any, address: baseAddress(), benefit: { id: 0, federalProgram: false, pension: false, auh: false, merchandise: false, freePass: false } as any, familyMembers: [] },
    ];
  }
}

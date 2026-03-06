import { Injectable, signal } from '@angular/core';
import { Person } from '../interfaces/person';
import { CivilStatus } from '../enums/civil-status';
import { Gender } from '../enums/gender';
import { Status } from '../enums/status';
import { Education } from '../interfaces/education';
import { Work } from '../interfaces/work';
import { Health } from '../interfaces/health';
import { Address } from '../interfaces/address';
import { Benefit } from '../interfaces/benefit';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private people = signal<Person[]>([]);

  constructor() {
    // Load initial mock data
    if (this.people().length === 0) {
      this.people.set(this.generateMockData(1200));
      console.log(this.people());
    }
  }

  getPeople() {
    return this.people.asReadonly();
  }

  addPerson(person: Omit<Person, number>) {
    // const newPerson: Person = { ...person, id: this.generateId() };
    // this.people.update((people) => [...people, newPerson]);
  }

  updatePerson(updatedPerson: Person) {
    this.people.update((people) =>
      people.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)),
    );
  }

  deletePerson(id: number) {
    this.people.update((people) => people.filter((p) => p.id !== id));
  }

  private generateMockData(count: number): Person[] {
    const data: Person[] = [];

    const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia'];
    const lastNames = ['Gomez', 'Rodriguez', 'Perez', 'Fernandez', 'Lopez', 'Martinez'];

    const civilStatusValues = Object.values(CivilStatus) as CivilStatus[];
    const genderValues = Object.values(Gender) as Gender[];
    const statusValues = Object.values(Status) as Status[];

    for (let i = 0; i < count; i++) {
      const birthDate = new Date(
        1950 + Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      );

      const registrationDate = new Date(
        2020 + Math.floor(Math.random() * 4),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1,
      );

      const consultationDate = new Date();

      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      data.push({
        id: i + 1,
        firstName: firstName,
        lastName: lastName,
        dni: Math.floor(10000000 + Math.random() * 90000000).toString(),

        civilStatus: civilStatusValues[Math.floor(Math.random() * civilStatusValues.length)],
        dateBirth: birthDate,

        tutor: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,

        phone: `11-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,

        gender: genderValues[Math.floor(Math.random() * genderValues.length)],

        registrationDate: registrationDate,
        status: statusValues[Math.floor(Math.random() * statusValues.length)],

        indicatorType: 'Certificado CUD',
        consultationDate: consultationDate,

        education: {
          id: i + 1,
          name: 'Escuela Primaria',
          address: 'Calle Falsa 123',
          educationLevel: 'Secundaria',
        } as Education,

        work: {
          id: i + 1,
          companyName: `Empresa ${i + 1}`,
          status: Math.random() > 0.5 ? 'Activo' : 'Inactivo',
          address: `Avenida Siempre Viva ${i + 1}`,
          socialWork: Math.random() > 0.5,
          nameSocialWork: `Obra Social ${i + 1}`,
        } as Work,

        health: {
          id: i + 1,
          cudNumber: `CUD-${Math.floor(1000 + Math.random() * 9000)}`,
          activeCud: Math.random() > 0.5,
          rehabilitationTreatment: Math.random() > 0.5,
          diagnostic: 'Discapacidad Motriz',
          disabilityType: 'Motora',
        } as Health,

        address: {
          id: i + 1,
          street: `Calle ${i + 1}`,
          district: 'Ciudad',
          province: 'Provincia',
          locality: 'Localidad',
        } as Address,

        benefit: {
          pension: Math.random() > 0.5,
          federalProgram: Math.random() > 0.5,
          auh: Math.random() > 0.5,
          merchandise: Math.random() > 0.5,
          freePass: Math.random() > 0.5,
          id: i + 1,
        } as Benefit,
      });
    }

    return data;
  }
}

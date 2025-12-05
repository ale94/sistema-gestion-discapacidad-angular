import { Injectable, signal } from '@angular/core';
import { Person } from '../interfaces/Person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private people = signal<Person[]>([]);

  constructor() {
    // Load initial mock data
    if (this.people().length === 0) {
      this.people.set(this.generateMockData(35));
    }
  }

  getPeople() {
    return this.people.asReadonly();
  }

  addPerson(person: Omit<Person, 'id'>) {
    const newPerson: Person = { ...person, id: crypto.randomUUID() };
    this.people.update(people => [...people, newPerson]);
  }

  updatePerson(updatedPerson: Person) {
    this.people.update(people =>
      people.map(p => (p.id === updatedPerson.id ? updatedPerson : p))
    );
  }

  deletePerson(id: string) {
    this.people.update(people => people.filter(p => p.id !== id));
  }

  private generateMockData(count: number): Person[] {
    const data: Person[] = [];
    const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofia'];
    const lastNames = ['Gomez', 'Rodriguez', 'Perez', 'Fernandez', 'Lopez', 'Martinez'];
    const disabilities = ['Física', 'Sensorial', 'Intelectual', 'Psíquica', 'Múltiple'];
    const education = ['Ninguna', 'Primaria', 'Secundaria', 'Terciaria', 'Universitaria'];
    const jobStatus = ['Empleado', 'Desempleado', 'Independiente', 'No aplica'];

    for (let i = 0; i < count; i++) {
      const birthDate = new Date(1950 + Math.floor(Math.random() * 60), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const registrationDate = new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

      data.push({
        id: crypto.randomUUID(),
        nombreCompleto: `${lastName}, ${firstName}`,
        dni: Math.floor(10000000 + Math.random() * 90000000).toString(),
        fechaNacimiento: birthDate.toISOString().split('T')[0],
        domicilio: `Calle Falsa ${i + 123}`,
        tutor: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        telefono: `11-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        sexo: Math.random() > 0.5 ? 'Masculino' : 'Femenino',
        fechaEmpadronamiento: registrationDate.toISOString().split('T')[0],
        diagnostico: `Diagnóstico de prueba #${i + 1}`,
        tipoDiscapacidad: disabilities[Math.floor(Math.random() * disabilities.length)] as Person['tipoDiscapacidad'],
        numeroCUD: `CUD-${Math.floor(10000 + Math.random() * 90000)}`,
        cudVigente: Math.random() > 0.3,
        obraSocial: `OS ${String.fromCharCode(65 + i % 5)}`,
        escolaridad: education[Math.floor(Math.random() * education.length)] as Person['escolaridad'],
        situacionLaboral: jobStatus[Math.floor(Math.random() * jobStatus.length)] as Person['situacionLaboral'],
        pension: Math.random() > 0.5,
        bolsonMercaderia: Math.random() > 0.6,
        paseLibre: Math.random() > 0.4,
      });
    }
    return data;
  }

}

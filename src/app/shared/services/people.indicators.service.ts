import { Injectable, signal } from '@angular/core';
import { PeopleIndicator } from '../interfaces/people.indicator.interface';

@Injectable({
  providedIn: 'root',
})
export class PeopleIndicatorsService {
  private peopleIndicators = signal<PeopleIndicator[]>([]);

  constructor() {
    if (this.peopleIndicators().length === 0) {
      this.peopleIndicators.set(this.generateMockData(10));
    }
  }

  getPeopleIndicators() {
    return this.peopleIndicators.asReadonly();
  }

  addPerson(person: Omit<PeopleIndicator, 'id'>) {
    const newPerson: PeopleIndicator = {
      ...person,
      id: crypto.randomUUID(),
    };
    this.peopleIndicators.update((list) => [...list, newPerson]);
  }

  updatePerson(updatedPerson: PeopleIndicator) {
    this.peopleIndicators.update((list) =>
      list.map((p) => (p.id === updatedPerson.id ? updatedPerson : p))
    );
  }

  deletePerson(id: string) {
    this.peopleIndicators.update((list) => list.filter((p) => p.id !== id));
  }

  // Mock Data
  private generateMockData(count: number): PeopleIndicator[] {
    const data: PeopleIndicator[] = [];

    const nombres = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Laura', 'Pedro', 'Sofía'];
    const apellidos = ['Gómez', 'Rodríguez', 'Pérez', 'Fernández', 'López', 'Martínez'];
    const indicadoresDisponibles = [
      'Dificultad en el aprendizaje',
      'Dificultades en el lenguaje',
      'Trastornos de conducta (según diagnóstico presuntivo realizado por psicóloga – dificultades en el lenguaje)',
      'Retraso madurativo (según diagnóstico presuntivo realizado por psicóloga)',
      'Síndrome de Sjögren',
    ];

    for (let i = 0; i < count; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];

      const indicadores =
        indicadoresDisponibles[Math.floor(Math.random() * indicadoresDisponibles.length)];

      const fechaConsulta = new Date(
        2024,
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      )
        .toISOString()
        .split('T')[0];

      data.push({
        id: crypto.randomUUID(),
        apellidoNombre: `${apellido}, ${nombre}`,
        dni: Math.floor(20000000 + Math.random() * 30000000).toString(),
        indicadores,
        domicilio: `Calle ${i + 100} Nº ${Math.floor(Math.random() * 500)}`,
        fechaConsulta,
      });
    }

    return data;
  }
}

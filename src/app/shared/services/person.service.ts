import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Person } from '../interfaces/person';

@Injectable({
  providedIn: 'root',
})
export class PersonService {

  private http = inject(HttpClient);
  private url = "http://localhost:8080";
  persons = signal<Person[]>([]);

  constructor() {
    this.loadPersons();
  }

  loadPersons() {
    this.http.get<Person[]>(`${this.url}` + "/persons")
      .subscribe((data) => {
        this.persons.set(data);
      })
  }

  //addPerson(person: Omit<Person, number>) {
  // const newPerson: Person = { ...person, id: this.generateId() };
  // this.people.update((people) => [...people, newPerson]);
  //}

  // updatePerson(updatedPerson: Person) {
  //   this.people.update((people) =>
  //     people.map((p) => (p.id === updatedPerson.id ? updatedPerson : p)),
  //   );
  // }

  // deletePerson(id: number) {
  //   this.people.update((people) => people.filter((p) => p.id !== id));
  // }

}

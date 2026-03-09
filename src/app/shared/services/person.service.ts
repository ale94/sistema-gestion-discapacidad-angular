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

  addPerson(person: Person) {
    this.http.post<Person>(`${this.url}` + "/persons", person)
      .subscribe((newPerson) => {
        this.persons.update((persons) => [...persons, newPerson]);
      });
  }

  updatePerson(updatedPerson: Person) {
    this.http.put<Person>(`${this.url}/persons/${updatedPerson.id}`, updatedPerson)
      .subscribe((person) => {
        this.persons.update((persons) =>
          persons.map((p) => (p.id === person.id ? person : p)),
        );
      });
  }

  deletePerson(id: number) {
    this.http.delete(`${this.url}/persons/${id}`)
      .subscribe(() => {
        this.persons.update((persons) => persons.filter((p) => p.id !== id));
      });
  }

}

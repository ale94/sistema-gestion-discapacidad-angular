import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PersonTracking } from '../interfaces/person-tracking';

@Injectable({
  providedIn: 'root'
})
export class PersonTrackingService {

  private http = inject(HttpClient);
  private url = "http://localhost:8080";
  personsTracking = signal<PersonTracking[]>([]);

  constructor() {
    this.loadPersons();
  }

  loadPersons() {
    this.http.get<PersonTracking[]>(`${this.url}` + "/persons-tracking")
      .subscribe((data) => {
        this.personsTracking.set(data);
      })
  }

  addPerson(person: PersonTracking) {
    this.http.post<PersonTracking>(`${this.url}` + "/persons-tracking", person)
      .subscribe((newPerson) => {
        this.personsTracking.update((persons) => [...persons, newPerson]);
      });
  }

  updatePerson(updatedPerson: PersonTracking) {
    this.http.put<PersonTracking>(`${this.url}/persons-tracking/${updatedPerson.id}`, updatedPerson)
      .subscribe((person) => {
        this.personsTracking.update((persons) =>
          persons.map((p) => (p.id === person.id ? person : p)),
        );
      });
  }

  deletePerson(id: number) {
    this.http.delete(`${this.url}/persons-tracking/${id}`)
      .subscribe(() => {
        this.personsTracking.update((persons) => persons.filter((p) => p.id !== id));
      });
  }

}

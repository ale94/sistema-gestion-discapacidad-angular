import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { PersonTracking } from '../interfaces/person-tracking';
import { catchError, Observable, tap, throwError } from 'rxjs';

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

  addPerson(person: PersonTracking): Observable<PersonTracking> {
    return this.http.post<PersonTracking>(`${this.url}` + "/persons-tracking", person)
      .pipe(
        tap((newPerson) =>
          this.personsTracking.update((persons) => [...persons, newPerson])
        ),
        catchError(() => {
          return throwError(() => new Error("No se pudo crear una persona con seguimiento"))
        })
      );
  }

  updatePerson(updatedPerson: PersonTracking): Observable<PersonTracking> {
    return this.http.put<PersonTracking>(`${this.url}/persons-tracking/${updatedPerson.id}`, updatedPerson)
      .pipe(
        tap((person) => {
          this.personsTracking.update((persons) =>
            persons.map((p) => (p.id === person.id ? person : p)),
          )
        }),
        catchError(() => {
          return throwError(() => new Error("No se pudo actualizar una persona con seguimiento"))
        })
      );
  }

  deletePerson(id: number) {
    return this.http.delete(`${this.url}/persons-tracking/${id}`)
      .pipe(
        tap(() => {
          this.personsTracking.update((persons) => persons.filter((p) => p.id !== id));
        }),
        catchError(() => {
          return throwError(() => new Error("No se pudo borrar una persona con seguimiento"))
        })
      );
  }

}

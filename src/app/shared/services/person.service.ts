import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Person } from '../interfaces/person';
import { catchError, Observable, tap, throwError } from 'rxjs';

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

  addPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.url}` + "/persons", person)
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

}

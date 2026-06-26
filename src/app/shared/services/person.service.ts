import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { Person } from '../interfaces/person';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PersonService {

  private http = inject(HttpClient);
  private url = environment.apiUrl;
  persons = signal<Person[]>([]);
  loading = signal(false);

  loadPersons() {
    this.loading.set(true);
    this.http.get<Person[]>(`${this.url}/persons`)
      .pipe(
        catchError(() => {
          this.persons.set([]);
          return of(null);
        }),
        tap((data) => {
          if (data === null) return;
          const normalized = data.map(p => ({ ...p, dni: Number(p.dni) }));
          this.persons.set(normalized);
        })
      )
      .subscribe({ complete: () => this.loading.set(false) });
  }

  findByDni(dni: string): Person | undefined {
    const normalized = String(dni).trim();
    return this.persons().find(p => String(p.dni) === normalized);
  }

  findByDniHttp(dni: string): Observable<Person> {
    return this.http.get<Person>(`${this.url}/persons/dni/${dni}`).pipe(
      catchError(err => throwError(() => err))
    );
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
        catchError((err) => {
          console.error('HTTP error en updatePerson:', err.status, err.statusText, err.error);
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

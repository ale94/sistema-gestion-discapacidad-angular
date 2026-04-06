import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private url = "http://localhost:8080";

  users = signal<User[]>([]);

  constructor() {
    this.getAll();
  }

  getAll() {
    this.http.get<User[]>(`${this.url}` + "/users")
      .subscribe(data => this.users.set(data));
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.url}` + "/users", user).pipe(
      tap(newPerson =>
        this.users.update((users) => [...users, newPerson])),
      catchError(() => {
        return throwError(() => new Error("No se pudo crear un usuario"))
      })
    )
  }

  update(user: User): Observable<User> {
    return this.http.put<User>(`${this.url}/users/${user.id}`, user).pipe(
      tap(user =>
        this.users.update((users) =>
          users.map((u) => (u.id === user.id ? user : u)))
      ),
      catchError(() => {
        return throwError(() => new Error("No se pudo actualizar un usuario"))
      })
    )
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/users/${id}`).pipe(
      tap(() =>
        this.users.update((users) => users.filter((u) => u.id !== id))),
      catchError(() => {
        return throwError(() => new Error("No se pudo borrar un usuario"))
      })
    )
  }

}

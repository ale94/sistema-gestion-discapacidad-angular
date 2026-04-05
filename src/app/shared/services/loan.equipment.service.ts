import { inject, Injectable, signal } from '@angular/core';
import { LoanEquipment } from '../interfaces/loan.equipment.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoanEquipmentService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080';
  loans = signal<LoanEquipment[]>([]);

  constructor() {
    this.loadLoans();
  }

  loadLoans() {
    this.http.get<LoanEquipment[]>(`${this.url}` + '/loans').subscribe((data) => {
      this.loans.set(data);
    });
  }

  addLoan(loan: LoanEquipment): Observable<LoanEquipment> {
    return this.http.post<LoanEquipment>(`${this.url}` + '/loans', loan)
      .pipe(
        tap((newLoan) => {
          this.loans.update((loans) => [...loans, newLoan]);
        }),
        catchError(() => {
          return throwError(() => new Error("No se pudo crear un prestamo"))
        })
      );
  }

  updateLoan(updatedLoan: LoanEquipment): Observable<LoanEquipment> {
    return this.http
      .put<LoanEquipment>(`${this.url}/loans/${updatedLoan.id}`, updatedLoan)
      .pipe(
        tap((loan) => {
          this.loans.update((loans) =>
            loans.map((l) => (l.id === loan.id ? loan : l)),
          ), catchError(() => {
            return throwError(() => new Error("No se pudo actualizar un prestamo"))
          })
        }));
  }

  deleteLoan(id: number): Observable<Object> {
    return this.http.delete(`${this.url}/loans/${id}`)
      .pipe(
        tap(() => {
          this.loans.update((loans) => loans.filter((l) => l.id !== id));
        }), catchError(() => {
          return throwError(() => new Error("No se pudo borrar un prestamo"))
        })
      );
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { LoanEquipment } from '../interfaces/loan.equipment.interface';
import { HttpClient } from '@angular/common/http';

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

  addLoan(loan: LoanEquipment) {
    this.http.post<LoanEquipment>(`${this.url}` + '/loans', loan).subscribe((newLoan) => {
      this.loans.update((loans) => [...loans, newLoan]);
    });
  }

  updateLoan(updatedLoan: LoanEquipment) {
    this.http
      .put<LoanEquipment>(`${this.url}/loans/${updatedLoan.id}`, updatedLoan)
      .subscribe((loan) => {
        this.loans.update((loans) =>
          loans.map((l) => (l.id === loan.id ? loan : l)),
        );
      });
  }

  deleteLoan(id: number) {
    this.http.delete(`${this.url}/loans/${id}`).subscribe(() => {
      this.loans.update((loans) => loans.filter((l) => l.id !== id));
    });
  }
}

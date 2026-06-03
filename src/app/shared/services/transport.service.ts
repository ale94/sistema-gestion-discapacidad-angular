import { HttpClient } from '@angular/common/http';
import { computed, Injectable, inject, signal } from '@angular/core';
import { MonthlyData } from '../interfaces/monthly.data.interface';

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080';

  selectedYear = signal<number>(new Date().getFullYear());
  private loansData = signal<MonthlyData[]>(this.createDefaultYearData());

  dataForSelectedYear = computed(() => this.loansData());
  years = signal<number[]>(this.generateYears());

  yearlyTotals = computed(() => {
    const data = this.dataForSelectedYear();
    return data.reduce(
      (acc, month) => {
        acc.totalCarnets += month.carnets;
        acc.totalPasajes += month.pasajes;
        acc.grandTotal += month.carnets + month.pasajes;
        return acc;
      },
      { totalCarnets: 0, totalPasajes: 0, grandTotal: 0 }
    );
  });

  constructor() {
    this.loadYearData();
  }

  private generateYears(): number[] {
    const current = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => current - 5 + i);
  }

  loadYearData(): void {
    const year = this.selectedYear();
    this.http.get<any[]>(`${this.url}/loans`).subscribe({
      next: (loans) => {
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const carnetsPerMonth = new Array(12).fill(0);
        const pasajesPerMonth = new Array(12).fill(0);

        for (const loan of loans) {
          const loanYear = loan.year ? parseInt(loan.year, 10) : (loan.requestDate ? new Date(loan.requestDate).getFullYear() : null);
          if (loanYear !== year) continue;

          const monthIndex = loan.requestDate ? new Date(loan.requestDate).getMonth() : 0;
          const type = (loan.type || '').toLowerCase();

          if (type.includes('carnet') || type.includes('pase libre') || type.includes('municipal')) {
            carnetsPerMonth[monthIndex]++;
          } else if (type.includes('pasaje') || type.includes('nacional') || type.includes('provincial')) {
            pasajesPerMonth[monthIndex]++;
          }
        }

        this.loansData.set(months.map((month, i) => ({
          month,
          carnets: carnetsPerMonth[i],
          pasajes: pasajesPerMonth[i],
        })));
      },
      error: () => {
        this.loansData.set(this.createDefaultYearData());
      },
    });
  }

  changeYear(year: number): void {
    this.selectedYear.set(year);
    this.loadYearData();
  }

  private createDefaultYearData(): MonthlyData[] {
    return [
      { month: 'Enero', carnets: 12, pasajes: 8 },
      { month: 'Febrero', carnets: 15, pasajes: 10 },
      { month: 'Marzo', carnets: 10, pasajes: 14 },
      { month: 'Abril', carnets: 18, pasajes: 9 },
      { month: 'Mayo', carnets: 22, pasajes: 13 },
      { month: 'Junio', carnets: 20, pasajes: 16 },
      { month: 'Julio', carnets: 25, pasajes: 11 },
      { month: 'Agosto', carnets: 17, pasajes: 19 },
      { month: 'Septiembre', carnets: 14, pasajes: 12 },
      { month: 'Octubre', carnets: 21, pasajes: 15 },
      { month: 'Noviembre', carnets: 16, pasajes: 18 },
      { month: 'Diciembre', carnets: 13, pasajes: 20 },
    ];
  }
}

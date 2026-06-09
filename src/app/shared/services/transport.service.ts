import { computed, Injectable, inject, signal } from '@angular/core';
import { MonthlyData } from '../interfaces/monthly.data.interface';
import { FreePassService } from './free-pass.service';

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  private freePassService = inject(FreePassService);

  selectedYear = signal<number>(new Date().getFullYear());

  private loansData = signal<MonthlyData[]>(this.buildFromBackend());

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

  private generateYears(): number[] {
    const current = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, i) => current - 5 + i);
  }

  refresh(): void {
    this.loansData.set(this.buildFromBackend());
  }

  private buildFromBackend(): MonthlyData[] {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const carnetsPerMonth = new Array(12).fill(0);
    const pasajesPerMonth = new Array(12).fill(0);
    const year = this.selectedYear();

    for (const fp of this.freePassService.freePasses()) {
      const d = new Date(fp.createdAt);
      if (d.getFullYear() === year) {
        carnetsPerMonth[d.getMonth()]++;
      }
    }

    for (const np of this.freePassService.nationalFreePasses()) {
      const d = new Date(np.createdAt);
      if (d.getFullYear() === year) {
        pasajesPerMonth[d.getMonth()]++;
      }
    }

    return months.map((month, i) => ({
      month,
      carnets: carnetsPerMonth[i],
      pasajes: pasajesPerMonth[i],
    }));
  }

  changeYear(year: number): void {
    this.selectedYear.set(year);
    this.refresh();
  }
}

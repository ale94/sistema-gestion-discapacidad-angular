import { computed, effect, Injectable, signal } from '@angular/core';
import { YearlyData } from '../interfaces/yearly.data.interface';
import { MonthlyData } from '../interfaces/monthly.data.interface';

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  selectedYear = signal<number>(new Date().getFullYear());

  private trackingData = signal<YearlyData>(this.loadFromStorage('transportTrackingData', {}));

  // Computed signal to get data for the selected year, ensuring it exists
  dataForSelectedYear = computed(() => {
    const year = this.selectedYear();
    const allData = this.trackingData();
    if (!allData[year]) {
      return this.createDefaultYearData();
    }
    return allData[year];
  });

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
    this.ensureDataForYear(this.selectedYear());
    effect(() => this.saveToStorage('transportTrackingData', this.trackingData()));
  }

  changeYear(delta: number): void {
    const newYear = this.selectedYear() + delta;
    this.ensureDataForYear(newYear);
    this.selectedYear.set(newYear);
  }

  increment(monthName: string, type: 'carnets' | 'pasajes'): void {
    const year = this.selectedYear();
    this.trackingData.update((data) => {
      const yearData = data[year];
      const updatedMonthData = yearData.map((m) =>
        m.month === monthName ? { ...m, [type]: m[type] + 1 } : m
      );
      return { ...data, [year]: updatedMonthData };
    });
  }

  decrement(monthName: string, type: 'carnets' | 'pasajes'): void {
    const year = this.selectedYear();
    this.trackingData.update((data) => {
      const yearData = data[year];
      const updatedMonthData = yearData.map((m) => {
        if (m.month !== monthName) {
          return m;
        }
        const currentValue = m[type];
        const newValue = currentValue > 0 ? currentValue - 1 : 0;
        return { ...m, [type]: newValue };
      });

      return { ...data, [year]: updatedMonthData };
    });
  }

  private ensureDataForYear(year: number): void {
    if (!this.trackingData()[year]) {
      this.trackingData.update((data) => ({
        ...data,
        [year]: this.createDefaultYearData(),
      }));
    }
  }

  private createDefaultYearData(): MonthlyData[] {
    return [
      { month: 'Enero', carnets: 0, pasajes: 0 },
      { month: 'Febrero', carnets: 0, pasajes: 0 },
      { month: 'Marzo', carnets: 0, pasajes: 0 },
      { month: 'Abril', carnets: 0, pasajes: 0 },
      { month: 'Mayo', carnets: 0, pasajes: 0 },
      { month: 'Junio', carnets: 0, pasajes: 0 },
      { month: 'Julio', carnets: 0, pasajes: 0 },
      { month: 'Agosto', carnets: 0, pasajes: 0 },
      { month: 'Septiembre', carnets: 0, pasajes: 0 },
      { month: 'Octubre', carnets: 0, pasajes: 0 },
      { month: 'Noviembre', carnets: 0, pasajes: 0 },
      { month: 'Diciembre', carnets: 0, pasajes: 0 },
    ];
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error('Error loading from localStorage', e);
      return defaultValue;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
}

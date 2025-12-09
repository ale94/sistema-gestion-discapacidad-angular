import { MonthlyData } from "./monthly.data.interface";

export interface YearlyData {
  [year: number]: MonthlyData[];
}

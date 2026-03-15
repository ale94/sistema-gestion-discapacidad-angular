import { inject, Injectable, signal } from '@angular/core';
import { Equipment } from '../interfaces/equipment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EquipmentService {


  private http = inject(HttpClient);
  private url = "http://localhost:8080";
  equipments = signal<Equipment[]>([]);

  constructor() {

    this.loadEquipments();
  }

  loadEquipments() {
    this.http.get<Equipment[]>(`${this.url}/equipments`)
      .subscribe(data => {
        this.equipments.set(data);
      });
  }


  // getAll(): Observable<Equipment[]> {
  //   return of(this.equipments);
  // }

  // getById(id: number): Observable<Equipment | undefined> {
  //   return of(this.equipments.find((e) => e.id === id));
  // }

  // updateState(id: number, state: Equipment['state']): void {
  //   const eq = this.equipments.find((e) => e.id === id);
  //   if (eq) eq.state = state;
  // }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { FreePassRenewalRequest, FreePassRenewalResponse, FreePassRequest, FreePassResponse, FreePassStatusRequest, NationalFreePassRequest, NationalFreePassResponse } from '../interfaces/free-pass.interface';

@Injectable({
  providedIn: 'root'
})
export class FreePassService {

  private http = inject(HttpClient);
  private url = 'http://localhost:8080';

  freePasses = signal<FreePassResponse[]>([]);
  nationalFreePasses = signal<NationalFreePassResponse[]>([]);
  renewals = signal<FreePassRenewalResponse[]>([]);

  loadAll() {
    this.http.get<FreePassResponse[]>(`${this.url}/free-passes`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.freePasses.set(data));

    this.http.get<NationalFreePassResponse[]>(`${this.url}/national-free-passes`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.nationalFreePasses.set(data));

    this.http.get<FreePassRenewalResponse[]>(`${this.url}/free-pass-renewals`).pipe(
      catchError(() => of([]))
    ).subscribe(data => this.renewals.set(data));
  }

  createFreePass(request: FreePassRequest): Observable<FreePassResponse> {
    return this.http.post<FreePassResponse>(`${this.url}/free-passes`, request).pipe(
      tap(fp => this.freePasses.update(list => [...list, fp])),
      catchError(err => throwError(() => err))
    );
  }

  createNationalFreePass(request: NationalFreePassRequest): Observable<NationalFreePassResponse> {
    return this.http.post<NationalFreePassResponse>(`${this.url}/national-free-passes`, request).pipe(
      tap(fp => this.nationalFreePasses.update(list => [...list, fp])),
      catchError(err => throwError(() => err))
    );
  }

  createRenewal(request: FreePassRenewalRequest): Observable<FreePassRenewalResponse> {
    return this.http.post<FreePassRenewalResponse>(`${this.url}/free-pass-renewals`, request).pipe(
      tap(r => this.renewals.update(list => [...list, r])),
      catchError(err => throwError(() => err))
    );
  }

  updateFreePassStatus(id: number, status: string): Observable<FreePassResponse> {
    return this.http.patch<FreePassResponse>(`${this.url}/free-passes/${id}/status`, { status } as FreePassStatusRequest).pipe(
      tap(updated => this.freePasses.update(list => list.map(fp => fp.id === id ? updated : fp))),
      catchError(err => throwError(() => err))
    );
  }

  deleteFreePass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/free-passes/${id}`).pipe(
      tap(() => this.freePasses.update(list => list.filter(fp => fp.id !== id))),
      catchError(err => throwError(() => err))
    );
  }

  deleteNationalFreePass(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/national-free-passes/${id}`).pipe(
      tap(() => this.nationalFreePasses.update(list => list.filter(fp => fp.id !== id))),
      catchError(err => throwError(() => err))
    );
  }
}

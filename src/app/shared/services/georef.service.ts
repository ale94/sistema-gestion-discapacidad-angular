import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GeoRefAddress {
  altura: {
    valor: number | null;
  };
  calle: {
    nombre: string;
  };
  localidad_censal: {
    nombre: string;
  };
  ubicacion: {
    lat: number;
    lon: number;
  };
  nomenclatura: string;
}

interface GeoRefResponse {
  direcciones: GeoRefAddress[];
}

@Injectable({
  providedIn: 'root',
})
export class GeoRefService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = 'https://apis.datos.gob.ar/georef/api/direcciones';

  searchAddress(address: string): Observable<GeoRefResponse> {
    const params = new HttpParams()
      .set('direccion', address)
      .set('localidad', 'Libertador General San Martin')
      .set('departamento', 'Ledesma')
      .set('provincia', 'Jujuy')
      .set('max', '10');

    return this.http.get<GeoRefResponse>(this.endpoint, { params });
  }
}

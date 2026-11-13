import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { Person } from '../../shared/interfaces/person';
import { PersonService } from '../../shared/services/person.service';
import { PersonUtils } from '../../shared/utils/person.utils';

const iconUrl = 'assets/leaflet/marker.svg';
const LIBERTADOR_GENERAL_SAN_MARTIN_CENTER: L.LatLngExpression = [-23.8168127, -64.7952625];

const defaultIcon = L.icon({
  iconUrl,
  iconSize: [25, 41],     // tamaño del ícono
  iconAnchor: [12, 41],   // punto del ícono que corresponde a la coordenada
  popupAnchor: [1, -34],  // posición del popup respecto al ícono
});

L.Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [FormsModule, TitleCasePipe],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export default class Map implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  personService = inject(PersonService);
  persons = this.personService.persons;
  searchTerm = signal('');
  selectedDistrict = signal('');
  selectedDisability = signal('');
  private markerLayer = L.layerGroup();

  private map!: L.Map;

  districts = computed(() =>
    [...PersonUtils.barriosLibertador()].sort((a, b) => a.localeCompare(b)),
  );

  disabilityTypes = computed(() =>
    [...PersonUtils.disabilityTypes()].sort((a, b) => a.localeCompare(b)),
  );

  filteredPersons = computed(() => {
    const term = this.normalize(this.searchTerm());
    const district = this.normalize(this.selectedDistrict());
    const disability = this.normalize(this.selectedDisability());

    return this.persons().filter((person) => {
      const personDistrict = this.normalize(person.address?.district);
      const personDisability = this.normalize(person.health?.disabilityType);
      const firstName = this.normalize(person.firstName);
      const lastName = this.normalize(person.lastName);
      const fullName = `${firstName} ${lastName}`;
      const reversedFullName = `${lastName} ${firstName}`;
      const matchesSearch =
        !term ||
        String(person.dni).includes(term) ||
        firstName.includes(term) ||
        lastName.includes(term) ||
        fullName.includes(term) ||
        reversedFullName.includes(term);

      return (
        matchesSearch &&
        (!district || personDistrict.includes(district)) &&
        (!disability || personDisability === disability)
      );
    });
  });

  peopleWithLocation = computed(
    () => this.filteredPersons().filter((person) => this.getCoordinates(person) !== null).length,
  );

  constructor() {
    const queryParams = this.route.snapshot.queryParamMap;
    this.searchTerm.set(queryParams.get('search') ?? queryParams.get('dni') ?? '');
    this.selectedDistrict.set(queryParams.get('district') ?? '');
    this.selectedDisability.set(queryParams.get('disability') ?? '');
    this.personService.loadPersons();
    effect(() => {
      this.filteredPersons();
      if (this.map) {
        this.drawMarkers();
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.drawMarkers();
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private initMap(): void {
    const mapElement = this.mapContainer?.nativeElement;
    if (!mapElement) {
      return;
    }

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    });

    const esriSat = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye',
      },
    );

    const openTopo = L.tileLayer(
      'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      {
        attribution: '© OpenTopoMap (CC-BY-SA)',
        maxZoom: 17,
      },
    );

    this.map = L.map(mapElement, {
      center: LIBERTADOR_GENERAL_SAN_MARTIN_CENTER,
      zoom: 14,
      layers: [osm, this.markerLayer],
    });

    const baseMaps = {
      'Mapa OSM': osm,
      'Satélite (Esri)': esriSat,
      'Terreno (OpenTopoMap)': openTopo,
    };

    L.control.layers(baseMaps).addTo(this.map);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedDistrict.set('');
    this.selectedDisability.set('');
    this.updateQueryParams();
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    this.updateQueryParams();
  }

  updateDistrict(value: string): void {
    this.selectedDistrict.set(value);
    this.updateQueryParams();
  }

  updateDisability(value: string): void {
    this.selectedDisability.set(value);
    this.updateQueryParams();
  }

  openProfile(person: Person): void {
    void this.router.navigate(['/personas', person.id], {
      queryParams: {
        returnTo: 'mapa',
        search: this.searchTerm() || null,
        district: this.selectedDistrict() || null,
        disability: this.selectedDisability() || null,
      },
    });
  }

  focusPerson(person: Person): void {
    const coordinates = this.getCoordinates(person);
    if (!coordinates || !this.map) {
      return;
    }

    this.map.setView(coordinates, 17);
    this.markerLayer.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.getLatLng().equals(coordinates)) {
        layer.openPopup();
      }
    });
  }

  private drawMarkers(): void {
    if (!this.map) {
      return;
    }

    this.markerLayer.clearLayers();

    this.filteredPersons().forEach((person) => {
      const coordinates = this.getCoordinates(person);
      if (!coordinates) {
        return;
      }

      const address = person.address;
      const marker = L.marker(coordinates).bindPopup(
        `<strong>${this.escapeHtml(this.getFullName(person))}</strong><br>` +
          `DNI: ${this.escapeHtml(String(person.dni))}<br>` +
          `${this.escapeHtml(address.street)}, ${this.escapeHtml(address.district)}<br>` +
          `Discapacidad: ${this.escapeHtml(person.health?.disabilityType || 'Sin especificar')}<br>` +
          `<a class="person-profile-link" href="#">Ver perfil completo</a>`,
      );
      marker.on('popupopen', () => {
        const popupElement = marker.getPopup()?.getElement();
        const profileLink = popupElement?.querySelector<HTMLAnchorElement>('.person-profile-link');
        profileLink?.addEventListener('click', (event) => {
          event.preventDefault();
          this.openProfile(person);
        });
      });
      this.markerLayer.addLayer(marker);
    });
  }

  getInitials(person: Person): string {
    const firstName = person.firstName?.trim() ?? '';
    const lastName = person.lastName?.trim() ?? '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  }

  getFullName(person: Person): string {
    const firstName = person.firstName?.trim() ?? '';
    const lastName = person.lastName?.trim() ?? '';
    return [lastName, firstName].filter(Boolean).join(', ') || 'Persona sin nombre';
  }

  private getCoordinates(person: Person): L.LatLngExpression | null {
    const { latitude, longitude } = person.address;
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return [latitude, longitude];
  }

  private normalize(value: string | undefined): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private escapeHtml(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        })[character] ?? character,
    );
  }

  private updateQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchTerm() || null,
        district: this.selectedDistrict() || null,
        disability: this.selectedDisability() || null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}

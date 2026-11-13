import {
  Component,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Person } from '../../../shared/interfaces/person';
import { TitleCasePipe } from '@angular/common';
import { FormUtils } from '../../../shared/utils/form.utils';
import { PersonUtils } from '../../../shared/utils/person.utils';
import { finalize } from 'rxjs';
import * as L from 'leaflet';
import { GeoRefService } from '../../../shared/services/georef.service';

const locationIcon = L.icon({
  iconUrl: 'assets/leaflet/marker.svg',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const LIBERTADOR_GENERAL_SAN_MARTIN_CENTER: L.LatLngExpression = [-23.8168127, -64.7952625];

@Component({
  selector: 'person-form',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './person-form.html',
  styleUrls: ['./person-form.css'],
})
export class PersonForm implements OnInit, OnDestroy {
  @ViewChild('locationMap') private locationMap?: ElementRef<HTMLDivElement>;

  person = input<Person | null>(null);

  save = output<Person>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);
  private geoRefService = inject(GeoRefService);

  personForm!: FormGroup;
  formErrors: string[] = [];

  isEditMode = false;
  isDeceased = signal(false);
  isLocationModalOpen = signal(false);
  locationError = signal('');
  selectedLatitude = signal<number | null>(null);
  selectedLongitude = signal<number | null>(null);
  addressSearch = signal('');
  isSearchingAddress = signal(false);

  personUtils = PersonUtils;
  formUtils = FormUtils;

  ngOnInit(): void {
    const currentPerson = this.person();
    this.isEditMode = !!currentPerson;
    this.isDeceased.set(!!currentPerson?.dateDeath);

    this.personForm = this.fb.group({

      // Person
      firstName: [currentPerson?.firstName || '', [Validators.required, Validators.minLength(3)]],
      lastName: [currentPerson?.lastName || '', [Validators.required, Validators.minLength(3)]],
      dni: [currentPerson?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      civilStatus: [currentPerson?.civilStatus || ''],
      dateBirth: [currentPerson?.dateBirth || '', Validators.required],
      dateDeath: [currentPerson?.dateDeath || ''],
      tutor: [currentPerson?.tutor || ''],
      phone: [currentPerson?.phone || '', Validators.pattern('^[0-9]{10}$')],
      gender: [currentPerson?.gender || '', Validators.required],

      // Address
      address: this.fb.group({
        street: [currentPerson?.address?.street || '', Validators.minLength(4)],
        district: [currentPerson?.address?.district || '', Validators.minLength(4)],
        locality: [currentPerson?.address?.locality || 'Libertador General San Martín', Validators.minLength(4)],
        province: [currentPerson?.address?.province || 'Jujuy', Validators.minLength(4)],
        latitude: [
          currentPerson?.address?.latitude ?? null,
          [Validators.min(-90), Validators.max(90)],
        ],
        longitude: [
          currentPerson?.address?.longitude ?? null,
          [Validators.min(-180), Validators.max(180)],
        ],
      }),

      // Health
      health: this.fb.group({
        diagnostic: [currentPerson?.health?.diagnostic || '', [Validators.required, Validators.minLength(4)]],
        disabilityType: [currentPerson?.health?.disabilityType || '', Validators.required],
        cudNumber: [currentPerson?.health?.cudNumber || ''],
        activeCud: [currentPerson?.health?.activeCud ?? false],
        expirationDate: [currentPerson?.health?.expirationDate || ''],
        rehabilitationTreatment: [currentPerson?.health?.rehabilitationTreatment ?? false],
      }),

      // Work
      work: this.fb.group({
        companyName: [currentPerson?.work?.companyName || ''],
        status: [currentPerson?.work?.status || ''],
        address: [currentPerson?.work?.address || ''],
        socialWork: [currentPerson?.work?.socialWork ?? false],
        nameSocialWork: [currentPerson?.work?.nameSocialWork || ''],
      }),

      // Education
      education: this.fb.group({
        educationLevel: [currentPerson?.education?.educationLevel || ''],
        name: [currentPerson?.education?.name || ''],
        address: [currentPerson?.education?.address || ''],
        educationStatus: [currentPerson?.education?.educationStatus || ''],
      }),

      // Benefits
      benefit: this.fb.group({
        federalProgram: [currentPerson?.benefit?.federalProgram ?? false],
        pension: [currentPerson?.benefit?.pension ?? false],
        auh: [currentPerson?.benefit?.auh ?? false],
        suaf: [currentPerson?.benefit?.suaf ?? false],
        merchandise: [currentPerson?.benefit?.merchandise ?? false],
        freePass: [currentPerson?.benefit?.freePass ?? false],
      }),

      familyMembers: this.fb.array(currentPerson?.familyMembers?.map(family =>
        this.fb.group({
          fullName: [family.fullName || ''],
          dni: [family.dni || ''],
          dateBirth: [family.dateBirth || ''],
          phone: [family.phone || ''],
          parentage: [family.parentage || '']
        })) || [])
    });
  }

  searchAddress(): void {
    const address = this.addressSearch().trim();
    if (!address) {
      this.locationError.set('Ingresá una calle y una altura válida.');
      return;
    }

    this.locationError.set('');
    this.isSearchingAddress.set(true);
    this.geoRefService.searchAddress(address).pipe(
      finalize(() => this.isSearchingAddress.set(false)),
    ).subscribe({
      next: ({ direcciones }) => {
        const [result] = direcciones;
        if (!result) {
          this.locationError.set('No se encontraron direcciones en Libertador General San Martín.');
          return;
        }

        const { lat, lon } = result.ubicacion;
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          this.locationError.set('GeoRef devolvió una dirección sin coordenadas válidas.');
          return;
        }
        this.setLocation(lat, lon);
      },
      error: () => {
        this.locationError.set('No se pudo consultar GeoRef. Intentá nuevamente.');
      },
    });
  }

  private getInvalidFields(): string[] {
    const invalid: string[] = [];
    Object.keys(this.personForm.controls).forEach(key => {
      const control = this.personForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys((control as FormGroup).controls).forEach(subKey => {
          if ((control as FormGroup).get(subKey)?.invalid) invalid.push(`${key}.${subKey}`);
        });
      } else if (control?.invalid) {
        invalid.push(key);
      }
    });
    return invalid;
  }

  onSubmit() {
    this.personForm.markAllAsTouched();
    this.formErrors = [];
    if (this.personForm.invalid) {
      this.formErrors = this.getInvalidFields();
      return;
    }
    const formValue = { ...this.personForm.value };
    formValue.address.latitude = this.normalizeCoordinate(formValue.address.latitude);
    formValue.address.longitude = this.normalizeCoordinate(formValue.address.longitude);
    if (!this.isDeceased()) {
      formValue.dateDeath = '';
    }
    if (this.isEditMode && this.person()) {
      const original = this.person()!;
      this.save.emit({
        ...original,
        ...formValue,
        address: { ...original.address, ...formValue.address },
        health: { ...original.health, ...formValue.health },
        work: { ...original.work, ...formValue.work },
        education: { ...original.education, ...formValue.education },
        benefit: { ...original.benefit, ...formValue.benefit },
      });
    } else {
      this.save.emit(formValue);
    }
  }

  private normalizeCoordinate(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : null;
  }

  onCancel() {
    this.cancel.emit();
  }

  openLocationModal(): void {
    this.locationError.set('');
    this.addressSearch.set('');
    this.selectedLatitude.set(this.getCoordinateValue('address.latitude'));
    this.selectedLongitude.set(this.getCoordinateValue('address.longitude'));
    this.isLocationModalOpen.set(true);
    setTimeout(() => this.initializeLocationMap(), 0);
  }

  closeLocationModal(): void {
    this.isLocationModalOpen.set(false);
    this.locationMapInstance?.remove();
    this.locationMapInstance = undefined;
    this.locationMarker = undefined;
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.locationError.set('Tu navegador no permite obtener la ubicación actual.');
      return;
    }

    this.locationError.set('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => this.setLocation(coords.latitude, coords.longitude),
      () => this.locationError.set('No se pudo obtener la ubicación actual. Revisá los permisos del navegador.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  toggleDeceased() {
    this.isDeceased.update(v => !v);
    const dateDeathControl = this.personForm.get('dateDeath');
    if (this.isDeceased()) {
      dateDeathControl?.setValidators([Validators.required]);
    } else {
      dateDeathControl?.clearValidators();
      dateDeathControl?.setValue('');
    }
    dateDeathControl?.updateValueAndValidity();
  }

  onAuHChange() {
    const auh = this.personForm.get('benefit.auh')?.value;
    if (auh) {
      this.personForm.get('benefit.suaf')?.setValue(false);
    }
  }

  onSuafChange() {
    const suaf = this.personForm.get('benefit.suaf')?.value;
    if (suaf) {
      this.personForm.get('benefit.auh')?.setValue(false);
    }
  }

  get familyMembers() {
    return this.personForm.get('familyMembers') as FormArray;
  }

  createFamily(): FormGroup {
    return this.fb.group({
      fullName: [''],
      dni: [''],
      dateBirth: [''],
      phone: [''],
      parentage: ['']
    });
  }

  addFamily() {
    const familyMembers = this.familyMembers;
    if (familyMembers) {
      familyMembers.push(this.createFamily());
    }
  }

  removeFamily(index: number) {
    this.familyMembers.removeAt(index);
  }

  isCudExpired(): boolean {
    const active = this.personForm.get('health.activeCud')?.value;
    const expDate = this.personForm.get('health.expirationDate')?.value;
    if (!active || !expDate) return false;
    return new Date(expDate) < new Date();
  }

  private locationMapInstance?: L.Map;
  private locationMarker?: L.Marker;

  private initializeLocationMap(): void {
    const mapElement = this.locationMap?.nativeElement;
    if (!mapElement || this.locationMapInstance) {
      return;
    }

    const latitudeValue = this.personForm.get('address.latitude')?.value;
    const longitudeValue = this.personForm.get('address.longitude')?.value;
    const latitude = Number(latitudeValue);
    const longitude = Number(longitudeValue);
    const hasCoordinates =
      latitudeValue !== null &&
      latitudeValue !== undefined &&
      latitudeValue !== '' &&
      longitudeValue !== null &&
      longitudeValue !== undefined &&
      longitudeValue !== '' &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;
    const center: L.LatLngExpression = hasCoordinates
      ? [latitude, longitude]
      : LIBERTADOR_GENERAL_SAN_MARTIN_CENTER;

    const openStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    });

    this.locationMapInstance = L.map(mapElement, {
      center,
      zoom: hasCoordinates ? 17 : 14,
      layers: [openStreetMap],
    });

    this.locationMapInstance.on('click', (event: L.LeafletMouseEvent) => {
      this.setLocation(event.latlng.lat, event.latlng.lng);
    });

    if (hasCoordinates) {
      this.locationMarker = L.marker(center, { icon: locationIcon }).addTo(this.locationMapInstance);
    }

    setTimeout(() => this.locationMapInstance?.invalidateSize(), 0);
  }

  private setLocation(latitude: number, longitude: number): void {
    const selectedLatitude = Number(latitude.toFixed(7));
    const selectedLongitude = Number(longitude.toFixed(7));
    this.selectedLatitude.set(selectedLatitude);
    this.selectedLongitude.set(selectedLongitude);
    this.personForm.get('address.latitude')?.setValue(selectedLatitude);
    this.personForm.get('address.longitude')?.setValue(selectedLongitude);
    this.personForm.get('address.latitude')?.markAsDirty();
    this.personForm.get('address.longitude')?.markAsDirty();

    if (this.locationMapInstance) {
      const position: L.LatLngExpression = [latitude, longitude];
      this.locationMapInstance.setView(position, 17);
      this.locationMarker?.remove();
      this.locationMarker = L.marker(position, { icon: locationIcon }).addTo(this.locationMapInstance);
    }
  }

  private getCoordinateValue(controlName: string): number | null {
    const value = this.personForm.get(controlName)?.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const coordinate = Number(value);
    return Number.isFinite(coordinate) ? coordinate : null;
  }

  ngOnDestroy(): void {
    this.locationMapInstance?.remove();
  }

}

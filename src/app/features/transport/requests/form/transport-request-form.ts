import { Component, EventEmitter, Input, Output, inject, signal, effect, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../../../../shared/interfaces/transport-request.interface';
import { FreePassService } from '../../../../shared/services/free-pass.service';
import { PersonService } from '../../../../shared/services/person.service';
import { Person } from '../../../../shared/interfaces/person';
import { Subscription } from 'rxjs';

@Component({
  selector: 'transport-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transport-request-form.html',
})
export class TransportRequestForm implements OnInit, OnDestroy {
  @Input() request: TransportRequest | null = null;
  @Output() save = new EventEmitter<TransportRequest>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private personService = inject(PersonService);
  private freePassService = inject(FreePassService);

  form: FormGroup;
  isRegistered = signal<boolean>(false);
  checkDone = signal<boolean>(false);
  foundPerson = signal<Person | null>(null);
  lookupError = signal<string | null>(null);
  searching = signal<boolean>(false);

  statusOptions = Object.values(TransportRequestStatus).filter(
    s => s !== TransportRequestStatus.FINALIZADA && s !== TransportRequestStatus.EN_REVISION
  );
  typeOptions = Object.values(TransportRequestType);
  isEditingFreePass = computed(() => {
    return !!this.request && this.request.type === TransportRequestType.PASE_PROVINCIAL;
  });
  hasProvincialPass = computed(() => {
    const person = this.foundPerson();
    if (!person) return false;
    return this.freePassService.freePasses().some(fp => fp.personId === person.id);
  });
  hasNationalPass = computed(() => {
    const person = this.foundPerson();
    if (!person) return false;
    return this.freePassService.nationalFreePasses().some(np => np.personId === person.id);
  });
  availableTypes = computed(() => {
    return Object.values(TransportRequestType).filter(t => t !== TransportRequestType.RENOVACION);
  });
  hasDuplicate = computed(() => {
    const type = this.selectedType();
    if (type === TransportRequestType.PASE_PROVINCIAL) return this.hasProvincialPass();
    if (type === TransportRequestType.PASAJE_NACIONAL) return this.hasNationalPass();
    return false;
  });
  duplicateWarning = computed(() => {
    const type = this.selectedType();
    if (type === TransportRequestType.PASE_PROVINCIAL && this.hasProvincialPass()) {
      return 'Esta persona ya posee un Pase Provincial activo. No es posible crear uno nuevo.';
    }
    if (type === TransportRequestType.PASAJE_NACIONAL && this.hasNationalPass()) {
      return 'Esta persona ya posee un Pasaje Nacional activo. No es posible crear uno nuevo.';
    }
    return null;
  });
  private lookupSubscription: Subscription | null = null;
  private typeSubscription: Subscription | null = null;

  selectedType = signal<TransportRequestType>(TransportRequestType.PASAJE_NACIONAL);

  isNational = computed(() => {
    return this.selectedType() === TransportRequestType.PASAJE_NACIONAL;
  });

  constructor() {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateBirth: [''],
      phone: [''],
      street: [''],
      district: [''],
      locality: [''],
      province: [''],
      type: [TransportRequestType.PASAJE_NACIONAL, Validators.required],
      status: [TransportRequestStatus.PENDIENTE, Validators.required],
      observations: [''],
      tripDate: [''],
      ticketQuantity: [1],
      origin: [''],
      destination: [''],
    });
  }

  ngOnInit() {
    if (this.request) {
      this.form.patchValue(this.request);
      this.isRegistered.set(!!this.request.isRegisteredBeneficiary);
      this.checkDone.set(true);
      this.foundPerson.set(null);
      this.form.get('dni')?.clearValidators();
      this.form.get('dni')?.updateValueAndValidity();
      this.loadPersonForEdit();
      if (this.request.type === TransportRequestType.PASE_PROVINCIAL) {
        this.disableAllExceptStatusAndObs();
      }
    }
    const initialType = this.form.get('type')?.value ?? TransportRequestType.PASAJE_NACIONAL;
    this.selectedType.set(initialType);
    this.updateNationalValidators(initialType);
    this.typeSubscription = this.form.get('type')?.valueChanges.subscribe(val => {
      this.selectedType.set(val);
      this.updateNationalValidators(val);
    }) ?? null;
  }

  ngOnDestroy() {
    this.lookupSubscription?.unsubscribe();
    this.typeSubscription?.unsubscribe();
  }

  lookupDni() {
    const dni = this.form.get('dni')?.value;
    if (!dni || String(dni).length < 7) {
      this.lookupError.set('Ingrese un DNI válido');
      this.checkDone.set(false);
      this.foundPerson.set(null);
      return;
    }
    this.searching.set(true);
    this.lookupError.set(null);
    this.lookupSubscription?.unsubscribe();

    const localPerson = this.personService.findByDni(String(dni));
    if (localPerson) {
      this.onPersonFound(localPerson);
      this.searching.set(false);
      return;
    }

    this.lookupSubscription = this.personService.findByDniHttp(String(dni)).subscribe({
      next: (person) => this.onPersonFound(person),
      error: () => {
        this.isRegistered.set(false);
        this.foundPerson.set(null);
        this.checkDone.set(true);
        this.lookupError.set('No se encontró el DNI en el padrón. Complete los datos manualmente.');
        this.searching.set(false);
      }
    });
  }

  private onPersonFound(person: Person) {
    this.isRegistered.set(true);
    this.disablePersonFields();
    this.form.patchValue({
      firstName: person.firstName,
      lastName: person.lastName,
      dateBirth: this.toDateInput(person.dateBirth as any),
      phone: String(person.phone ?? ''),
      street: person.address?.street ?? '',
      district: person.address?.district ?? '',
      locality: person.address?.locality ?? '',
      province: person.address?.province ?? '',
    }, { emitEvent: false });
    this.foundPerson.set(person);
    this.checkDone.set(true);
    this.lookupError.set(null);
    this.searching.set(false);
  }

  onSubmit() {
    if (this.form.invalid || this.hasDuplicate()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const createdAt = this.request?.createdAt ?? new Date().toISOString();
    const parts = [raw.street, raw.district, `${raw.locality}, ${raw.province}`].filter(Boolean);
    const payload: TransportRequest = {
      ...(this.request ?? {}),
      ...raw,
      dni: String(raw.dni ?? ''),
      firstName: String(raw.firstName ?? ''),
      lastName: String(raw.lastName ?? ''),
      dateBirth: raw.dateBirth ?? '',
      phone: String(raw.phone ?? ''),
      address: parts.join(' '),
      type: raw.type,
      status: raw.status,
      observations: String(raw.observations ?? ''),
      createdAt,
      isRegisteredBeneficiary: this.isRegistered(),
      personId: this.foundPerson()?.id ?? this.request?.personId,
      tripDate: raw.tripDate || undefined,
      ticketQuantity: raw.ticketQuantity ? Number(raw.ticketQuantity) : undefined,
      origin: raw.origin || undefined,
      destination: raw.destination || undefined,
    };

    this.save.emit(payload);
  }

  private updateNationalValidators(type: TransportRequestType) {
    const isNational = type === TransportRequestType.PASAJE_NACIONAL;
    const tripDate = this.form.get('tripDate');
    const ticketQuantity = this.form.get('ticketQuantity');
    const origin = this.form.get('origin');
    const destination = this.form.get('destination');

    if (isNational) {
      tripDate?.setValidators([Validators.required]);
      ticketQuantity?.setValidators([Validators.required]);
      origin?.setValidators([Validators.required]);
      destination?.setValidators([Validators.required]);
    } else {
      tripDate?.clearValidators();
      tripDate?.setValue('');
      ticketQuantity?.clearValidators();
      ticketQuantity?.setValue(1);
      origin?.clearValidators();
      origin?.setValue('');
      destination?.clearValidators();
      destination?.setValue('');
    }

    [tripDate, ticketQuantity, origin, destination].forEach(c => c?.updateValueAndValidity());
  }

  private disablePersonFields() {
    this.form.get('firstName')?.disable();
    this.form.get('lastName')?.disable();
    this.form.get('dateBirth')?.disable();
    this.form.get('phone')?.disable();
    this.form.get('street')?.disable();
    this.form.get('district')?.disable();
    this.form.get('locality')?.disable();
    this.form.get('province')?.disable();
  }

  private disableAllExceptStatusAndObs() {
    const controls = ['dni', 'firstName', 'lastName', 'dateBirth', 'phone',
      'street', 'district', 'locality', 'province', 'type',
      'tripDate', 'ticketQuantity', 'origin', 'destination'];
    controls.forEach(name => {
      this.form.get(name)?.disable();
    });
  }

  private loadPersonForEdit() {
    const personId = this.request?.personId;
    if (!personId) return;
    const local = this.personService.persons().find(p => p.id === personId);
    if (local) {
      this.patchAddress(local);
    } else if (this.request?.dni) {
      this.personService.findByDniHttp(this.request.dni).subscribe({
        next: (person) => this.patchAddress(person),
      });
    }
  }

  private patchAddress(person: Person) {
    this.form.patchValue({
      street: person.address?.street ?? '',
      district: person.address?.district ?? '',
      locality: person.address?.locality ?? '',
      province: person.address?.province ?? '',
      dateBirth: this.toDateInput(person.dateBirth as any),
      phone: String(person.phone ?? ''),
    }, { emitEvent: false });
  }

  private toDateInput(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}

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

  statusOptions = Object.values(TransportRequestStatus);
  typeOptions = Object.values(TransportRequestType);
  hasProvincialPass = computed(() => {
    const person = this.foundPerson();
    if (!person) return false;
    return this.freePassService.freePasses().some(fp => fp.personId === person.id);
  });
  availableTypes = computed(() => {
    const all = Object.values(TransportRequestType).filter(t => t !== TransportRequestType.RENOVACION);
    if (this.hasProvincialPass()) {
      return all.filter(t => t !== TransportRequestType.PASE_PROVINCIAL && t !== TransportRequestType.AMBOS);
    }
    return all;
  });
  private lookupSubscription: Subscription | null = null;
  private typeSubscription: Subscription | null = null;

  selectedType = signal<TransportRequestType>(TransportRequestType.AMBOS);

  isNational = computed(() => {
    return this.selectedType() === TransportRequestType.PASAJE_NACIONAL || this.selectedType() === TransportRequestType.AMBOS;
  });

  constructor() {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateBirth: [''],
      phone: [''],
      address: [''],
      type: [TransportRequestType.AMBOS, Validators.required],
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
    }
    this.selectedType.set(this.form.get('type')?.value ?? TransportRequestType.AMBOS);
    this.typeSubscription = this.form.get('type')?.valueChanges.subscribe(val => {
      this.selectedType.set(val);
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

    this.lookupSubscription = this.personService.findByDniHttp(String(dni)).subscribe({
      next: (person) => {
        this.isRegistered.set(true);
        this.form.get('firstName')?.disable();
        this.form.get('lastName')?.disable();
        this.form.get('dateBirth')?.disable();
        this.form.get('phone')?.disable();
        this.form.get('address')?.disable();
        this.form.patchValue({
          firstName: person.firstName,
          lastName: person.lastName,
          dateBirth: this.toDateInput(person.dateBirth as any),
          phone: String(person.phone ?? ''),
          address: `${person.address?.street ?? ''} ${person.address?.district ?? ''}, ${person.address?.locality ?? ''}, ${person.address?.province ?? ''}`,
        }, { emitEvent: false });
        this.foundPerson.set(person);
        this.checkDone.set(true);
        this.lookupError.set(null);
        this.searching.set(false);
        const currentType = this.form.get('type')?.value;
        if (currentType === TransportRequestType.PASE_PROVINCIAL || currentType === TransportRequestType.AMBOS) {
          if (this.hasProvincialPass()) {
            this.form.get('type')?.setValue(TransportRequestType.PASAJE_NACIONAL);
          }
        }
      },
      error: () => {
        this.isRegistered.set(false);
        this.foundPerson.set(null);
        this.checkDone.set(true);
        this.lookupError.set('No se encontró el DNI en el padrón. Complete los datos manualmente.');
        this.searching.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const createdAt = this.request?.createdAt ?? new Date().toISOString();
    const payload: TransportRequest = {
      ...(this.request ?? {}),
      ...raw,
      dni: String(raw.dni ?? ''),
      firstName: String(raw.firstName ?? ''),
      lastName: String(raw.lastName ?? ''),
      dateBirth: raw.dateBirth ?? '',
      phone: String(raw.phone ?? ''),
      address: String(raw.address ?? ''),
      type: raw.type,
      status: raw.status,
      observations: String(raw.observations ?? ''),
      createdAt,
      isRegisteredBeneficiary: this.isRegistered(),
      personId: this.foundPerson()?.id,
      tripDate: raw.tripDate || undefined,
      ticketQuantity: raw.ticketQuantity ? Number(raw.ticketQuantity) : undefined,
      origin: raw.origin || undefined,
      destination: raw.destination || undefined,
    };

    this.save.emit(payload);
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

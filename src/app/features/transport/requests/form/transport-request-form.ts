import { Component, EventEmitter, Input, Output, inject, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransportRequest, TransportRequestStatus, TransportRequestType } from '../../../../shared/interfaces/transport-request.interface';
import { TransportRequestService } from '../../../../shared/services/transport-request.service';
import { PersonService } from '../../../../shared/services/person.service';
import { Person } from '../../../../shared/interfaces/person';

@Component({
  selector: 'transport-request-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transport-request-form.html',
})
export class TransportRequestForm implements OnInit {
  @Input() request: TransportRequest | null = null;
  @Output() save = new EventEmitter<TransportRequest>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private requestService = inject(TransportRequestService);
  private personService = inject(PersonService);

  form: FormGroup;
  isRegistered = signal<boolean>(false);
  checkDone = signal<boolean>(false);
  foundPerson = signal<Person | null>(null);
  lookupError = signal<string | null>(null);
  searching = signal<boolean>(false);

  statusOptions = Object.values(TransportRequestStatus);
  typeOptions = Object.values(TransportRequestType);

  constructor() {
    this.form = this.fb.group({
      dni: [{ value: '', disabled: false }, [Validators.required, Validators.pattern('^[0-9]*$')]],
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      dateBirth: [{ value: '', disabled: true }],
      phone: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      type: [TransportRequestType.AMBOS, Validators.required],
      status: [TransportRequestStatus.PENDIENTE, Validators.required],
      observations: ['']
    });
  }

  ngOnInit() {
    if (this.request) {
      this.form.patchValue(this.request);
      this.isRegistered.set(!!this.request.isRegisteredBeneficiary);
      this.checkDone.set(true);
      this.foundPerson.set(null);
    }
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

    setTimeout(() => {
      const person = this.personService.findByDni(String(dni));
      if (person) {
        this.isRegistered.set(true);
        this.form.patchValue({
          firstName: person.firstName,
          lastName: person.lastName,
          dateBirth: this.toDateInput(person.dateBirth as any),
          phone: String(person.phone ?? ''),
          email: '',
          address: `${person.address?.street ?? ''} ${person.address?.district ?? ''}, ${person.address?.locality ?? ''}, ${person.address?.province ?? ''}`,
        }, { emitEvent: false });
        this.foundPerson.set(person as any);
        this.checkDone.set(true);
        this.lookupError.set(null);
      } else {
        this.isRegistered.set(false);
        this.foundPerson.set(null);
        this.checkDone.set(true);
        this.lookupError.set('No se encontró el DNI en el padrón. Se guardará como solicitud manual.');
      }
      this.searching.set(false);
    }, 150);
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
      email: String(raw.email ?? ''),
      address: String(raw.address ?? ''),
      type: raw.type,
      status: raw.status,
      observations: String(raw.observations ?? ''),
      createdAt,
      isRegisteredBeneficiary: this.isRegistered(),
    };

    if (payload.id) {
      this.requestService.updateRequest(payload.id, payload);
    } else {
      this.requestService.addRequest(payload);
    }
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

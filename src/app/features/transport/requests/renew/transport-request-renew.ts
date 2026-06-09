import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonService } from '../../../../shared/services/person.service';
import { TransportRequest, TransportRequestType, TransportRequestStatus } from '../../../../shared/interfaces/transport-request.interface';
import { Person } from '../../../../shared/interfaces/person';

@Component({
  selector: 'transport-request-renew',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transport-request-renew.html',
})
export class TransportRequestRenew {
  @Output() cancel = new EventEmitter<void>();
  @Output() renew = new EventEmitter<TransportRequest>();

  private fb = inject(FormBuilder);
  private personService = inject(PersonService);

  form: FormGroup;
  foundPerson = signal<Person | null>(null);
  lookupError = signal<string | null>(null);
  searching = signal<boolean>(false);
  checkDone = signal<boolean>(false);

  constructor() {
    this.form = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      address: [{ value: '', disabled: true }, Validators.required],
      phone: [{ value: '', disabled: true }, Validators.required],
      freePassExpiration: [''],
    });
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
        this.form.patchValue({
          firstName: person.firstName,
          lastName: person.lastName,
          address: `${person.address?.street ?? ''} ${person.address?.district ?? ''}, ${person.address?.locality ?? ''}`,
          phone: String(person.phone ?? ''),
          freePassExpiration: person.benefit?.freePassExpiration ?? '',
        }, { emitEvent: false });
        this.foundPerson.set(person);
        this.checkDone.set(true);
        this.lookupError.set(null);
      } else {
        this.foundPerson.set(null);
        this.checkDone.set(true);
        this.lookupError.set('No se encontró el DNI en el padrón.');
      }
      this.searching.set(false);
    }, 2000);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: TransportRequest = {
      dni: String(raw.dni),
      firstName: String(raw.firstName ?? ''),
      lastName: String(raw.lastName ?? ''),
      dateBirth: '',
      phone: String(raw.phone ?? ''),
      email: '',
      address: String(raw.address ?? ''),
      type: TransportRequestType.RENOVACION,
      status: TransportRequestStatus.PENDIENTE,
      observations: 'Solicitud de renovación',
      createdAt: new Date().toISOString(),
      isRegisteredBeneficiary: !!this.foundPerson(),
      freePassExpiration: raw.freePassExpiration || undefined,
    };

    this.renew.emit(payload);
  }
}

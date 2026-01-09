import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PeopleIndicator } from '../../../shared/interfaces/people.indicator.interface';

@Component({
  selector: 'indicator-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './indicator-form.html',
  styleUrls: ['./indicator-form.css'],
})
export class IndicatorForm {
  person = input<PeopleIndicator | null>(null);

  save = output<Omit<PeopleIndicator, 'id'> | PeopleIndicator>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);
  personForm!: FormGroup;

  isEditMode = false;

  ngOnInit(): void {
    const currentPerson = this.person();
    this.isEditMode = !!currentPerson;

    this.personForm = this.fb.group({
      nombreCompleto: [currentPerson?.apellidoNombre || '', Validators.required],
      dni: [currentPerson?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      domicilio: [currentPerson?.domicilio || '', Validators.required],
      indicadores: [currentPerson?.indicadores || '', Validators.required],
      fechaConsulta: [currentPerson?.fechaConsulta || '', Validators.required],
    });
  }

  onSubmit() {
    if (this.personForm.valid) {
      const formValue = this.personForm.value;
      if (this.isEditMode && this.person()) {
        this.save.emit({ ...this.person(), ...formValue });
      } else {
        this.save.emit(formValue);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}

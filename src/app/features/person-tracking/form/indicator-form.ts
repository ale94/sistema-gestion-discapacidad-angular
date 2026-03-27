import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PersonTracking } from '../../../shared/interfaces/person-tracking';
import { FormUtils } from '../../../shared/utils/form.utils';


@Component({
  selector: 'indicator-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './indicator-form.html',
  styleUrls: ['./indicator-form.css'],
})
export class IndicatorForm {
  person = input<PersonTracking | null>(null);

  save = output<PersonTracking>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);
  personForm!: FormGroup;

  formUtils = FormUtils;
  isEditMode = false;

  ngOnInit(): void {
    const currentPerson = this.person();
    this.isEditMode = !!currentPerson;

    this.personForm = this.fb.group({
      firstName: [currentPerson?.firstName || '', [Validators.required, Validators.minLength(3)]],
      lastName: [currentPerson?.lastName || '', [Validators.required, Validators.minLength(3)]],
      dni: [currentPerson?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      phone: [currentPerson?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      indicatorType: [currentPerson?.indicatorType || '', [Validators.required, Validators.minLength(5)]],
      address: [currentPerson?.address || '', [Validators.required, Validators.minLength(5)]],
    });
  }

  onSubmit() {
    this.personForm.markAllAsTouched();
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

import { Component, inject, input, output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Person } from '../../../shared/interfaces/person';
import { PersonUtils } from '../../../shared/utils/PersonUtils';

@Component({
  selector: 'person-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './person-form.html',
  styleUrls: ['./person-form.css'],
})
export class PersonForm {

  person = input<Person | null>(null);

  save = output<Person>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);

  personForm!: FormGroup;

  isEditMode = false;

  personUtils = PersonUtils;

  ngOnInit(): void {
    const currentPerson = this.person();
    this.isEditMode = !!currentPerson;

    this.personForm = this.fb.group({

      // Person
      firstName: [currentPerson?.firstName || '', [Validators.required, Validators.minLength(3)]],
      lastName: [currentPerson?.lastName || '', [Validators.required, Validators.minLength(3)]],
      dni: [currentPerson?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$'), Validators.minLength(7)]],
      civilStatus: [currentPerson?.civilStatus || '', Validators.required],
      dateBirth: [currentPerson?.dateBirth || '', Validators.required],
      tutor: [currentPerson?.tutor || '', [Validators.required, Validators.minLength(4)]],
      phone: [currentPerson?.phone || '', [Validators.required, Validators.minLength(10)]],
      gender: [currentPerson?.gender || '', Validators.required],

      // Address
      address: this.fb.group({
        street: [currentPerson?.address?.street || '', [Validators.required, Validators.minLength(4)]],
        district: [currentPerson?.address?.district || '', [Validators.required, Validators.minLength(4)]],
        locality: [currentPerson?.address?.locality || '', [Validators.required, Validators.minLength(4)]],
        province: [currentPerson?.address?.province || '', [Validators.required, Validators.minLength(4)]]
      }),

      // Health
      health: this.fb.group({
        diagnostic: [currentPerson?.health?.diagnostic || '', [Validators.required, Validators.minLength(4)]],
        disabilityType: [currentPerson?.health?.disabilityType || '', Validators.required],
        cudNumber: [currentPerson?.health?.cudNumber || '', [Validators.required, Validators.minLength(4)]],
        activeCud: [currentPerson?.health?.activeCud || false, Validators.required],
        rehabilitationTreatment: [currentPerson?.health?.rehabilitationTreatment || '', Validators.required],
      }),

      // Work
      work: this.fb.group({
        companyName: [currentPerson?.work?.companyName || ''],
        employmentStatus: [currentPerson?.work?.status || '', Validators.required],
        workAddress: [currentPerson?.work?.address || '',],
        socialWork: [currentPerson?.work?.socialWork || false, Validators.required],
        nameSocialWork: [currentPerson?.work?.nameSocialWork || ''],
      }),

      // Education
      education: this.fb.group({
        educationLevel: [currentPerson?.education?.educationLevel || '', Validators.required],
        schoolName: [currentPerson?.education?.name || ''],
        educationAddress: [currentPerson?.education?.address || ''],
      }),

      // Benefits
      benefit: this.fb.group({
        federalProgram: [currentPerson?.benefit?.federalProgram || false],
        pension: [currentPerson?.benefit?.pension || false],
        auh: [currentPerson?.benefit?.auh || false],
        merchandise: [currentPerson?.benefit?.merchandise || false],
        freePass: [currentPerson?.benefit?.freePass || false],
      }),

      familyMembers: this.fb.array(currentPerson?.familyMembers?.map(family =>
        this.fb.group({
          firstName: [family.firstName || '', Validators.required],
          lastName: [family.lastName || '', Validators.required],
          dni: [family.dni || '', Validators.required],
          age: [family.age || '', Validators.required],
          civilStatus: [family.civilStatus || '', Validators.required],
          parentage: [family.parentage || '', Validators.required],
          occupation: [family.occupation || '', Validators.required]
        })) || [])
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

  get familyMembers() {
    return this.personForm.get('familyMembers') as FormArray;
  }

  createFamily(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      dni: [''],
      age: [''],
      civilStatus: [''],
      parentage: [''],
      occupation: ['']
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

  isValidField(fieldName: string): boolean | null {
    const control = this.personForm.get(fieldName);
    return control ? (control.errors && control.touched) : null;
  }

  getFieldError(fieldName: string): string | null {
    const control = this.personForm.get(fieldName);
    if (!control || !control.errors) return null;

    const errors = control.errors;
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
        case 'min':
          return `Valor mínimo de ${errors['min'].min}`;
      }
    }
    return null;
  }

}

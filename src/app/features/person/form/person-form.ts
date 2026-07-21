import { Component, inject, input, output, signal, OnInit } from '@angular/core';
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

@Component({
  selector: 'person-form',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './person-form.html',
  styleUrls: ['./person-form.css'],
})
export class PersonForm implements OnInit {

  person = input<Person | null>(null);

  save = output<Person>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);

  personForm!: FormGroup;
  formErrors: string[] = [];

  isEditMode = false;
  isDeceased = signal(false);

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
      civilStatus: [currentPerson?.civilStatus || '', Validators.required],
      dateBirth: [currentPerson?.dateBirth || '', Validators.required],
      dateDeath: [currentPerson?.dateDeath || ''],
      tutor: [currentPerson?.tutor || ''],
      phone: [currentPerson?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gender: [currentPerson?.gender || '', Validators.required],

      // Address
      address: this.fb.group({
        street: [currentPerson?.address?.street || '', [Validators.required, Validators.minLength(4)]],
        district: [currentPerson?.address?.district || '', [Validators.required, Validators.minLength(4)]],
        locality: [currentPerson?.address?.locality || 'Libertador General San Martín', [Validators.required, Validators.minLength(4)]],
        province: [currentPerson?.address?.province || 'Jujuy', [Validators.required, Validators.minLength(4)]]
      }),

      // Health
      health: this.fb.group({
        diagnostic: [currentPerson?.health?.diagnostic || '', [Validators.required, Validators.minLength(4)]],
        disabilityType: [currentPerson?.health?.disabilityType || '', Validators.required],
        cudNumber: [currentPerson?.health?.cudNumber || ''],
        activeCud: [currentPerson?.health?.activeCud ?? false, Validators.required],
        expirationDate: [currentPerson?.health?.expirationDate || ''],
        rehabilitationTreatment: [currentPerson?.health?.rehabilitationTreatment ?? false, Validators.required],
      }),

      // Work
      work: this.fb.group({
        companyName: [currentPerson?.work?.companyName || ''],
        status: [currentPerson?.work?.status || '', Validators.required],
        address: [currentPerson?.work?.address || ''],
        socialWork: [currentPerson?.work?.socialWork ?? false, Validators.required],
        nameSocialWork: [currentPerson?.work?.nameSocialWork || ''],
      }),

      // Education
      education: this.fb.group({
        educationLevel: [currentPerson?.education?.educationLevel || '', Validators.required],
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
          fullName: [family.fullName || '', Validators.required],
          dni: [family.dni || ''],
          dateBirth: [family.dateBirth || ''],
          phone: [family.phone || '', Validators.required],
          parentage: [family.parentage || '', Validators.required]
        })) || [])
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

  onCancel() {
    this.cancel.emit();
  }

  toggleDeceased() {
    this.isDeceased.update(v => !v);
    if (!this.isDeceased()) {
      this.personForm.get('dateDeath')?.setValue('');
    }
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

}

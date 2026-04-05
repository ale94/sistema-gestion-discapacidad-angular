import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanEquipment } from '../../../shared/interfaces/loan.equipment.interface';
import { FormUtils } from '../../../shared/utils/form.utils';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrls: ['./form.css'],
})
export class Form {
  loanEquipment = input<LoanEquipment | null>(null);

  save = output<LoanEquipment>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);

  loanForm!: FormGroup;
  formUtils = FormUtils;

  isEditMode = false;

  loanTypes: string[] = [
    'Bastón',
    'Silla de ruedas',
    'Muleta',
    'Andador',
    'Cama ortopédica',
    'Colchón antiescaras',
    'Oxígeno portátil',
    'Nebulizador',
    'Férula',
    'Inmovilizador',
    'Grúa de traslado',
    'Elevador de inodoro',
  ];

  ngOnInit(): void {
    const currentLoanEquipment = this.loanEquipment();
    this.isEditMode = !!currentLoanEquipment;

    this.loanForm = this.fb.group({
      // Loan Equipment
      expiration: [currentLoanEquipment?.expiration || '', Validators.required],
      type: [currentLoanEquipment?.type || '', Validators.required],
      equipmentNumber: [currentLoanEquipment?.equipmentNumber || null, Validators.required],
      applicant: [currentLoanEquipment?.applicant || '', [Validators.required, Validators.minLength(4)]],
      dni: [
        currentLoanEquipment?.dni || '',
        [Validators.required, Validators.pattern('^[0-9]{7,8}$')]
      ],
      address: [currentLoanEquipment?.address || '', [Validators.required, Validators.minLength(4)]],
      phone: [currentLoanEquipment?.phone || '', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });
  }

  onSubmit() {
    this.loanForm.markAllAsTouched();
    if (this.loanForm.valid) {
      const formValue = this.loanForm.value;
      if (this.isEditMode && this.loanEquipment()) {
        this.save.emit({ ...this.loanEquipment(), ...formValue });
      } else {
        this.save.emit(formValue);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}

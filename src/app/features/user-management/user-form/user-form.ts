import { Component, inject, input, output, signal } from '@angular/core';
import { User } from '../../../shared/interfaces/user';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../shared/utils/form.utils';

@Component({
  selector: 'user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
})
export class UserForm {

  user = input<User | null>(null);
  save = output<User>();
  cancel = output<void>();
  showPassword = signal(false);

  private fb: FormBuilder = inject(FormBuilder);

  userForm!: FormGroup;
  isEditMode = false;
  formUtils = FormUtils;

  ngOnInit(): void {
    const currentUser = this.user();
    this.isEditMode = !!currentUser;

    this.userForm = this.fb.group({
      firstName: [currentUser?.firstName || '', [Validators.required, Validators.minLength(3)]],
      lastName: [currentUser?.lastName || '', [Validators.required, Validators.minLength(3)]],
      password: [currentUser?.password || '', [Validators.required, Validators.minLength(4)]],
      dni: [currentUser?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      role: [currentUser?.role || '', Validators.required],
    });
  }

  onSubmit() {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      if (this.isEditMode && this.user()) {
        this.save.emit({ ...this.user(), ...formValue });
      } else {
        this.save.emit(formValue);
      }
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

}

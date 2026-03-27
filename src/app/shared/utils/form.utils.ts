import { FormGroup } from "@angular/forms";

export class FormUtils {

  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    const control = form.get(fieldName);
    return control ? (control.errors && control.touched) : null;
  }

  static getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
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
        case 'pattern':
          if (fieldName === 'dni') return 'El DNI debe tener entre 7 y 8 dígitos';
          if (fieldName === 'phone') return 'El teléfono debe tener 10 dígitos';
          return 'El formato es incorrecto';
      }
    }
    return null;
  }

}

import { Component, inject, input, output } from '@angular/core';
import { Person } from '../../../shared/interfaces/person.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'person-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './person-form.html',
  styleUrls: ['./person-form.css'],
})
export class PersonForm {
  person = input<Person | null>(null);

  save = output<Omit<Person, 'id'> | Person>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);
  personForm!: FormGroup;

  isEditMode = false;

  disabilityTypes: Person['tipoDiscapacidad'][] = [
    'Física',
    'Sensorial',
    'Intelectual',
    'Psíquica',
    'Múltiple',
  ];
  educationLevels: Person['escolaridad'][] = [
    'Ninguna',
    'Primaria',
    'Secundaria',
    'Terciaria',
    'Universitaria',
  ];
  jobStatuses: Person['situacionLaboral'][] = [
    'Empleado',
    'Desempleado',
    'Independiente',
    'No aplica',
  ];
  genders: Person['sexo'][] = ['Masculino', 'Femenino', 'Otro'];

  ngOnInit(): void {
    const currentPerson = this.person();
    this.isEditMode = !!currentPerson;

    this.personForm = this.fb.group({
      nombreCompleto: [currentPerson?.nombreCompleto || '', Validators.required],
      dni: [currentPerson?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      fechaNacimiento: [currentPerson?.fechaNacimiento || '', Validators.required],
      domicilio: [currentPerson?.domicilio || '', Validators.required],
      tutor: [currentPerson?.tutor || '', Validators.required],
      telefono: [currentPerson?.telefono || '', Validators.required],
      sexo: [currentPerson?.sexo || 'Masculino', Validators.required],
      fechaEmpadronamiento: [currentPerson?.fechaEmpadronamiento || '', Validators.required],
      diagnostico: [currentPerson?.diagnostico || '', Validators.required],
      tipoDiscapacidad: [currentPerson?.tipoDiscapacidad || 'Física', Validators.required],
      numeroCUD: [currentPerson?.numeroCUD || ''],
      cudVigente: [currentPerson?.cudVigente || false],
      obraSocial: [currentPerson?.obraSocial || ''],
      escolaridad: [currentPerson?.escolaridad || 'Ninguna', Validators.required],
      situacionLaboral: [currentPerson?.situacionLaboral || 'No aplica', Validators.required],
      pension: [currentPerson?.pension || false],
      bolsonMercaderia: [currentPerson?.bolsonMercaderia || false],
      paseLibre: [currentPerson?.paseLibre || false],
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

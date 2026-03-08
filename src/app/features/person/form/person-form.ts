import { Component, inject, input, output } from '@angular/core';
import { Person } from '../../../shared/interfaces/person';
import {
  FormBuilder,
  FormGroup,

  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'person-form',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './person-form.html',
  styleUrls: ['./person-form.css'],
})
export class PersonForm {
  //familiares: any[] = [];
  person = input<Person | null>(null);

  save = output<Omit<Person, 'id'> | Person>();
  cancel = output<void>();

  private fb: FormBuilder = inject(FormBuilder);

  personForm!: FormGroup;

  isEditMode = false;

  // disabilityTypes: Person['tipoDiscapacidad'][] = [
  //   'Física',
  //   'Sensorial',
  //   'Intelectual',
  //   'Psíquica',
  //   'Múltiple',
  // ];
  // educationLevels: Person['escolaridad'][] = [
  //   'Ninguna',
  //   'Primaria',
  //   'Secundaria',
  //   'Terciaria',
  //   'Universitaria',
  // ];
  // jobStatuses: Person['situacionLaboral'][] = [
  //   'Empleado',
  //   'Desempleado',
  //   'Independiente',
  //   'No aplica',
  // ];
  genders: string[] = ['Masculino', 'Femenino', 'Otro'];
  civilStatuses: string[] = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Otro']

  ngOnInit(): void {
    const currentPerson = this.person();
    this.isEditMode = !!currentPerson;

    this.personForm = this.fb.group({
      firstName: [currentPerson?.firstName || '', Validators.required],
      lastName: [currentPerson?.lastName || '', Validators.required],
      dni: [currentPerson?.dni || '', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      civilStatus: [currentPerson?.civilStatus || 'Soltero/a', Validators.required],
      dateBirth: [currentPerson?.dateBirth || '', Validators.required],
      tutor: [currentPerson?.tutor || '', Validators.required],
      phone: [currentPerson?.phone || '', Validators.required],
      gender: [currentPerson?.gender || 'Masculino', Validators.required],
      registrationDate: [currentPerson?.registrationDate || '', Validators.required],
      status: [currentPerson?.status || 'Activo', Validators.required],

      //DIRECION
      district: [currentPerson?.address.district || '', Validators.required],
      street: [currentPerson?.address.street || '', Validators.required],
      locality: [currentPerson?.address.locality || '', Validators.required],
      province: [currentPerson?.address.province || '', Validators.required],





      // fechaNacimiento: [currentPerson?.fechaNacimiento || '', Validators.required],
      // domicilio: [currentPerson?.domicilio || '', Validators.required],
      // tutor: [currentPerson?.tutor || '', Validators.required],
      // telefono: [currentPerson?.telefono || '', Validators.required],
      // sexo: [currentPerson?.sexo || 'Masculino', Validators.required],
      // fechaEmpadronamiento: [currentPerson?.fechaEmpadronamiento || '', Validators.required],
      // diagnostico: [currentPerson?.diagnostico || '', Validators.required],
      // tipoDiscapacidad: [currentPerson?.tipoDiscapacidad || 'Física', Validators.required],
      // numeroCUD: [currentPerson?.numeroCUD || ''],
      // cudVigente: [currentPerson?.cudVigente || false],
      // obraSocial: [currentPerson?.obraSocial || ''],
      // escolaridad: [currentPerson?.escolaridad || 'Ninguna', Validators.required],
      // situacionLaboral: [currentPerson?.situacionLaboral || 'No aplica', Validators.required],
      // pension: [currentPerson?.pension || false],
      // bolsonMercaderia: [currentPerson?.bolsonMercaderia || false],
      // paseLibre: [currentPerson?.paseLibre || false],
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

export interface Person {
  id: string;
  nombreCompleto: string;
  dni: string;
  fechaNacimiento: string; // YYYY-MM-DD
  domicilio: string;
  tutor: string;
  telefono: string;
  sexo: 'Masculino' | 'Femenino' | 'Otro';
  fechaEmpadronamiento: string; // YYYY-MM-DD
  diagnostico: string;
  tipoDiscapacidad: 'Física' | 'Sensorial' | 'Intelectual' | 'Psíquica' | 'Múltiple';
  numeroCUD: string;
  cudVigente: boolean;
  obraSocial: string;
  escolaridad: 'Ninguna' | 'Primaria' | 'Secundaria' | 'Terciaria' | 'Universitaria';
  situacionLaboral: 'Empleado' | 'Desempleado' | 'Independiente' | 'No aplica';
  pension: boolean;
  bolsonMercaderia: boolean;
  paseLibre: boolean;

}

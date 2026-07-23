export class PersonUtils {
  static educationLevels(): string[] {
    return [
      'ninguna',
      'primaria',
      'secundaria',
      'terciaria',
      'universitaria'
    ]
  }
  static disabilityTypes(): string[] {
    return [
      'motriz',
      'sensorial',
      'intelectual',
      'mental',
      'visceral',
      'multiple',
      'sin especificar'
    ]
  }
  static jobStatuses(): string[] {
    return [
      'empleado/a',
      'desempleado/a',
      'independiente',
      'no aplica'
    ]
  }
  static gender(): string[] {
    return [
      'masculino', 'femenino', 'otro'
    ]
  }
  static civilStatuses(): string[] {
    return [
      'soltero/a', 'casado/a', 'divorciado/a', 'viudo/a', 'otro'
    ]
  }
}



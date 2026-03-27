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
      'fisica',
      'sensorial',
      'intelectual',
      'psiquica',
      'multiple'
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



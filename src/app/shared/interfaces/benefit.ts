export interface Benefit {
  id: number;
  federalProgram: boolean;
  pension: boolean;
  auh: boolean;
  suaf: boolean;
  merchandise: boolean;
  freePass: boolean;
  freePassExpiration?: string;
}

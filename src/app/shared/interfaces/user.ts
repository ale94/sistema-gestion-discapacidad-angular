export interface User {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  dni: number;
  role: 'ADMIN' | 'USER';
  active: boolean;
}

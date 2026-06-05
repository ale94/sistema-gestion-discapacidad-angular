export interface User {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  dni: number;
  role: 'ADMIN' | 'USER';
  active: boolean;
}

export interface UserAddress {
  city: string;
  street: string;
  number: number;
  zipcode: string;
}

export interface User {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: 'Administrador' | 'Auditor' | 'Cliente';
  address: UserAddress;
}
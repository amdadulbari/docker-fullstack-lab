// TypeScript interface defining the shape of a Contact object
// Matches the backend API response fields exactly
export interface Contact {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

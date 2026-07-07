export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  brandScope: string[];
}

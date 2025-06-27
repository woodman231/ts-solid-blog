export interface User {
  id: string;
  displayName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  identityId: string; // From ADB2C
}
export type UserRole = "patient" | "doctor" | "admin";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}
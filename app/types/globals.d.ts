export {};

export type UserRole = "ADMIN" | "PILOT" | "USER";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: UserRole;
    };
  }
}

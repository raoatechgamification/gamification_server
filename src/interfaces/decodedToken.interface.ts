export interface DecodedToken {
  id: string;
  role: "user" | "admin" | "superAdmin";
}
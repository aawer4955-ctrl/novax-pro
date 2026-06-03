export type UserRole = "user" | "admin";
export type KycStatus = "unverified" | "pending" | "approved" | "rejected";
export type AccountStatus = "active" | "inactive" | "frozen";

export type DemoUser = {
  id: string;
  uid: string;
  email: string;
  password: string;
  country: string;
  language: string;
  role: UserRole;
  kycStatus: KycStatus;
  accountStatus: AccountStatus;
  createdAt: string;
};

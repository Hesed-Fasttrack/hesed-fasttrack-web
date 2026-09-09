import type { DashboardRole } from "@/lib/utils";

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone_no: string | null;
  profile_pic: string | null;
  role: DashboardRole;
  account_status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
  has_validated_email: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

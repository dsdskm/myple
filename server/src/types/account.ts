export interface Account extends TossUser {
  id: string;
  type: "BASIC" | "PRO" | "master";
  status: "active" | "deactive";
  updated: string;
  created: string;
}

export interface TossUser {
  userKey: number;
  scope: string;
  agreedTerms: string[];
  name: string;
  callingCode: string;
  phone: string;
  birthday: string;
  ci: string;
  di: string;
  gender: string;
  nationality: string;
  email: string;
}

export const PATH = {
  ROOT: "/",
  LOGIN: "/login",
  ACCOUNT: "/account",
  ACCOUNT_DETAIL: "/account/:userKey", // ✅ 추가
  BILLING: "/billing",
  TERMS: "/terms",
  NOTICE: "/notice",
  FEEDBACK: "/feedback",
} as const;

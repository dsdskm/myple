export const TEXT = {
    APP_TITLE: "관리자 콘솔",
    LOGIN: {
        TITLE: "관리자 로그인",
        EMAIL_LABEL: "이메일",
        PASSWORD_LABEL: "비밀번호",
        SUBMIT: "로그인",
        RESET_LINK: "비밀번호 재설정 메일 보내기",
        PLACEHOLDER_EMAIL: "email@example.com",
        PLACEHOLDER_PASSWORD: "••••••••",
        SUCCESS: "로그인 성공",
        FAIL_GENERIC: "로그인에 실패했습니다. 잠시 후 다시 시도하세요.",
        NEED_EMAIL: "이메일을 입력하세요.",
        INVALID_EMAIL: "올바른 이메일을 입력하세요.",
        NEED_PASSWORD: "비밀번호를 입력하세요."
    },
    HEADER: {
        LOGOUT: "로그아웃"
    },
    PERMISSION: {
        FORBIDDEN_TITLE: "권한이 없습니다."
    },
    LOADING: "로딩 중..."
} as const;

export const AUTH_ERROR_MSG: Record<string, string> = {
    "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
    "auth/user-disabled": "비활성화된 계정입니다.",
    "auth/user-not-found": "등록되지 않은 계정입니다.",
    "auth/wrong-password": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/invalid-credential": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "auth/too-many-requests": "요청이 너무 많습니다. 잠시 후 다시 시도하세요."
};
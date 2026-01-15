import { TossUser } from "./toss.user";

export interface Account extends TossUser {
    id: string
    type: "BASIC" | "PRO" | "master"
    status: "active" | "deactive"
    updated: string
}

export const initialAccountState: Account = {
    id: '',
    type: 'BASIC',
    status: 'active',
    userKey: 0,
    scope: '',
    agreedTerms: [],
    name: '',
    callingCode: '',
    phone: '',
    birthday: '',
    ci: '',
    di: '',
    gender: '',
    nationality: '',
    email: '',
    updated: ''
};

// 액션 타입

export const ACTION_TYPE_SET_ACCOUNT = "SET_ACCOUNT"
export const ACTION_TYPE_RESET_ACCOUNT = "RESET_ACCOUNT"
export type Action =
    | { type: 'SET_ACCOUNT'; payload: Account }
    | { type: 'RESET_ACCOUNT' };

// 리듀서
export const accountReducer = (state: Account, action: Action): Account => {
    switch (action.type) {
        case ACTION_TYPE_SET_ACCOUNT:
            return action.payload;
        case ACTION_TYPE_RESET_ACCOUNT:
            return initialAccountState;
        default:
            return state;
    }
};
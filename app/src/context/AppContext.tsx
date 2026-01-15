import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Account, accountReducer, Action, initialAccountState } from '../types/account';

// Context 생성
const AppContext = createContext<{
    account: Account;
    setAccount: React.Dispatch<Action>;
}>({
    account: initialAccountState,
    setAccount: () => null,
});

// Provider 컴포넌트
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [account, setAccount] = useReducer(accountReducer, initialAccountState);

    return (
        <AppContext.Provider value={{ account, setAccount }}>
            {children}
        </AppContext.Provider>
    );
};

// Custom Hook
export const useApp = () => {
    const context = useContext(AppContext);
    return context;
};
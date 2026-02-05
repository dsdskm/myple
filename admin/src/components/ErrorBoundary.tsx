import React from "react";
import { Result, Button } from "antd";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="500"
                    title="문제가 발생했습니다."
                    extra={<Button onClick={() => (window.location.href = "/")}>새로고침</Button>}
                />
            );
        }
        return this.props.children;
    }
}
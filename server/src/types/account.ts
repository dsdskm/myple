import { TossUser } from "./toss.user";

export interface Account extends TossUser {
    id: string
    type: "BASIC" | "PRO" | "master"
    status: "active" | "deactive"
    updated: string
}
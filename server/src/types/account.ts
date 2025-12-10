import { TossUser } from "./toss.user";

export interface Account extends TossUser {
    id: string
    type: "user" | "master"
    status: "active"
}
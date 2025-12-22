export interface Category {
    id: string;
    limitCount: number
    list: { id: number, title: string }[];
    created: string
    updated: string
}
export interface Place {
    id: string;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    address: string;
    memo: string;
    rating: number;
    visitAt: string;
    created: string;
    updated: string;
    medias: Media[];
    tags: [];
    creator: string;
}

export interface Media {
    type: string;
    url: string
    fileName: string
}
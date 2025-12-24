export interface Place {
    id: string;
    name: string;
    category: number;
    latitude: number;
    longitude: number;
    address: string;
    memo: string;
    rating: number;
    visitAt: string;
    created: string;
    updated: string;
    medias: Media[];
    tags: string[];
    creator: string;
}

export interface Media {
    type: string;
    url: string
    fileName: string
}
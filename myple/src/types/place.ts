export interface Place {
    id: string;
    name: string;
    category: number;
    latitude: number;
    longitude: number;
    address: string;
    created: string;
    updated: string;
    creator: string;
}

export interface PlaceHistory {
    id: string;
    placeId: string;
    memo: string;
    rating: number;
    visitAt: string;
    tags: string[];
    medias: Media[];
    created: string;
    updated: string;
}

export interface Media {
    type: string;
    url: string
    fileName: string
}
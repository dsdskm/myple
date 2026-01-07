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
    historyList: PlaceHistory[]
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

export type MediaFile = {
    fileName: string;
    file: Express.Multer.File;
    type: 'image' | 'video';
};

export type Media = {
    url: string
    type: string
    fileName: string
};

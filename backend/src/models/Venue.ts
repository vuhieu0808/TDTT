export interface Venue {
    type: string;
    name: string;
    description?: string;
    ratingCount: number;
    ratingStar: number;
    website?: string;
    phonecall?: string;
    openingHours?: string;
    price?: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    menu?: string[];
    mapEmbeddingUrl: string;
    attributes: {
        comfort: number,
        noise: number,
        interior: number,
        view: number,
        staffInteraction: number,
    };
}

export interface VenueFilter {
    comfort: number[];
    noise: number[];
    interior: number[];
    view: number[];
    staffInteraction: number[];
}
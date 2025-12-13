import { Venue, VenueFilter } from "../models/Venue.js";

function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371.0;

    const toRad = (degrees: number): number => {
        return degrees * (Math.PI / 180);
    };

    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const lambda1 = toRad(lng1);
    const lambda2 = toRad(lng2);
    const deltaPhi = phi2 - phi1;
    const deltaLambda = lambda2 - lambda1;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function initVenue(): Venue {
    return {
        type: "",
        name: "",
        ratingCount: 0,
        ratingStar: 0,
        address: "",
        location: {
            lat: 0,
            lng: 0,
        },
        mapEmbeddingUrl: "",
        attributes: {
            comfort: 0,
            noise: 0,
            interior: 0,
            view: 0,
            staffInteraction: 0,
        },
    };
}

function initVenueFromJSON(json: any): Venue {
    const venue: Venue = initVenue();

    venue.type = json.type || "";
    venue.name = json.name || "";
    venue.description = json.description || "";
    venue.ratingCount = json.ratingCount || 0;
    venue.ratingStar = json.ratingStar || 0;
    venue.website = json.website || "";
    venue.phonecall = json.phonecall || "";
    venue.openingHours = json.openingHours || "";
    venue.price = json.price || "";
    venue.address = json.address || "";
    venue.location = {
        lat: json.location?.lat || 0,
        lng: json.location?.lng || 0,
    };
    venue.menu = json.menu || [];
    venue.mapEmbeddingUrl = json.mapEmbeddingUrl || "";
    venue.attributes = {
        comfort: json.attributes?.comfort || 0,
        noise: json.attributes?.noise || 0,
        interior: json.attributes?.interior || 0,
        view: json.attributes?.view || 0,
        staffInteraction: json.attributes?.staffInteraction || 0,
    };

    return venue;
}

function initVenueFilter(
    comfort: number[] | null,
    noise: number[] | null,
    interior: number[] | null,
    view: number[] | null,
    staffInteraction: number[] | null): VenueFilter {

    return {
        comfort: comfort || [],
        noise: noise || [],
        interior: interior || [],
        view: view || [],
        staffInteraction: staffInteraction || [],
    };
}

function simpleRatingScore(venue: Venue): number {
    const vcount = 8;
    const vrate = 2.5;
    return ((vcount * vrate) + (venue.ratingStar * venue.ratingCount)) / (vcount + venue.ratingCount);
}

function sortVenueByRating(a: Venue, b: Venue): number {
    if (a.ratingStar === b.ratingStar) {
        return b.ratingCount - a.ratingCount;
    }

    return simpleRatingScore(b) - simpleRatingScore(a);
}


export {
    haversineDistance,
    initVenue,
    initVenueFromJSON,
    sortVenueByRating,
    initVenueFilter
};


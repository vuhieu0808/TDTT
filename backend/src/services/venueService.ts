import { venueDB } from "../models/db.js";
import { Venue, VenueFilter } from "../models/Venue.js";
import { admin } from "../config/firebase.js";
import { Filter } from "firebase-admin/firestore";
import { haversineDistance } from "../utils/venueHelper.js";

type FilterEntry = [keyof VenueFilter, number[]];
export type NearbyVenueObj = {
    venue: Venue,
    distance: number
}
export type MiddleVenueObj = {
    venue: Venue,
    distance1: number,
    distance2: number
}

async function queryImpl(filter: VenueFilter): Promise<Venue[]> {
    let query: admin.firestore.Query = venueDB;
    const filterEntries: FilterEntry[] = Object.entries(filter) as FilterEntry[];

    // Filter out:
    // - Empty arrays (no constaint)
    // - Arrays >= 3 (User selected All {0,1,2} -> No filtering value)
    const activeFilters: FilterEntry[] = filterEntries.filter(([_, values]) => {
        return values.length > 0 && values.length < 3;
    });

    // Sort by selectivity (fewest options go last)
    activeFilters.sort((a, b) => a[1].length - b[1].length);

    // 4 + 1 querying strategy: 4 online, 1 offline to workaround with firebase disjunctive query limitations
    const onlineQueryFilters = activeFilters.slice(0, 4);
    const offlineQueryFilters = activeFilters.slice(4);

    onlineQueryFilters.forEach(([_key, values]) => {
        const key: string = `attributes.${_key}`;
        if (values.length === 1) {
            //one item, simple equality
            query = query.where(key, '==', values[0]);
        } else {
            //two items, use 'in' operator
            query = query.where(key, 'in', values);
            //three items got filtered out earlier
        }
    });

    const snapshot = await query.get();
    const results: Venue[] = [];

    if(offlineQueryFilters.length === 0) {
        snapshot.forEach(doc => {
            const venue = doc.data() as Venue;
            results.push(venue);
        });
        return results;
    } else {
        snapshot.forEach(doc => {
            const venue = doc.data() as Venue;
            const matchesAllFilters = offlineQueryFilters.every(([key, values]) => {
                const venueValue = venue.attributes[key as keyof typeof venue.attributes];
                return values.includes(venueValue);
            });
            if(matchesAllFilters) {
                results.push(venue);
            }
        });
    }

    return results;
}

async function queryImpl2(filter: VenueFilter): Promise<Venue[]> {
    const collectionRef = admin.firestore().collection('venues');
    const conditions: admin.firestore.Filter[] = [];

    // Cast entries to strict tuple type
    const entries = Object.entries(filter) as FilterEntry[];

    for (const [key, values] of entries) {
        // Optimization: Skip if empty or if all options are selected
        // Note: Ensure your max scale is actually 3. If a field has 5 options, 
        // selecting 3 will accidentally bypass the filter here.
        const isConstraint = values.length > 0 && values.length < 3;

        if (isConstraint) {
            // FIX 1: Update Path to Nested Object
            // Your screenshot shows 'comfort' is inside 'attributes'.
            const dbField = `attributes.${key}`;

            // FIX 2: Query Optimization
            // If the user selects only ONE option (e.g., [1]), use equality '=='.
            // This is faster and avoids Firestore's limit of "one 'IN' clause per query"
            // allowing you to filter multiple fields (e.g., comfort=1 AND view=2) safely.
            if (values.length === 1) {
                conditions.push(Filter.where(dbField, '==', values[0]));
            } else {
                conditions.push(Filter.where(dbField, 'in', values));
            }
        }
    }

    // If no constraints remain, fetch default list
    if (conditions.length === 0) {
        const snapshot = await collectionRef.limit(50).get();
        return snapshot.docs.map(doc => doc.data() as Venue);
    }

    // Combine all clauses with logical AND
    const complexQuery = Filter.and(...conditions);

    try {
        const query = collectionRef.where(complexQuery);
        const snapshot = await query.get();
        return snapshot.docs.map(doc => doc.data() as Venue);
    } catch (error) {
        console.error("Firestore Error: Likely missing index or too many 'IN' clauses.", error);
        throw error;
    }
}

//search for venues matched filter within given radius & location
async function searchNearbyVenues(latitude: number, longitude: number, filter: VenueFilter): Promise<NearbyVenueObj[]> {
    const venueList = await queryImpl(filter);
    const retList: NearbyVenueObj[] = [];

    venueList.forEach(venue => {
        const distance = haversineDistance(latitude, longitude, venue.location.lat, venue.location.lng);
        retList.push({ venue: venue, distance: distance });
    });

    return retList;
}

//search for venues matched filter, sorted ascending by distance difference
async function searchMiddleVenues(lat1: number, lng1: number, lat2: number, lng2: number, filter: VenueFilter): Promise<MiddleVenueObj[]> {
    const venueList = await queryImpl(filter);
    const retList: MiddleVenueObj[] = [];
    
    venueList.forEach(venue => {
        const distA = haversineDistance(lat1, lng1, venue.location.lat, venue.location.lng);
        const distB = haversineDistance(lat2, lng2, venue.location.lat, venue.location.lng);
        retList.push({ venue: venue, distance1: distA, distance2: distB });
    });

    retList.sort((a, b) => {
        return Math.abs(a.distance1-a.distance2) - Math.abs(b.distance1-b.distance2);
    });

    return retList;
}

async function internalGetVenue(venueId: string): Promise<Venue | null> {
    const doc = await venueDB.doc(venueId).get();
    if(!doc.exists) {
        return null;
    }
    return doc.data() as Venue;
}

async function internalAddVenue(venue: Venue): Promise<string> {
    const doc = await venueDB.add(venue);
    return doc.id
}

export {
    searchNearbyVenues,
    searchMiddleVenues,
    internalGetVenue,
    internalAddVenue
}
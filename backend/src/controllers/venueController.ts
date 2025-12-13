import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware.js";
import { Venue, VenueFilter } from "../models/Venue.js";
import * as venueService from "../services/venueService.js";
import * as venueHelper from "../utils/venueHelper.js";

interface QueryMiddleRequestBody {
    location1: {
        lat: number,
        lng: number
    },
    location2: {
        lat: number,
        lng: number
    },
    filter: VenueFilter
}

interface QueryNearbyRequestBody {
    location: {
        lat: number,
        lng: number
    },
    radius: number,
    filter: VenueFilter
}

//admin only
const internalGetVenue = async (req: AuthRequest, res: Response) => {
    const isAdmin = req.headers["is-admin"]
    if(!isAdmin || isAdmin !== "true") {
        return res.status(403).json({ message: "Forbidden" });
    }
    const venueId = req.params.venueId;
    if(!venueId) {
        return res.status(400).json({ message: "Invalid venue ID" });
    }

    try {
        const venue = await venueService.internalGetVenue(venueId);
        if(!venue) {
            return res.status(404).json({ message: "Venue not found" });
        }
        res.status(200).json({ venue: venue });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
}

//admin only
const internalAddVenue = async (req: AuthRequest, res: Response) => {
    const isAdmin = req.headers["is-admin"]
    if(!isAdmin || isAdmin !== "true") {
        return res.status(403).json({ message: "Forbidden" });
    }
    const venue = venueHelper.initVenueFromJSON(req.body);
    if(!venue) {
        return res.status(400).json({ message: "Invalid venue data" });
    }

    try {
        const venueId = await venueService.internalAddVenue(venue);
        res.status(201).json({ venueId: venueId });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
}

/*
request body example:

{
"location1": {
    "lat": xxx,
    "lng": xxx,
},
"location2": {
    "lat": xxx,
    "lng": xxx,
}
"filter": {
    "comfort": [0, 1, 2],
    "noise": [2],
    "interior": [1],
    "view": [],
    "staffInteraction": []
   }
}
*/
const queryMiddle = async (req: Request<{}, {}, QueryMiddleRequestBody>, res: Response) => {
    try {
        const { location1, location2, filter } = req.body;
        if(!location1 || !location2 || !filter) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        const venues = await venueService.searchMiddleVenues(location1.lat, location1.lng, location2.lat, location2.lng, filter);
        res.status(200).json({
            venues: venues
        });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
}

/*
request body example:

{
"location": {
    "lat": xxx,
    "lng": xxx,
},
"radius": xxx,
"filter": {
    "comfort": [0, 1, 2],
    "noise": [2],
    "interior": [1],
    "view": [],
    "staffInteraction": []
   }
}
*/
const queryNearby = async (req: Request<{}, {}, QueryNearbyRequestBody>, res: Response) => {
    try {
        const { location, radius, filter } = req.body;
        if(!location || !radius || !filter) {
            return res.status(400).json({ message: "Invalid request body" });
        }

        const venues = await venueService.searchNearbyVenues(location.lat, location.lng, radius, filter);
        res.status(200).json({
            venues: venues
        });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
}

export {
    internalGetVenue,
    internalAddVenue,
    queryMiddle,
    queryNearby
}


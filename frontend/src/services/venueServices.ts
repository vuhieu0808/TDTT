import api from "@/lib/axios";
import type { Venue, VenueFilter } from "@/types/venue";

export const venueServices = {
	async fetchVenues(lat: number, lng: number, filter: VenueFilter) {
		const res = await api.post("/venues/queryNearby", {
			location: {
				lat,
				lng,
			},
			filter,
		});

		const venuesWithDistance = res.data.venues;

		const venues = venuesWithDistance.map((item: any) => item.venue);

		return venues as Venue[];
	},
};

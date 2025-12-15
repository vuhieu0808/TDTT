import api from "@/lib/axios";
import type { Venue } from "@/types/venue";

export const venueServices = {
	async fetchVenues(lat: number, lng: number) {
		const res = await api.post("/venues/queryNearby", {
			location: {
				lat,
				lng,
			},
			filter: {
				comfort: [],
				noise: [],
				interior: [],
				view: [],
				staffInteraction: [],
			},
		});

		const venuesWithDistance = res.data.venues;

		const venues = venuesWithDistance.map((item: any) => item.venue);

		return venues as Venue[];
	},
};

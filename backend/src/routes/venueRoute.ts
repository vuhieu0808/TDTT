import express from 'express';
import * as venueController from '../controllers/venueController.js';

const venueRoute = express.Router();

venueRoute.get('/queryMiddle', venueController.queryMiddle);
venueRoute.get('/queryNearby', venueController.queryNearby);

//admin only!
venueRoute.get('/internal/:venueId', venueController.internalGetVenue);
venueRoute.post('/internal', venueController.internalAddVenue);

export default venueRoute;
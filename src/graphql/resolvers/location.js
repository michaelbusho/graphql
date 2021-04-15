import Location from '../../models/location';
import mongoose from 'mongoose';
import { allPermissions } from '../../utils/variables';
import { hasPermission } from '../../utils/functions';
import CustomError from '../../utils/customError';

export default {
	Query: {
		locations: async (_, _args, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_LOCATIONS)) {
					throw new Error('Unauthorized');
				}

				//If locations already in cache return them
				if (cacheReady) {
					const stringifiedLocations = await cache.lrange('allLocations', 0, -1);
					const locationsInCache = stringifiedLocations.length
						? JSON.parse(stringifiedLocations)
						: [];
					if (locationsInCache.length) return locationsInCache;
				}

				const all_locations = await Location.find();

				//All Locations were not in cache save them
				cacheReady && (await cache.rpush('allLocations', JSON.stringify(all_locations)));

				return all_locations;
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
		findLocationById: async (_, { location_id }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_LOCATIONS)) {
					throw new Error('Unauthorized');
				}

				//If location already in cache return them
				if (cacheReady) {
					const locationInCache = JSON.parse(await cache.get(location_id));
					if (locationInCache) return locationInCache;
				}

				const found_location = await Location.findOne({ _id: location_id });
				//Location was not in cache save it
				cacheReady && (await cache.set(location_id, JSON.stringify(found_location)));

				return found_location;
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
	},

	Mutation: {
		createLocation: async (_, { LocationInput }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized');
				}
				const new_location = new Location({
					...LocationInput,
				});

				cacheReady && cache.del('allLocations');
				return await new_location.save();
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 || err.message === 'Unauthorized' ? 403 : 500
				);
			}
		},
		deleteLocation: async (_, { locationID }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized');
				}
				if (!mongoose.Types.ObjectId.isValid(locationID)) {
					throw new Error('Id not valid');
				}
				const location = await Location.findById(locationID);
				if (!location) {
					throw new Error('Location does not exist');
				}
				const isDelete = await Location.deleteOne({ _id: locationID });
				if (isDelete.ok) {
					cacheReady && cache.del(location._id);
					cacheReady && cache.del('allLocations');
					return location;
				} else throw new Error('Could not delete location');
			} catch (err) {
				throw new CustomError(
					err.message,
					err.message === 'Unauthorized' ||
					err.message === 'Id not valid' ||
					err.message === 'Location does not exist'
						? 403
						: 500
				);
			}
		},
		updateLocation: async (_, { locationID, LocationInput }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized');
				}
				if (!mongoose.Types.ObjectId.isValid(locationID)) {
					throw new Error('Id not valid');
				}
				const pre_location = await Location.findById(locationID);
				if (!pre_location) {
					throw new Error('Location does not exist');
				}
				const updated_location = await Location.updateOne(
					{ _id: locationID },
					{
						...LocationInput,
					}
				);
				if (updated_location.nModified || updated_location.ok) {
					cacheReady && cache.del(pre_location.rfid);
					cacheReady && cache.del('allLocations');
					return await Location.findById(locationID);
				} else throw new Error('Could not update location.');
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 ||
					err.message === 'Unauthorized' ||
					err.message === 'Id not valid' ||
					err.message === 'Location does not exist'
						? 403
						: 500
				);
			}
		},
	},
};

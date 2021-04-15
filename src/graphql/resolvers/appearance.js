import Appearance from '../../models/appearance';
import User from '../../models/user';
import Location from '../../models/location';
import mongoose from 'mongoose';
import { hasPermission, populateAppearances, transformAppearance } from '../../utils/functions';
import { allPermissions } from '../../utils/variables';
import CustomError from '../../utils/customError';

export default {
	Query: {
		findUserAppearances: async (_, { user_id }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_APPEARANCES)) {
					throw new Error('Unauthorized');
				}

				//If user appearances already in cache return them
				if (cacheReady) {
					const stringifiedUserAppearances = await cache.lrange('appearances_' + user_id, 0, -1);
					const userAppearancesInCache = stringifiedUserAppearances.length
						? JSON.parse(stringifiedUserAppearances)
						: [];
					if (userAppearancesInCache.length) return userAppearancesInCache;
				}

				//Get user appearances from the database
				const user_appearances = await Appearance.find({
					user: new mongoose.Types.ObjectId(user_id),
				}).then((appearances) => populateAppearances(appearances));

				//User Appearances were not in cache save them
				cacheReady &&
					(await cache.rpush('appearances_' + user_id, JSON.stringify(user_appearances)));

				return user_appearances;
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
		findLocationAppearances: async (_, { location_id }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_APPEARANCES)) {
					throw new Error('Unauthorized');
				}

				//If Location appearances already in cache return them
				if (cacheReady) {
					const stringifiedLocAppearances = await cache.lrange(
						'locAppearances_' + location_id,
						0,
						-1
					);
					const locAppearancesInCache = stringifiedLocAppearances.length
						? JSON.parse(stringifiedLocAppearances)
						: [];
					if (locAppearancesInCache.length) return locAppearancesInCache;
				}

				//Get location appearances from the database
				const loc_appearances = await Appearance.find({
					location: new mongoose.Types.ObjectId(location_id),
				}).then((appearances) => populateAppearances(appearances));

				//Location Appearances were not in cache save them
				cacheReady &&
					(await cache.rpush('locAppearances_' + location_id, JSON.stringify(loc_appearances)));

				return loc_appearances;
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
	},

	Mutation: {
		createAppearance: async (_, { user_id, location_id }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_APPEARANCES)) {
					throw new Error('Unauthorized');
				}
				if (
					!mongoose.Types.ObjectId.isValid(user_id) ||
					!mongoose.Types.ObjectId.isValid(location_id)
				) {
					throw new Error('ID provided not valid');
				}
				const found_user = await User.findById(user_id);
				const found_location = await Location.findById(location_id);

				if (!found_user || !found_location) {
					throw new Error('ID provided does not exist');
				}
				const new_appearance = new Appearance({ user: user_id, location: location_id });
				const result = await new_appearance.save();

				//Return full appearance
				result.user = found_user;
				result.location = found_location;

				//Flush cache since this user and location have updated appearance
				cacheReady && cache.del('appearances_' + user_id);
				cacheReady && cache.del('locAppearances_' + location_id);

				return result;
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 ||
					err.message === 'Unauthorized' ||
					err.message === 'ID provided not valid' ||
					err.message === 'ID provided does not exist'
						? 403
						: 500
				);
			}
		},
		deleteAppearance: async (_, { appearanceID }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_APPEARANCES)) {
					throw new Error('Unauthorized');
				}
				if (!mongoose.Types.ObjectId.isValid(appearanceID)) {
					throw new Error('ID provided not valid');
				}
				const appearance = await Appearance.findById(appearanceID);

				if (!appearance) {
					throw new Error('ID provided does not exist');
				}

				const transformedAppearance = transformAppearance(appearance);
				const isDelete = await Appearance.deleteOne({ _id: appearanceID });
				if (isDelete.ok) {
					//Flush cache since this user and location have updated appearance
					cacheReady && cache.del('appearances_' + appearance.user);
					cacheReady && cache.del('locAppearances_' + appearance.location);
					return transformedAppearance;
				} else throw new Error('Could not delete appearance.');
			} catch (err) {
				throw new CustomError(
					err.message,
					err.message === 'Unauthorized' ||
					err.message === 'ID provided not valid' ||
					err.message === 'D provided does not exist'
						? 403
						: 500
				);
			}
		},
	},
};

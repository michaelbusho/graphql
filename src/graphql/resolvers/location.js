import Location from '../../models/location';
import mongoose from 'mongoose';
import { allPermissions } from '../../utils/variables';
import { hasPermission } from '../../utils/functions';
import CustomError from '../../utils/customError';

export default {
	Query: {
		locations: (_, _args, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_LOCATIONS)) {
					throw new Error('Unauthorized');
				}
				return Location.find();
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
		findLocationById: (_, { location_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_LOCATIONS)) {
					throw new Error('Unauthorized');
				}
				return Location.findOne({ _id: location_id });
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
	},

	Mutation: {
		createLocation: async (_, { LocationInput }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized');
				}
				const new_location = new Location({
					...LocationInput,
				});
				return await new_location.save();
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 || err.message === 'Unauthorized' ? 403 : 500
				);
			}
		},
		deleteLocation: async (_, { locationID }, { isAuthenticated, permissions }) => {
			try {
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
				if (isDelete.ok) return location;
				else throw new Error('Could not delete location');
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
		updateLocation: async (_, { locationID, LocationInput }, { isAuthenticated, permissions }) => {
			try {
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

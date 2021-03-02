import { ApolloError } from 'apollo-server-express';
import Location from '../../models/location';
import mongoose from 'mongoose';
import { allPermissions } from '../../utils/variables';
import { hasPermission } from '../../utils/functions';

export default {
	Query: {
		locations: (_, _args, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_LOCATIONS)) {
					throw new Error('Unauthorized.');
				}
				return Location.find();
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_FETCH_LOCATIONS');
			}
		},
		findLocationById: (_, { location_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_LOCATIONS)) {
					throw new Error('Unauthorized.');
				}
				return Location.findOne({ _id: location_id });
			} catch (error) {
				throw new ApolloError(err.message, 'CAN_NOT_FETCH_LOCATIONS');
			}
		},
	},

	Mutation: {
		createLocation: async (_, { LocationInput }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized.');
				}
				const new_location = new Location({
					...LocationInput,
				});
				return await new_location.save();
			} catch (err) {
				throw new ApolloError(
					err.code === 11000 ? 'Location Name must be unique' : err.message,
					'CAN_NOT_CREATE_LOCATION'
				);
			}
		},
		deleteLocation: async (_, { locationID }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized.');
				}
				if (!mongoose.Types.ObjectId.isValid(locationID)) {
					throw new Error('Id not valid.');
				}
				const location = await Location.findById(locationID);
				if (!location) {
					throw new Error('Location does not exist.');
				}
				const isDelete = await Location.deleteOne({ _id: locationID });
				if (isDelete.ok) return location;
				else throw new Error('Could not delete location.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_DELETE_LOCATION');
			}
		},
		updateLocation: async (_, { locationID, LocationInput }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_LOCATIONS)) {
					throw new Error('Unauthorized.');
				}
				if (!mongoose.Types.ObjectId.isValid(locationID)) {
					throw new Error('Id not valid.');
				}
				const pre_location = await Location.findById(locationID);
				if (!pre_location) {
					throw new Error('Location does not exist.');
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
				throw new ApolloError(
					err.code === 11000 ? 'Name already belongs to another location' : err.message,
					'CAN_NOT_UPDATE_LOCATION'
				);
			}
		},
	},
};

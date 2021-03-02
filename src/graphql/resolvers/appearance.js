import Appearance from '../../models/appearance';
import { ApolloError } from 'apollo-server-express';
import User from '../../models/user';
import Location from '../../models/location';
import mongoose from 'mongoose';
import {
	hasPermission,
	cleanUserInfo,
	populateAppearances,
	transformAppearance,
} from '../../utils/functions';
import { allPermissions } from '../../utils/variables';

export default {
	Query: {
		findUserAppearances: (_, { user_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_APPEARANCES)) {
					throw new Error('Unauthorized.');
				}
				return Appearance.find({ user: user_id })
					.then((appearances) => {
						return populateAppearances(appearances);
					})
					.catch(() => null);
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_FETCH_APPEARANCES');
			}
		},
		findLocationAppearances: (_, { location_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_APPEARANCES)) {
					throw new Error('Unauthorized.');
				}
				return Appearance.find({ location: location_id })
					.then((appearances) => {
						return fullAppearances(appearances);
					})
					.catch(() => null);
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_FETCH_APPEARANCES');
			}
		},
	},

	Mutation: {
		createAppearance: async (_, { user_id, location_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_APPEARANCES)) {
					throw new Error('Unauthorized.');
				}
				if (
					!mongoose.Types.ObjectId.isValid(user_id) ||
					!mongoose.Types.ObjectId.isValid(location_id)
				) {
					throw new Error('Id not valid.');
				}
				const found_user = await User.findById(user_id);
				const found_location = await Location.findById(location_id);

				if (!found_user || !found_location) {
					throw new Error('ID provided not valid.');
				}
				const new_appearance = new Appearance({ user: user_id, location: location_id });
				const result = await new_appearance.save();

				//Return full user
				result.user = found_user;
				result.location = found_location;
				return result;
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_RECORD_APPEARANCE');
			}
		},
		deleteAppearance: async (_, { appearanceID }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_APPEARANCES)) {
					throw new Error('Unauthorized.');
				}
				if (!mongoose.Types.ObjectId.isValid(appearanceID)) {
					throw new Error('Id not valid.');
				}
				const appearance = await Appearance.findById(appearanceID);

				if (!appearance) {
					throw new Error('Appearance does not exist.');
				}

				const transformedAppearance = transformAppearance(appearance);
				const isDelete = await Appearance.deleteOne({ _id: appearanceID });
				if (isDelete.ok) return transformedAppearance;
				else throw new Error('Could not delete appearance.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_DELETE_APPEARANCE');
			}
		},
	},
};

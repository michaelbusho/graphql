import Appearance from '../../models/appearance';
import User from '../../models/user';
import Location from '../../models/location';
import mongoose from 'mongoose';
import { hasPermission, populateAppearances, transformAppearance } from '../../utils/functions';
import { allPermissions } from '../../utils/variables';
import CustomError from '../../utils/customError';

export default {
	Query: {
		findUserAppearances: (_, { user_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_APPEARANCES)) {
					throw new Error('Unauthorized');
				}
				return Appearance.find({ user: new mongoose.Types.ObjectId(user_id) })
					.then((appearances) => populateAppearances(appearances))
					.catch(() => null);
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
		findLocationAppearances: (_, { location_id }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_APPEARANCES)) {
					throw new Error('Unauthorized');
				}

				return Appearance.find({ location: new mongoose.Types.ObjectId(location_id) })
					.then((appearances) => populateAppearances(appearances))
					.catch(() => null);
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
	},

	Mutation: {
		createAppearance: async (_, { user_id, location_id }, { isAuthenticated, permissions }) => {
			try {
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

				//Return full user
				result.user = found_user;
				result.location = found_location;
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
		deleteAppearance: async (_, { appearanceID }, { isAuthenticated, permissions }) => {
			try {
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
				if (isDelete.ok) return transformedAppearance;
				else throw new Error('Could not delete appearance.');
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

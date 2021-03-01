import Appearance from '../../models/appearance';
import { ApolloError } from 'apollo-server-express';
import User from '../../models/user';
import Location from '../../models/location';
import mongoose from 'mongoose';

export default {
	Query: {
		appearances: () => Appearance.find().populate(),
		findAppearanceByUser: (_, { user }) => Appearance.findOne({ user }),
		findAppearanceByLocation: (_, { location }) => Appearance.findOne({ location }),
	},

	Mutation: {
		createAppearance: async (_, { user_id, location_id }) => {
			try {
				if (
					!mongoose.Types.ObjectId.isValid(user_id) ||
					!mongoose.Types.ObjectId.isValid(location_id)
				) {
					throw new Error('Id not valid.', 'CAN_NOT_RECORD_APPEARANCE');
				}
				const found_user = await User.findById(user_id);
				const found_location = await Location.findById(location_id);

				if (!found_user || !found_location) {
					throw new Error('ID not valid.', 'CAN_NOT_RECORD_APPEARANCE');
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
	},
};

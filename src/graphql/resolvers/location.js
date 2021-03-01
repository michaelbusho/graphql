import { ApolloError } from 'apollo-server-express';
import Location from '../../models/location';

export default {
	Query: {
		locations: () => Location.find(),
		findLocationById: (_, { location_id }) => Location.findOne({ _id: location_id }),
	},

	Mutation: {
		createLocation: async (_, { LocationInput }) => {
			try {
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
	},
};

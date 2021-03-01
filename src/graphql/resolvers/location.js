import { ApolloError } from 'apollo-server-express';
import Location from '../../models/location';

export default {
	Query: {
		locations: () => Location.find(),
		findLocationById: (_, { location_id }) => Location.findOne({ location_id }),
	},

	Mutation: {
		createLocation: async (_, { LocationInput }) => {
			const { name, capacity, address, phone_number, email, description } = LocationInput;
			try {
				const new_location = await User.findOne({ name: name }).then((found_location) => {
					if (found_location) {
						throw new Error('Location with the same name already exists.');
					} else {
						return new Location({
							name: name,
							capacity: capacity,
							address: address,
							phone_number: phone_number,
							email: email,
							description: description,
						});
					}
				});
				if (new_location) return await new_location.save();
				else throw new Error('Location could not be saved.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_CREATE_LOCATION');
			}
		},
	},
};

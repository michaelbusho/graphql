import User from '../../models/user';
import { assignPermissions } from '../../utils/functions';
import bcrypt from 'bcryptjs';
import { ApolloError } from 'apollo-server-express';

export default {
	Query: {
		users: () => User.find(),
		findUserByRfid: (_, { rfid }) => User.findOne({ rfid }),
	},

	Mutation: {
		createUser: async (_, { UserInput }) => {
			const {
				rfid,
				role,
				image,
				email,
				password,
				name,
				lastName,
				health_status,
				address,
				phone_number,
			} = UserInput;

			try {
				// Make sure that email and rfid don't already exist. If not then save
				const new_user = await User.findOne({ $or: [{ email: email }, { rfid: rfid }] })
					.then((found_user) => {
						if (found_user) {
							throw new Error('User with same email or rfid exists already.');
						}
						return bcrypt.hash(password, parseInt(process.env.HASH_SALT));
					})
					.then((hashed_pass) => {
						const permissions = assignPermissions(role);
						const new_user = new User({
							rfid,
							role,
							permissions,
							image,
							email,
							password: hashed_pass,
							name,
							lastName,
							health_status,
							address,
							phone_number,
						});
						return new_user;
					})
					.catch((err) => {
						console.error(err);
						return null;
					});
				if (new_user) return await new_user.save();
				else throw new Error('Could not Create User.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_SAVE_USER');
			}
		},
		deleteUser: async (_, { userID }) => {
			try {
				if (!mongoose.Types.ObjectId.isValid(userID)) {
					throw new Error('Id not valid.', 'CAN_NOT_DELETE_USER');
				}
				const user = await User.findById(userID);
				if (!user) {
					throw new Error('User does not exist.', 'CAN_NOT_DELETE_USER');
				}
				const isDelete = await User.deleteOne({ _id: userID });
				if (isDelete.ok) return user;
				else throw new Error('Could not delete user.', 'CAN_NOT_DELETE_USER');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_DELETE_USER');
			}
		},
	},
};

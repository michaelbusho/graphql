import User from '../../models/user';
import { assignPermissions } from '../../utils/functions';
import bcrypt from 'bcryptjs';
import { ApolloError } from 'apollo-server-express';
import mongoose from 'mongoose';

export default {
	Query: {
		users: () => User.find(),
		findUserByRfid: (_, { rfid }) => User.findOne({ rfid }),
	},

	Mutation: {
		createUser: async (_, { UserInput }) => {
			try {
				// Make sure that email and rfid don't already exist. If not then save
				const created_user = await User.findOne({
					$or: [{ email: UserInput.email }, { rfid: UserInput.rfid }],
				})
					.then((found_user) => {
						if (found_user) {
							throw new Error('User with same email or rfid exists already.');
						}
						return bcrypt.hash(UserInput.password, parseInt(process.env.HASH_SALT));
					})
					.then((hashed_pass) => {
						const permissions = assignPermissions(UserInput.role);
						UserInput.password = hashed_pass;
						UserInput.permissions = permissions;
						return new User({
							...UserInput,
						});
					})
					.catch((err) => {
						console.error(err);
						return null;
					});
				if (created_user) return await created_user.save();
				else throw new Error('Could not Create User.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_SAVE_USER');
			}
		},
		deleteUser: async (_, { userID }) => {
			try {
				if (!mongoose.Types.ObjectId.isValid(userID)) {
					throw new Error('Id not valid.');
				}
				const user = await User.findById(userID);
				if (!user) {
					throw new Error('User does not exist.');
				}
				const isDelete = await User.deleteOne({ _id: userID });
				if (isDelete.ok) return user;
				else throw new Error('Could not delete user.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_DELETE_USER');
			}
		},
		updateUser: async (_, { userID, UserInput }) => {
			try {
				if (!mongoose.Types.ObjectId.isValid(userID)) {
					throw new Error('Id not valid.');
				}

				const updated_user = await User.updateOne(
					{ _id: userID },
					{
						...UserInput,
					}
				);

				if (updated_user.nModified) {
					const user = await User.findById(userID);
					return user;
				} else throw new Error('Could not update user.');
			} catch (err) {
				throw new ApolloError(err.message, 'CAN_NOT_UPDATE_USER');
			}
		},
	},
};

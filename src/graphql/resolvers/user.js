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
				const hashed_pass = await bcrypt.hash(UserInput.password, parseInt(process.env.HASH_SALT));
				const permissions = assignPermissions(UserInput.role);
				UserInput.password = hashed_pass;
				UserInput.permissions = permissions;
				const new_user = new User({
					...UserInput,
				});
				return await new_user.save();
			} catch (err) {
				throw new ApolloError(
					err.code === 11000 ? 'Email or rfid already belong to another user' : err.message,
					'CAN_NOT_SAVE_USER'
				);
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
				throw new ApolloError(
					err.code === 11000 ? 'Email or rfid already belong to another user' : err.message,
					'CAN_NOT_UPDATE_USER'
				);
			}
		},
	},
};

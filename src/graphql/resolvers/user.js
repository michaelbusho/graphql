import User from '../../models/user';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { allPermissions } from '../../utils/variables';
import { hasPermission, cleanUserInfo, assignPermissions } from '../../utils/functions';
import CustomError from '../../utils/customError';

export default {
	Query: {
		users: (_, _args, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_USERS)) {
					throw new Error('Unauthorized');
				}
				return User.find();
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
		findUserByRfid: async (_, { rfid }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_USERS)) {
					throw new Error('Unauthorized');
				}
				const found_user = await User.findOne({ rfid });
				if (!found_user) {
					throw new Error('RFID does not exist');
				}
				return User.findOne({ rfid });
			} catch (err) {
				throw new CustomError(
					err.message,
					err.message === 'Unauthorized' || err.message === 'RFID does not exist' ? 403 : 500
				);
			}
		},
		login: async (_, { email, password }) => {
			try {
				const user = await User.findOne({ email: email });
				if (!user) {
					throw new Error('User Does not exist');
				}
				const isEqual = await bcrypt.compare(password, user.password).then((res) => res);
				if (!isEqual) {
					throw new Error('Incorrect Password');
				}

				const user_id = user._id;
				const user_data = cleanUserInfo(user);
				const token = jwt.sign({ ...user_data }, process.env.JWT_KEY, {
					expiresIn: process.env.TOKEN_LIFE,
				});

				return {
					userID: user_id,
					token: token,
					tokenExpiration: 1000,
				};
			} catch (err) {
				throw new CustomError(
					err.message,
					err.message === 'User Does not exist' || err.message === 'Incorrect Password' ? 403 : 500
				);
			}
		},
	},

	Mutation: {
		createUser: async (_, { UserInput }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_USERS)) {
					throw new Error('Unauthorized');
				}
				const hashed_pass = await bcrypt.hash(UserInput.password, parseInt(process.env.HASH_SALT));
				const user_permissions = assignPermissions(UserInput.role);
				UserInput.password = hashed_pass;
				UserInput.permissions = user_permissions;
				const new_user = new User({
					...UserInput,
				});
				return await new_user.save();
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 || err.message === 'Unauthorized' ? 403 : 500
				);
			}
		},
		deleteUser: async (_, { userID }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_USERS)) {
					throw new Error('Unauthorized');
				}
				if (!mongoose.Types.ObjectId.isValid(userID)) {
					throw new Error('Id not valid');
				}
				const user = await User.findById(userID);
				if (!user) {
					throw new Error('User does not exist');
				}
				const isDelete = await User.deleteOne({ _id: userID });
				if (isDelete.ok) return user;
				else throw new Error('Could not delete user.');
			} catch (err) {
				throw new CustomError(
					err.message,
					err.message === 'Unauthorized' ||
					err.message === 'Id not valid' ||
					err.message === 'User does not exist'
						? 403
						: 500
				);
			}
		},
		updateUser: async (_, { userID, UserInput }, { isAuthenticated, permissions }) => {
			try {
				if (!isAuthenticated || !hasPermission(permissions, allPermissions.MODIFY_USERS)) {
					throw new Error('Unauthorized');
				}
				if (!mongoose.Types.ObjectId.isValid(userID)) {
					throw new Error('Id not valid');
				}
				const pre_user = await User.findById(userID);
				if (!pre_user) {
					throw new Error('User does not exist');
				}
				if (UserInput.role) {
					UserInput.permissions = assignPermissions(UserInput.role);
				}
				const updated_user = await User.updateOne(
					{ _id: userID },
					{
						...UserInput,
					}
				);
				if (updated_user.nModified) {
					return await User.findById(userID);
				} else throw new Error('Could not update user');
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 ||
					err.message === 'Unauthorized' ||
					err.message === 'Id not valid' ||
					err.message === 'User does not exist'
						? 403
						: 500
				);
			}
		},
	},
};

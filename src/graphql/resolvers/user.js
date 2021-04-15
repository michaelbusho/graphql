import User from '../../models/user';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { allPermissions } from '../../utils/variables';
import { hasPermission, cleanUserInfo, assignPermissions } from '../../utils/functions';
import CustomError from '../../utils/customError';

export default {
	Query: {
		users: async (_, _args, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_USERS)) {
					throw new Error('Unauthorized');
				}

				//If users already in cache return them
				if (cacheReady) {
					const stringifiedUsers = await cache.lrange('allUsers', 0, -1);
					const usersInCache = stringifiedUsers.length ? JSON.parse(stringifiedUsers) : [];
					if (usersInCache.length) return usersInCache;
				}

				const all_users = await User.find();

				//All Users were not in cache save them
				cacheReady && (await cache.rpush('allUsers', JSON.stringify(all_users)));

				return all_users;
			} catch (err) {
				throw new CustomError(err.message, err.message === 'Unauthorized' ? 403 : 500);
			}
		},
		findUserByRfid: async (_, { rfid }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

				if (!isAuthenticated || !hasPermission(permissions, allPermissions.READ_USERS)) {
					throw new Error('Unauthorized');
				}

				//If user already in cache return them
				if (cacheReady) {
					const userInCache = JSON.parse(await cache.get(rfid));
					if (userInCache) return userInCache;
				}

				const found_user = await User.findOne({ rfid });
				if (!found_user) {
					throw new Error('RFID does not exist');
				}

				//User was not in cache save them
				cacheReady && (await cache.set(rfid, JSON.stringify(found_user)));
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

				const user_data = cleanUserInfo(user);
				const token = jwt.sign({ ...user_data }, process.env.JWT_KEY, {
					expiresIn: process.env.TOKEN_LIFE,
				});
				return {
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
		createUser: async (_, { UserInput }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

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

				cacheReady && cache.del('allUsers');
				return await new_user.save();
			} catch (err) {
				throw new CustomError(
					err.message,
					err.code === 11000 || err.message === 'Unauthorized' ? 403 : 500
				);
			}
		},
		deleteUser: async (_, { userID }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

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
				if (isDelete.ok) {
					cacheReady && cache.del(user.rfid);
					cacheReady && cache.del('allUsers');
					return user;
				} else throw new Error('Could not delete user.');
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
		updateUser: async (_, { userID, UserInput }, { isAuth, cache }) => {
			try {
				const { isAuthenticated, permissions } = isAuth;
				const cacheReady = cache.status === 'ready';

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
					cacheReady && cache.del(pre_user.rfid);
					cacheReady && cache.del('allUsers');
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

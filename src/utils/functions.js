import { roles, allPermissions } from './variables';
import User from '../models/user';
import Location from '../models/location';
import EnhancedRedis from './enhancedCaching';

export function assignPermissions(role) {
	switch (role) {
		case roles.ADMIN:
			return Object.keys(allPermissions);
		case roles.DEFAULT_USER:
			return [
				allPermissions.READ_USERS,
				allPermissions.READ_LOCATIONS,
				allPermissions.READ_APPEARANCES,
			];
		default:
			return [];
	}
}

export function hasPermission(ownedPermissions, targetPermission) {
	return ownedPermissions.includes(targetPermission);
}

export function cleanUserInfo(user) {
	return {
		id: user._id,
		rfid: user.rfid,
		email: user.email,
		name: user.name,
		lastName: user.lastName,
		role: user.role,
		permissions: user.permissions,
		health_status: user.health_status,
		address: user.address,
		phone_number: user.phone_number,
	};
}

export async function populateAppearances(appearances) {
	return await Promise.all(appearances.map((appearance) => transformAppearance(appearance)));
}

export async function transformAppearance(appearance) {
	const found_user = await User.findById(appearance.user);
	const found_location = await Location.findById(appearance.location);
	appearance.user = found_user;
	appearance.location = found_location;
	return appearance;
}

export const createRedisCache = () => {
	return new EnhancedRedis({
		connectTimeout: 5000,
		reconnectOnError: function (err) {
			console.log('Reconnect on error', err);
			var targetError = 'READONLY';
			if (err.message.slice(0, targetError.length) === targetError) {
				// Only reconnect when the error starts with "READONLY"
				return true;
			}
		},
		retryStrategy: function (times) {
			console.log('Redis Retry', times);
			if (times >= 3) {
				return undefined;
			}
			var delay = Math.min(times * 50, 2000);
			return delay;
		},
		socket_keepalive: false,
	});
};

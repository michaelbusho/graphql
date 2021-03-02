import { roles, allPermissions } from './variables';
import User from '../models/user';

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

export function populateAppearances(appearances) {
	return appearances.map((appearance) => transformAppearance(appearance));
}

export async function transformAppearance(appearance) {
	const found_user = await User.findById(appearance.user);
	const found_location = await Location.findById(appearance.location);
	appearance.user = found_user;
	appearance.location = found_location;
	return appearance;
}

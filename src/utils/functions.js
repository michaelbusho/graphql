import { roles, allPermissions } from './variables';

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

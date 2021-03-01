export function assignPermissions(role) {
	switch (role) {
		case roles.ADMIN:
			return Object.keys(permissions);
		case roles.DEFAULT_USER:
			return [permissions.READ_USERS, permissions.READ_LOCATIONS, permissions.READ_APPEARANCES];
		default:
			return [];
	}
}

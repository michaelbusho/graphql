import mongoose from 'mongoose';
import { roles, health_statuses } from '../utils/variables';
import appearanceSchema from './appearance';

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		rfid: {
			type: String,
			required: true,
			unique: true,
		},
		role: {
			type: String,
			required: true,
			enum: Object.keys(roles),
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
		},
		name: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
			required: true,
		},
		health_status: {
			type: String,
			required: true,
			enum: Object.keys(health_statuses),
		},
		address: {
			type: String,
		},
		phone_number: {
			type: String,
		},
		image: { data: Buffer, contentType: String },
		permissions: [
			{
				type: String,
				required: true,
			},
		],
	},
	{ timestamps: true }
);

//Middleware to cascade delete
userSchema.pre('deleteOne', { document: false, query: true }, async function () {
	const doc = await this.model.findOne(this.getFilter());
	await appearanceSchema.deleteMany({ user: doc._id });
});

export default mongoose.model('User', userSchema);

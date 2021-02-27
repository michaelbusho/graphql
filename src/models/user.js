import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		rfid: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
		},
		image: { data: Buffer, contentType: String },
		permissions: [
			{
				type: String,
				required: true,
			},
		],
		role: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

export default mongoose.model('User', userSchema);

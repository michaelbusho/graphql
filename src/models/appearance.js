import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const appearanceSchema = new Schema(
	{
		location: {
			type: 'ObjectId',
			ref: 'Location',
		},
		user: {
			type: 'ObjectId',
			ref: 'User',
		},
	},
	{ timestamps: true }
);

export default mongoose.model('Appearance', appearanceSchema);

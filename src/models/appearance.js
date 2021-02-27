import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const appearanceSchema = new Schema({
	location: {
		type: 'ObjectId',
		ref: 'Location',
	},
	user: {
		type: 'ObjectId',
		ref: 'User',
	},
	time_stamp: { type: Date, default: Date.now },
});

export default mongoose.model('Appearance', appearanceSchema);

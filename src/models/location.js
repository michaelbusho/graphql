import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const locationSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
});

export default mongoose.model('Location', locationSchema);

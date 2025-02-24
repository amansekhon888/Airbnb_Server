import {Schema, model} from 'mongoose';

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    thumbnail: {
        type: String,
        required: true
    }
}, {timestamps: true});

export default model('Categories', CategorySchema);
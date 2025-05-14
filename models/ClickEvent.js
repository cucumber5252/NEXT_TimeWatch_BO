// models/ClickEvent.js
import mongoose from 'mongoose';

const ClickEventSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ClickEvent || mongoose.model('ClickEvent', ClickEventSchema);

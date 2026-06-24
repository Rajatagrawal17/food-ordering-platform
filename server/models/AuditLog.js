import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true, index: true },
    method: { type: String, required: true },
    url: { type: String, required: true },
    ip: { type: String },
    userAgent: { type: String },
    details: { type: mongoose.Schema.Types.Mixed },
    status: { type: String, enum: ['success', 'failure'], required: true, index: true },
    error: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

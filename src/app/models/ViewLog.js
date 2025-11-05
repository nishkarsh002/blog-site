import mongoose from 'mongoose';
import crypto from 'crypto';

const ViewLogSchema = new mongoose.Schema({
  postSlug: {
    type: String,
    required: true,
    index: true
  },
  ipHash: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  engagementTime: {
    type: Number,
    default: 60 // seconds of engagement required
  }
});

// Compound index for efficient lookups
ViewLogSchema.index({ postSlug: 1, ipHash: 1, timestamp: -1 });

// TTL index to automatically delete records older than 30 days (for cleanup)
ViewLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method to hash IP addresses
ViewLogSchema.statics.hashIP = function(ip) {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'default-salt').digest('hex');
};

// Static method to check if IP can view (not viewed in last 24 hours)
ViewLogSchema.statics.canView = async function(postSlug, ip) {
  const ipHash = this.hashIP(ip);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const existingView = await this.findOne({
    postSlug,
    ipHash,
    timestamp: { $gte: twentyFourHoursAgo }
  });
  
  return !existingView;
};

// Static method to log a view
ViewLogSchema.statics.logView = async function(postSlug, ip, userAgent = '') {
  const ipHash = this.hashIP(ip);
  
  const viewLog = new this({
    postSlug,
    ipHash,
    userAgent,
    timestamp: new Date()
  });
  
  return await viewLog.save();
};

export default mongoose.models.ViewLog || mongoose.model('ViewLog', ViewLogSchema);
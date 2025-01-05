// models/Discussion.js
import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher']
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isInstructor: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  }]
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true // Make courseId required
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course.sections.lessons'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 5,
    maxLength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    minLength: 20
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorModel'
  },
  authorModel: {
    type: String,
    required: true,
    enum: ['Student', 'Teacher'],
    default: 'Teacher'
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false // Remove required constraint
  },
  type: {
    type: String,
    enum: ['question', 'discussion', 'announcement'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['open', 'resolved', 'closed'],
    default: 'open'
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isAnnouncement: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel'
  }],
  replies: [replySchema],
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


// Automatically update lastActivity on new replies
discussionSchema.pre('save', function(next) {
  if (this.isModified('replies')) {
    this.lastActivity = new Date();
  }
  next();
});

// Index for searching
discussionSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Compound indexes for efficient querying
discussionSchema.index({ courseId: 1, status: 1 });
discussionSchema.index({ courseId: 1, lastActivity: -1 });

// Static method to get course discussion stats
discussionSchema.statics.getCourseStats = async function(courseId) {
  return this.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        totalDiscussions: { $sum: 1 },
        resolvedDiscussions: { 
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        totalReplies: { $sum: { $size: '$replies' } },
        totalViews: { $sum: '$views' }
      }
    }
  ]);
};

const Discussion = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);
export default Discussion;
// lib/models/Teacher.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  credentials: {
    type: String,
    required: [true, 'Professional credentials are required'],
    trim: true
  },
  bio: {
    type: String,
    required: [true, 'Professional bio is required'],
    maxlength: 1000
  },
  certifications: [{
    name: String,
    file: String,
    uploadDate: Date,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  expertise: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  socialMedia: {
    linkedin: String,
    twitter: String,
    website: String
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  earnings: {
    total: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    history: [{
      amount: Number,
      date: Date,
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      type: {
        type: String,
        enum: ['live-session', 'recorded-course']
      }
    }]
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  accountStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);

export default Teacher;
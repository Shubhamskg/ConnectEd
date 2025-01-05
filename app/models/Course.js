// models/Course.js
import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoURL: String,
  duration: Number,
  resources: [{ type: String }]
});

const sectionSchema = new mongoose.Schema({
  title: String,
  lessons: [lessonSchema]
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Teacher'
  },
  teacherName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  sections: [sectionSchema],
  enrollments: {
    type: Number,
    default: 0
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  prerequisites: String,
  objectives: [String],
  featured: {
    type: Boolean,
    default: false
  },
  completionCriteria: {
    minLessonsWatched: {
      type: Number,
      default: 80  // percentage
    },
    minQuizScore: {
      type: Number,
      default: 70  // percentage
    }
  }
}, {
  timestamps: true,
  strict: false  // This will allow for additional fields in your existing data
});

// Add text index for search
courseSchema.index({
  title: 'text',
  description: 'text',
  'sections.title': 'text',
  'sections.lessons.title': 'text'
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;
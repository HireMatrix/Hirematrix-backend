import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
      type: String,
    },
    experience: {
      type: Number,
    },
    salary: {
      type: Number,
    },
    datePosted: {
      type: String,
    },
    highestEducation: {
      type: String,
    },
    workMode: {
      type: Array,
    },
    workType: {
      type: Array,
    },
    workShift: {
      type: Array,
    },
    department: {
      type: Array,
    },
    englishLevel: {
      type: String,
    },
    gender: {
      type: String,
    },
    location: {
      type: String
    },
    description: {
      type: String,
    },
    embedding: {
      type: [Number],
      required: true
    }
});
  
export const AllJobs = mongoose.model('Job', jobSchema);
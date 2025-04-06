import { AllJobs } from "../models/jobSchema.js"
import { User } from "../models/userSchema.js";
import { scrapeJobsFromUrl } from "../utils/jobScraper.js";

export const AllJobsAdmin = async (req, res) => {
    try {
        const search = req.query.search || '';

        const jobs = await AllJobs.find({
            title: { $regex: search, $options: 'i' }
        });

        res.status(200).json(jobs);
    } catch (error) {
        console.log("Error fetching jobs:", error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
};

export const UploadJob = async (req, res) => {
    try {
        const { 
            jobTitle, 
            experience, 
            salary,
            highestEducation,
            workMode,
            workType,
            workShift,
            department,
            englishLevel,
            gender,
            location
        } = req.body;

        if (!jobTitle || !experience || !salary || !highestEducation || !department || !location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields.",
            });
        }

        const job = new AllJobs({
            title: jobTitle,
            experience: experience,
            salary: salary,
            datePosted: new Date().toISOString().split('T')[0],
            highestEducation: highestEducation,
            workMode: workMode,
            workType: workType,
            workShift: workShift,
            department: department,
            englishLevel: englishLevel,
            gender: gender,
            location: location
        })
        
        await job.save()

        res.status(201).json({
            success: true,
            message: "job created successfully",
            jobs: {
                ...job,
            }
        });
    } catch (error) {
        console.log('Error is Posting job:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
}

// Todo - for multiple routes
export const UploadMultipleJobs = async(req, res) => {}

export const DeleteJob = async (req, res) => {
    try {
        const {jobId} = req.query;

        if(!jobId) {
            return res.status(400).json({
                message: "Job Id is required"
            })
        }

        const deleteJob = await AllJobs.findByIdAndDelete(jobId);

        if(!deleteJob) {
            return res.status(404).json({
                message: "Job not found"
            })
        }

        res.status(200).json({
            message: "User Deleted successfully",
            jobId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const AllUsersAdmin = async (req, res) => {
    try {
        const search = req.query.search || '';

        const users = await User.find({
            name: { $regex: search, $options: 'i' }
        });

        res.status(200).json(users);
    } catch (error) {
        console.log("Error fetching jobs:", error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
};

// Todo - for updating a user details
export const UpdateUser = async (req, res) => {}

export const DeleteUser = async (req, res) => {
    try {
        const {userId} = req.query;

        if(!userId) {
            return res.status(400).json({
                message: "User Id is required"
            })
        }

        const deleteUser = await User.findByIdAndDelete(userId);

        if(!deleteUser) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User Deleted successfully",
            userId
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const GetJobsFromUrl = async (req, res) => {
    try {
        const url = req.query.jobUrl;

        if(!url) {
            return res.status(404).json({
                success: false,
                message: "Url is Required"
            })
        }

        const jobs = await scrapeJobsFromUrl(url);

        if(!jobs) {
            return res.status(404).json({
                message: "Jobs are not found"
            })
        }

        res.status(200).json({ 
            message: "successfully found Jobs",
            jobs: jobs
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
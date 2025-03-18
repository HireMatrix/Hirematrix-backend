import { AllJobs } from "../models/jobSchema.js"
import { User } from "../models/userSchema.js";

export const AllJobsAdmin = async (req, res) => {
    try {
        const jobs = await AllJobs.find();
        res.send(jobs);
    } catch (error) {
        console.log("Error fetching jobs:", error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
};

export const AllUsersAdmin = async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        console.log("Error fetching jobs:", error);
        res.status(500).json({
            success: false,
            message: "server error"
        })
    }
};

export const UploadJob = async (req, res) => {
    const { 
        title, 
        experience, 
        salary,
        datePosted,
        highestEducation,
        workMode,
        workType,
        workShift,
        department,
        englishLevel,
        gender
     } = req.body;
    try {

        const job = new AllJobs({
            title: title,
            experience: experience,
            salary: salary,
            datePosted: datePosted,
            highestEducation: highestEducation,
            workMode: workMode,
            workType: workType,
            workShift: workShift,
            department: department,
            englishLevel: englishLevel,
            gender: gender,
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
        
    }
}
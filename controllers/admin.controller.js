import { AllJobs } from "../models/jobSchema.js"
import { User } from "../models/userSchema.js";
import { scrapeJobsFromUrl } from "../utils/jobScraper.js";
import { validateJobData } from "../utils/validateJobData.js";
import redisClient from '../db/redisClient.js';

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
  
      const text = `
        Title: ${jobTitle}
        Experience: ${experience} years
        Salary: ${salary}
        Education: ${highestEducation}
        Work Mode: ${workMode?.join(", ")}
        Work Type: ${workType?.join(", ")}
        Work Shift: ${workShift?.join(", ")}
        Department: ${department?.join(", ")}
        English Level: ${englishLevel}
        Gender: ${gender}
        Location: ${location}
      `.trim();
  
      const embeddingResponse = await axios.post('http://127.0.0.1:8000/embedding', {
        model: 'nomic-embed-text',
        prompt: text,
      });
  
      const embedding = embeddingResponse.data.embedding;
  
      const job = new AllJobs({
        title: jobTitle,
        experience,
        salary,
        datePosted: new Date().toISOString().split('T')[0],
        highestEducation,
        workMode,
        workType,
        workShift,
        department,
        englishLevel,
        gender,
        location,
        embedding,
      });
  
      await job.save();
  
      res.status(201).json({
        success: true,
        message: "Job created successfully",
        job
      });
    } catch (error) {
      console.error('Error in Posting job:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server Error'
      });
    }
};

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

        const jobs = await scrapeJobsFromUrl('https://apna.co/jobs');

        if(!jobs) {
            return res.status(404).json({
                message: "Jobs are not found"
            })
        }

        const validatedJobs = [];

        // for this type checking we can also use the jod, yup, joi
        for(const job of jobs) {
            if(!validateJobData(job)) {
                continue;
            }
            const cacheKey = `job:${job.title}:${job.company}`;
            const cachedJob = await redisClient.get(cacheKey);

            if(cachedJob) {
                validatedJobs.push(job);
            } else {
                await redisClient.set(cacheKey, JSON.stringify(job), { EX: 3600 })
                validatedJobs.push(job)
            }
        }

        res.status(200).json(validatedJobs);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export const GetCachedJobs = async (req, res) => {
    try {
        const keys = await redisClient.keys('job:*');
        if (!keys.length) {
            return res.status(404).json({ message: 'No jobs found in cache' });
        }

        const jobs = [];

        for (const key of keys) {
            const data = await redisClient.get(key);
            if (data) {
                jobs.push(JSON.parse(data));
            }
        }

        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching cached jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
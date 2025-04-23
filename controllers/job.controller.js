import { AllJobs } from "../models/jobSchema.js";
import { User } from "../models/userSchema.js";
import redisClient from "../db/redisClient.js";
import { calculateCosineSimilarity } from "../utils/embedding.js";

export const fetchAllJobs = async (req, res) => {
  const {
    userId,
    sortBy,
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
  } = req.query;

  const filterFn = (job) => {
    if (experience && experience !== "21" && job.experience > Number(experience)) return false;
    if (salary && salary !== "0" && job.salary > Number(salary)) return false;
    if (highestEducation && job.highestEducation !== highestEducation) return false;
    if (datePosted && datePosted !== "All") {
      const hours = Number(datePosted);
      const jobDate = new Date(job.datePosted);
      const currentDate = new Date();
      const pastDate = new Date(currentDate.getTime() - hours * 60 * 60 * 1000);
      if (jobDate < pastDate) return false;
    }
    if (workMode && !workMode.split(",").every(mode => job.workMode.includes(mode))) return false;
    if (workType && !workType.split(",").every(type => job.workType.includes(type))) return false;
    if (workShift && !workShift.split(",").every(shift => job.workShift.includes(shift))) return false;
    if (englishLevel && job.englishLevel !== englishLevel) return false;
    if (gender && job.gender !== gender) return false;
    return true;
  };

  let sortFn = () => 0;
  switch (sortBy) {
    case "Salary - High to low":
      sortFn = (a, b) => b.salary - a.salary;
      break;
    case "Date posted - New to Old":
      sortFn = (a, b) => new Date(b.datePosted) - new Date(a.datePosted);
      break;
    case "Experience - High to low":
      sortFn = (a, b) => b.experience - a.experience;
      break;
  }

  try {
    const user = await User.findById(userId);

    if (user?.hasCompletedOnboarding && user?.embedding) {
      const redisKey = `recommended_jobs:${userId}`;
      let cachedJobs = await redisClient.get(redisKey);

      if (!cachedJobs) {
        const jobs = await AllJobs.find({ embedding: { $exists: true } });
        const scored = jobs.map(job => ({
          job,
          score: calculateCosineSimilarity(user.embedding, job.embedding)
        }));
        const topJobs = scored.sort((a, b) => b.score - a.score).map(item => item.job);
        await redisClient.set(redisKey, JSON.stringify(topJobs), { EX: 3600 });
        cachedJobs = JSON.stringify(topJobs);
      }

      const parsedJobs = JSON.parse(cachedJobs);
      const filteredJobs = parsedJobs.filter(filterFn).sort(sortFn);
      return res.json(filteredJobs);
    }

    const fallbackRedisKey = userId ? `recommended_jobs:${userId}` : `recommended_jobs:guest`;
    let cachedJobs = await redisClient.get(fallbackRedisKey);

    if (!cachedJobs) {
      const allJobs = await AllJobs.find({});
      await redisClient.set(fallbackRedisKey, JSON.stringify(allJobs), { EX: 3600 });
      cachedJobs = JSON.stringify(allJobs);
    }

    const parsedJobs = JSON.parse(cachedJobs);
    const filteredJobs = parsedJobs.filter(filterFn).sort(sortFn);
    return res.json(filteredJobs);

  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
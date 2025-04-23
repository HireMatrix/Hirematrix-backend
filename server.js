import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { AllJobs } from './models/jobSchema.js'
import { connectDb } from './db/connectDb.js'
import authRoutes from './routes/auth.route.js'
import jobRoutes from './routes/job.route.js'
import adminRoutes from './routes/admin.route.js'
import axios from 'axios';

const app = express()
dotenv.config()

app.use(express.json()); // allows to parse the incoming req
app.use(cookieParser()); // allows to parse the incoming cookies
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

const port = process.env.PORT || 8080

app.get('/', (req, res) => {
    res.send('hello world');
});

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1', jobRoutes);

app.use('/api/v1/admin', adminRoutes);

app.post('/jobs-upload', async(req, res) => {
  try {
    const jobs = req.body;

    if (!Array.isArray(jobs)) {
      return res.status(400).json({ success: false, message: 'Expected an array of jobs' });
    }

    const jobsWithEmbeddings = await Promise.all(
      jobs.map(async (job) => {
        const text = `
          Title: ${job.title}
          Experience: ${job.experience} years
          Salary: ${job.salary}
          Education: ${job.highestEducation}
          Work Mode: ${job.workMode?.join(", ")}
          Work Type: ${job.workType?.join(", ")}
          Work Shift: ${job.workShift?.join(", ")}
          Department: ${job.department?.join(", ")}
          English Level: ${job.englishLevel}
          Gender: ${job.gender}
          Location: ${job.location}
        `.trim();

        const response = await axios.post('http://127.0.0.1:8000/embedding', {
          model: 'nomic-embed-text',
          prompt: text
        });

        const embedding = response.data.embedding;

        return {
          ...job,
          embedding,
        };
      })
    );

    await AllJobs.insertMany(jobsWithEmbeddings);

    res.status(200).json({ success: true, count: jobsWithEmbeddings.length });
  } catch (error) {
    console.error("Upload Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(port, () => {
  connectDb();
  console.log(`server is listening at port ${port}`);
});
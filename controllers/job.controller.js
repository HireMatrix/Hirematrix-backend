import { AllJobs } from "../models/jobSchema.js";

export const fetchAllJobs = async (req, res) => {

    const { sortBy, experience, salary, datePosted, highestEducation, workMode, workType, workShift, department, englishLevel, gender } = req.query;

    const filter = {}

    let sortCriteria;
    switch(sortBy){
      case 'Salary - High to low':
        sortCriteria = { salary: -1 };
        break;
      case 'Date posted - New to Old':
        sortCriteria = { datePosted: -1 };
        break;
      case 'Experience - High to low':
        sortCriteria = { experience: -1 };
        break;
      case 'Relevant':
      default:
        sortCriteria = {};
        break;
    }

    if(experience && experience !== '21'){
      filter.experience = { $lte: Number(experience)}
    }

    if(salary && salary !== '0'){
      filter.salary = { $lte: Number(salary) }
    }

    if(highestEducation){
      const educationLevels = [ '10 or Below 10th', '12th Pass', 'Diploma', 'ITI', 'Graduate', 'Post Graduate' ]
      const index = educationLevels.indexOf(highestEducation)

      if(index !== -1){
        filter.highestEducation = { $in: educationLevels[index] }
      }
    }

    if (datePosted && datePosted !== 'All') {
      const hours = Number(datePosted);
      if ([24, 72, 128].includes(hours)) {
        const currentDate = new Date('2024-07-10');
        const pastDate = new Date(currentDate.getTime() - (hours * 60 * 60 * 1000 ));
        filter.datePosted = { $lte: pastDate.toISOString().split('T')[0] };
      } else {
        return res.status(400).json({ message: 'Invalid datePosted option provided' });
      }
    }

    if(workMode){
      const workModeVlaues = workMode.split(',')
      filter.workMode = { $all: workModeVlaues }
    }

    if(workShift){
      const workShiftVlaues = workShift.split(',')
      filter.workShift = { $all: workShiftVlaues }
    }

    if(workType){
      const workTypeVlaues = workType.split(',')
      filter.workType = { $all: workTypeVlaues }
    }

    if(englishLevel){
      filter.englishLevel = englishLevel
    }

    if(gender){
      filter.gender = gender
    }

    try {
        const jobs = await AllJobs.find(filter).sort(sortCriteria)
        res.send(jobs)
    } catch (error) {
        console.log('Error fetching jobs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
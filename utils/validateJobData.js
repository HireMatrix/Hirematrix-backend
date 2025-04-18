export const validateJobData = (data) => {
    if(
        !data.title || 
        !data.experience || 
        !data.salary || 
        !data.highestEducation || 
        !data.workMode || 
        !data.workType || 
        !data.workShift ||
        !data.department ||
        !data.englishLevel ||
        !data.gender ||
        !data.location ||
        !data.description
    ) {
        return false;
    } else if (
        typeof data.title !== "string" ||
        typeof data.experience !== "number" ||
        typeof data.salary !== "number" ||
        typeof data.highestEducation !== "string" ||
        !Array.isArray(data.workMode) ||
        !Array.isArray(data.workType) ||
        !Array.isArray(data.workShift) ||
        !Array.isArray(data.department) ||
        typeof data.englishLevel !== "string" ||
        typeof data.gender !== "string" ||
        typeof data.location !== "string" ||
        typeof data.description !== "string"
    ) {
        return false;
    }
    return true;
}
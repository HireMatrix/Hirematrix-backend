export const scrapeJobsFromUrl = async (url) => {
    try {
        console.log(url)
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}
import mongoose from "mongoose";


export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.URI)
        console.log('Connected to Mongodb');
    } catch (error) {
        console.log(`Error in connection : ${error.message}`);
        process.exit(1);
    }
}
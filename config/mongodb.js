import mongoose from 'mongoose'; // Correctly import the mongoose module

const connectDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI || "mongodb+srv://sabariks:enladduS0409%23@cluster0.vf3yi.mongodb.net/", 
        );
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;

import mongoose from "mongoose";

export type IUser = {
    name?: string;
    city?: string;
    stepId?: string;
    _id?: string;
    chatId?: string;
    lang?: string;
    gender?: string;
    birthDate?: Date,
    email?: string;
    phoneNumber?: string;
    testDate?: Date;
    testPurpose?: string;
    region?: string;
    lastMessageId?: string;
    testType?: string;
    phoneNumberIsRegisteredInDiia?: boolean;
    paymentType?: string,
    messenger?: string
}

export type UserDocument = mongoose.Document & IUser ;

const userSchema = new mongoose.Schema({
    name: String,
    city: String,
    stepId: String,
    chatId: String,
    lang: String,
    testType: String,
    gender: String,
    birthDate: Date,
    email: String,
    phoneNumber: String,
    testDate: Date,
    testPurpose: String,
    region: String,
    lastMessageId: String,
    phoneNumberIsRegisteredInDiia: Boolean,
    paymentType: String,
    messenger: String
});

export const User = mongoose.model<UserDocument>("users", userSchema);

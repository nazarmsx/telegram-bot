import {injectable} from "tsyringe";
import {User, UserDocument, IUser} from "../models";
import {REGION} from "../util/secrets";

@injectable()
export class UserService {

    constructor() {
    }

    public async createUser(user: IUser): Promise<IUser> {
        const inDbUser = await User.findOne({chatId: user.chatId});
        if (inDbUser) {
            throw new Error("DUPLICATE_CHAT_ID");
        }
        const userDoc = new User(user);
        try {
            let res = await userDoc.save();
            return res.toObject();
        } catch (error) {
            throw error;
        }
    }

    public async findUserByChatId(chatId: string): Promise<UserDocument> {
        return  User.findOne({chatId});
    }

    public async findUserById(userId: string): Promise<UserDocument> {
        return  User.findOne({_id: userId});
    }

    public async updateUserFields(chatId: string, user: IUser) {
        return  User.updateOne({chatId: chatId}, user)
    }

    public async updateUser(chatId: string, user: IUser) {
        let userDoc = await this.findUserByChatId(chatId);
        if (!userDoc) {
            throw new Error('USER_NOT_FOUND');
        }
        Object.assign(userDoc, user);
        const updatedUser = await userDoc.save();
        return updatedUser.toObject();
    }

    public async resetUserProfile(chatId: string, fields?: any ) {
        let resetFields: IUser = {
            chatId,
            region: REGION,
            stepId: null,
            name: null,
            gender: null,
            birthDate: null,
            email: null,
            phoneNumber: null,
            testDate: null,
            testPurpose: null,
            phoneNumberIsRegisteredInDiia: null,
            testType: null,
            lastMessageId: null,
        };
        if(fields){
            resetFields = Object.assign(resetFields, fields);
        }
        await this.updateUser(chatId, resetFields)
    }

    public async deleteUser(userId: string) {
        return User.findOneAndDelete({id: userId});
    }
}
import {BotFlow, KyivBotFlow, FlowStep} from './BotFlow';
import {ExternalApiService, UserService} from '../services';
import {container, injectable} from "tsyringe";
import {IUser} from "../models";
import {REGION} from "../util/secrets";
import moment from 'moment';

const botFlow = REGION === 'kyiv' ? container.resolve(KyivBotFlow): container.resolve(BotFlow);
@injectable()
export class BotController {

    constructor(private userService: UserService, private externalApiService: ExternalApiService) {
    }

    public async start(chatId: string, messenger: string) {
        const user = await this.userService.findUserByChatId(chatId);
        if (!user) {
            await this.userService.createUser({chatId, region: REGION, stepId: null, messenger: messenger} as any);
        }
    }

    public async getNextStep(chatId: string): Promise<FlowStep> {
        const flowSteps = botFlow.getBotFlowSteps();
        const user = await this.userService.findUserByChatId(chatId);
        if (!user.stepId) {
            return botFlow.getBotFlowSteps()[0]
        }
        let res: FlowStep = null;
        flowSteps.forEach((item, index, array) => {
            if (item.key === user.stepId && index + 1 < array.length) {
                res = array[index+1];
            }
        });
        if (res && res.key === 'askPhoneIsRegisteredInDiia' && (user.testType !== 'PCR' || (user.region === 'kyiv' && user.testPurpose != 'arrival'))) {
            await this.userService.updateUserFields(chatId, {stepId: 'askPhoneIsRegisteredInDiia', phoneNumberIsRegisteredInDiia: null});
            return await this.getNextStep(chatId);
        }
        if (res && res.key === 'getOtherPhoneNumber' && (user.phoneNumberIsRegisteredInDiia === true || user.phoneNumberIsRegisteredInDiia === null)) {
            await this.userService.updateUserFields(chatId, {stepId: 'getOtherPhoneNumber'});
            return await this.getNextStep(chatId);
        }
        if(!res){
            const resp = await this.externalApiService.sendOrder(user);
            return {
                key: user.paymentType === 'offline'? 'btnDescriptionOffline':'btnDescription',
                targetField: '',
                type: 'link',
                isLast: true,
                buttons: [
                    {
                        key: user.paymentType === 'online' ? 'goToPayment' : 'getQR',
                        value: '',
                        url: resp.redirect_url
                    }
                ]
            };
        }
        return res;
    }

    public async saveStep(chatId: string, value: any) {
        const flowStep = await this.getNextStep(chatId);
        if (flowStep) {
            if(flowStep.type === 'date'){
                value = moment(value, 'DD-MM-YYYY').toDate();
            }
            const updateFields: IUser = {
                [flowStep.targetField] : value,
                stepId: flowStep.key
            };
            await this.userService.updateUserFields(chatId, updateFields);
        }
    }
}
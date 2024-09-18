import {injectable} from "tsyringe";
import moment from "moment";

export interface FlowStep {
    key: string;
    targetField: string;
    type: string;
    buttons?: Button[];
    btnSeparateRow?: boolean,
    keyBoardType?: 'inline' | 'keyboard';
    isLast? : boolean;
}

export interface Button {
    value: any;
    key: string;
    type?: string;
    url?: string;
}

@injectable()
export class BotFlow {
    public getBotFlowSteps(): FlowStep[] {
        return [
            {
                key: 'getLanguage',
                targetField: 'lang',
                type: 'btn',
                buttons: [
                    {
                        value: 'uk',
                        key: 'setLangUk'
                    },
                    {
                        value: 'en',
                        key: 'setLangEn'
                    },
                    {
                        value: 'ru',
                        key: 'setLangRu'
                    }
                ]
            },
            {
                key: 'getTestType',
                targetField: 'testType',
                type: 'btn',
                buttons: [
                    {
                        value: 'EXP',
                        key: 'getTestTypeExpress'
                    },
                    {
                        value: 'PCR',
                        key: 'getTestTypePcr'
                    },
                ]
            },
            {
                key: 'getName',
                targetField: 'name',
                type: 'string'
            },
            {
                key: 'getGender',
                targetField: 'gender',
                type: 'btn',
                buttons: [
                    {
                        value: 'male',
                        key: 'getGenderMale'
                    },
                    {
                        value: 'female',
                        key: 'getGenderFemale'
                    },
                ]
            },
            {
                key: 'getBirthDate',
                targetField: 'birthDate',
                type: 'date'
            },
            {
                key: 'getEmail',
                targetField: 'email',
                type: 'string'
            },
            {
                key: 'getPhoneNumber',
                targetField: 'phoneNumber',
                type: 'string',
                keyBoardType: 'keyboard',
                buttons: [
                    {
                        value: '',
                        key: 'getPhoneNumber',
                        type: 'contact'
                    },
                ]
            },
            {
                key: 'askPhoneIsRegisteredInDiia',
                targetField: 'phoneNumberIsRegisteredInDiia',
                type: 'btn',
                buttons: [
                    {
                        value: true,
                        key: 'yes'
                    },
                    {
                        value: false,
                        key: 'no'
                    },
                ]
            },
            {
                key: 'getOtherPhoneNumber',
                targetField: 'phoneNumber',
                type: 'string',
            }, {
                key: 'getTestDate',
                targetField: 'testDate',
                type: 'date',
                btnSeparateRow: true,
                get buttons() {
                    return [
                        {
                            value: moment().format('DD.MM.YYYY'),
                            key: 'today'
                        },
                        {
                            value: moment().add(1, 'd').format('DD-MM-YYYY'),
                            key: 'tomorrow'
                        },
                        {
                            value: moment().add(2, 'd').format('DD-MM-YYYY'),
                            key: 'afterTomorrow'
                        },
                        {
                            value: moment().add(3, 'd').format('DD-MM-YYYY'),
                            key: moment().add(3, 'd').format('DD-MM-YYYY')
                        },
                        {
                            value: moment().add(4, 'd').format('DD-MM-YYYY'),
                            key: moment().add(4, 'd').format('DD-MM-YYYY')
                        },
                        {
                            value: moment().add(5, 'd').format('DD-MM-YYYY'),
                            key: moment().add(5, 'd').format('DD-MM-YYYY')
                        },
                    ]
                }
            },
            {
                key: 'getPaymentType',
                targetField: 'paymentType',
                type: 'btn',
                buttons: [
                    {
                        value: 'online',
                        key: 'paymentTypeOnline'
                    },
                    {
                        value: 'offline',
                        key: 'paymentTypeOffline'
                    }
                ]
            },
        ];
    }
}

@injectable()
export class KyivBotFlow extends BotFlow {
    constructor(){
        super();
    }
    getBotFlowSteps(): FlowStep[]{
        const res = super.getBotFlowSteps();
        res.splice(7, 0,
            {
                key: 'getTestPurposeType',
                targetField: 'testPurpose',
                type: 'btn',
                buttons: [
                    {
                        value: 'departure',
                        key: 'getTestPurposeDeparture'
                    },
                    {
                        value: 'arrival',
                        key: 'getTestPurposeArrival'
                    },
                ]

            });
        return  res;
    }
}
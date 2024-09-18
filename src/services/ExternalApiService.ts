import {injectable} from "tsyringe";
import {User, IUser} from "../models";
import axios from 'axios';
import moment from "moment";
import logger from "../util/logger";
import to from 'await-to-js';
import {EXTERNAL_API} from "../util/secrets";

@injectable()
export class ExternalApiService {

    private readonly BASE_URL = EXTERNAL_API;

    constructor() {
    }

    async sendOrder(user: IUser): Promise<{redirect_url: string; order_code: string; test: string}> {
        let customer_name = user.name;
        let customer_surname = user.name;

        if(user.name && user.name.split && user.name.split(' ').length > 1 ){
            let [tmpCustomerName, ...tmpCustomerSurname] = user.name.split(' ');
            customer_name = tmpCustomerName;
            customer_surname = tmpCustomerSurname.join('')
        }

        const request = {
            customer_name,
            customer_surname,
            customer_male: user.gender === 'male' ? 'man' : 'woman',
            date_birthday: moment(user.birthDate).add(5, "hour").format('DD-MM-YYYY'),
            customer_phone: user.phoneNumber,
            customer_email: user.email,
            payment_type: user.paymentType,
            fly_date: moment(user.testDate).add(5, "hour").format('DD-MM-YYYY'),
            fly_airport: `${user.region === 'kyiv' ? user.testPurpose + ' Borispol' : user.region === 'odesa' ?'Odessa' : 'Kharkiv'}`,
            language: user.lang,
            type_test: user.testType,
            order_source: `${user.messenger}_${user.region === 'kyiv' ? 'kbp' : user.region === 'odesa' ? 'ods' : 'khr'}`
        };
        const reqUrl = `${this.BASE_URL}/test_chat.php`;
        console.log(`FETCHING: ${reqUrl} `, request);
        let [err, resp] = await to(axios.post(reqUrl, request));
        if (err) {
            logger.error(err);
        }
        if (resp) {
            console.log('RESP: ', resp.data);
        }
        return resp.data;
    }
}
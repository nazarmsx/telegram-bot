import {injectable} from "tsyringe";

export enum Lang {
    UK = 'uk',
    RU = 'ru',
    EN = 'en'
}

export interface Translations {
    getLanguage: string;
    register: string;
    getTestType: 'Choose test type:',
    getName: string;
    setLangUk: string;
    setLangRu: string;
    setLangEn: string;
    getTestTypeExpress: string;
    getTestTypePcr: string;
    finalMessage: string;
    getGender: string;
    getGenderMale: string;
    getGenderFemale: string;
    getBirthDate: string;
    getEmail: string;
    getPhoneNumber: string;
    getTestDate: string;
    getTestPurposeType: string;
    getTestPurposeDeparture: string;
    getTestPurposeArrival: string;
    greetingMessage: string;
    startFromBeginning: string;
    newRequest: string;
    today: string;
    tomorrow: string;
    afterTomorrow: string;
    phoneNumberSaved: string;
    getOtherPhoneNumber: string;
    sharePhoneNumber: string;
    getPaymentType: string;
    paymentTypeOffline: string;
    paymentTypeOnline: string;
    goToPayment: string;
    getQR: string;
    btnDescription: string;
    sharePhoneNumberViber: string;
    sendMessageToStart: string;
    languageChangedMsg: string;
    wrongDateFormat: string;
    paymentTypeOfflineKyiv: string;
    paymentTypeOfflineOdesa: string;
    btnDescriptionOffline: string;
    [key: string]: any;
}


@injectable()
export class MessageRegistry {
    public isLanguageSupported(lang: string) {
        return [Lang.EN, Lang.UK, Lang.RU].indexOf(lang as Lang) !==-1
    }

    public getTranslations(lang: string = Lang.EN): Translations {
        if (!lang || !this.isLanguageSupported(lang)) {
            lang = Lang.EN;
        }
        const translations: { [key: string]: any } = {
            [Lang.EN]: {
                getLanguage: 'Choose language',
                register: 'New register!',
                getTestType: 'Choose COVID test type:',
                getName: 'Enter your name:',
                setLangUk: 'Українська 🇺🇦',
                setLangRu: 'Русский 🇷🇺',
                setLangEn: 'English 🇬🇧',
                getTestTypeExpress: 'Express Test Antigen',
                getTestTypePcr: 'PCR Test',
                finalMessage: 'Great  👍 !Your request in processing now!',
                getGender: 'Select your gender:',
                getGenderMale: 'Male 👨',
                getGenderFemale: 'Female 👩',
                getBirthDate: 'Enter the date of birth in following format dd-mm-yyyy :',
                getEmail: 'Enter your email address:',
                getPhoneNumber: 'Enter the phone number or press button below:',
                getTestDate: 'Enter the desired test date  in following format dd-mm-yyyy :',
                getTestPurposeType: 'Choose the purpose of the test',
                getTestPurposeDeparture: 'For departure 🛫',
                getTestPurposeArrival: 'For arrival 🛬',
                greetingMessage: 'Hi there 👋! To register for the test, answer a few questions.',
                startFromBeginning: 'Start from beginning',
                newRequest: 'Register new passenger',
                today: 'Today',
                tomorrow: 'Tomorrow',
                afterTomorrow: 'After tomorrow',
                phoneNumberSaved: 'Phone number saved ✔',
                boryspil: 'Boryspil',
                odesa: 'Odesa',
                yes: 'Yes',
                no: 'No',
                askPhoneIsRegisteredInDiia: 'Is the app \'Diy vdoma\'  installed on this number?',
                getOtherPhoneNumber: 'Enter the phone number:',
                sharePhoneNumber: 'Use phone number from Telegram',
                getPaymentType: 'Select payment type 💳:',
                paymentTypeOffline: 'Offline',
                paymentTypeOnline: 'Online',
                goToPayment: 'Go to payment',
                getQR: 'Get a QR code',
                btnDescription: 'Follow the link below',
                sharePhoneNumberViber: 'Use phone number from Viber',
                sendMessageToStart: 'Write a message to get started.',
                languageChangedMsg: 'Language changed to 🇬🇧',
                wrongDateFormat: 'Invalid date format ❌',
                paymentTypeOfflineKyiv: 'In airport',
                paymentTypeOfflineOdesa: 'Mastercard',
                btnDescriptionOffline: 'Congratulations! You have successfully registered. Now open the QR code and show it to our manager at the airport',
                kharkiv: 'Kharkiv'
            },
            [Lang.UK]: {
                getLanguage: 'Виберіть мову',
                register: 'Нова реєстрація',
                getTestType: 'Оберіть тип тесту',
                getName: 'Введіть ПІБ:',
                setLangUk: 'Українська 🇺🇦',
                setLangRu: 'Русский 🇷🇺',
                setLangEn: 'English 🇬🇧',
                getTestTypeExpress: 'Експрес-тест на антиген',
                getTestTypePcr: 'ПЛР тест',
                finalMessage: 'Дякуємо за звернення 👍! Ваш запит зараз обробляється!',
                getGender: 'Оберіть вашу стать:',
                getGenderMale: 'Чоловік 👨',
                getGenderFemale: 'Жінка 👩',
                getBirthDate: 'Введіть дату народження у форматі дд-мм-рррр :',
                getEmail: 'Введіть email адресу:',
                getPhoneNumber: 'Введіть номер телефону або натисність кнопки нижче:',
                getTestDate: 'Введіть бажану дату тесту у форматі дд-мм-рррр :',
                getTestPurposeType: 'Оберіть призначення тесту',
                getTestPurposeDeparture: 'Для вильоту 🛫',
                getTestPurposeArrival: 'Для прибуваючих 🛬',
                greetingMessage: 'Привіт 👋! Для реєстарції на проходження тесту, дайте відповідь на декілька питань.',
                startFromBeginning: 'Почати спочатку',
                newRequest: 'Зареєструвати ще одного пасажира',
                today: 'Сьогодні',
                tomorrow: 'Завтра',
                afterTomorrow: 'Післязавтра',
                phoneNumberSaved: 'Номер телефону збережено ✔',
                boryspil: 'Бориспіль',
                odesa: 'Одеси',
                yes: 'Так',
                no: 'Ні',
                askPhoneIsRegisteredInDiia: 'Додаток Дій вдома встановлено на цей номер?',
                getOtherPhoneNumber: 'Введіть номер телефону:',
                sharePhoneNumber: 'Використати номер телефону з Telegram',
                getPaymentType: 'Оберіть тип оплати 💳:',
                paymentTypeOffline: 'Офлайн',
                paymentTypeOnline: 'Онлайн',
                goToPayment: 'Перейти до оплати',
                getQR: 'Отримати QR код',
                btnDescription: 'Перейдіть за посиланням нижче: ',
                sharePhoneNumberViber: 'Використати номер телефону з Viber',
                sendMessageToStart: 'Напишіть повідомлення щоб почати.',
                languageChangedMsg: 'Мову змінено 🇺🇦 ',
                wrongDateFormat: 'Невірний формат дати ❌',
                paymentTypeOfflineKyiv: 'В аеропорту',
                paymentTypeOfflineOdesa: 'Мастеркард',
                btnDescriptionOffline: 'Вітаю! Ви успішно зареєструвалися. Тепер відкрийте QR код і покажіть його нашому менеджера в аеропорту',
                kharkiv: 'Харків'
            },
            [Lang.RU]: {
                getLanguage: 'Выберите язык',
                register: 'Новая регистрация',
                getTestType: 'Выберите тип теста',
                getName: 'Введите ФИО:',
                setLangUk: 'Українська 🇺🇦',
                setLangRu: 'Русский 🇷🇺',
                setLangEn: 'English 🇬🇧',
                getTestTypeExpress: 'Экспресс тест на антиген',
                getTestTypePcr: 'ПЦР тест',
                finalMessage: 'Отлично! Ваш запрос сейчас в обработке!',
                getGender: 'Выберите ваш пол:',
                getGenderMale: 'Мужской 👨',
                getGenderFemale: 'Женский 👩',
                getBirthDate: 'Введите дату рождения в формате дд-мм-гггг :',
                getEmail: 'Введите email адрес:',
                getPhoneNumber: 'Введите номер телефона или нажмите кнопку ниже:',
                getTestDate: 'Введите желаемую дату теста в формате дд-мм-гггг :',
                getTestPurposeType: 'Выберите назначение теста',
                getTestPurposeDeparture: 'Для вылетающих 🛫',
                getTestPurposeArrival: 'Для прибывающих 🛬',
                greetingMessage: 'Здравствуйте 👋! Для записи на прохождение теста, ответьте на несколько вопросов.',
                startFromBeginning: 'Начать сначала',
                newRequest: 'Зарегистрировать еще одного пассажира',
                today: 'Сегодня',
                tomorrow: 'Завтра',
                afterTomorrow: 'Послезавтра',
                phoneNumberSaved: 'Номер телефона сохранен ✔',
                boryspil: 'Борисполь',
                odesa: 'Одессы ',
                yes: 'Да',
                no: 'Нет',
                askPhoneIsRegisteredInDiia: 'Приложение Дий вдома установлено на этот номер?',
                getOtherPhoneNumber: 'Введите номер телефона:',
                sharePhoneNumber: 'Использовать номер телефона из Telegram',
                getPaymentType: 'Выберите тип оплаты 💳:',
                paymentTypeOffline: 'Оффлайн',
                paymentTypeOnline: 'Онлайн',
                goToPayment: 'Перейти к оплате',
                getQR: 'Получить QR код',
                btnDescription: 'Перейдите по ссылке ниже',
                sharePhoneNumberViber: 'Использовать номер телефона из Viber',
                sendMessageToStart: 'Напишите сообщение чтобы начать.',
                languageChangedMsg: 'Язык изменен 🇷🇺',
                wrongDateFormat: 'Неверный формат даты ❌',
                paymentTypeOfflineKyiv: 'В аэропорту',
                paymentTypeOfflineOdesa: 'Мастеркард',
                btnDescriptionOffline: 'Поздравляю! Вы успешно зарегестрировались. Теперь откройте QR код и покажите его нашему менеджеру в аэропорту',
                kharkiv: 'Харьков'
            }
        };
        return translations[lang];
    }

    public isCommandName(textString: string){
        const commands = [
            this.getTranslations(Lang.EN).startFromBeginning,
            this.getTranslations(Lang.EN).newRequest,
            this.getTranslations(Lang.UK).startFromBeginning,
            this.getTranslations(Lang.UK).newRequest,
            this.getTranslations(Lang.RU).startFromBeginning,
            this.getTranslations(Lang.RU).newRequest,
        ];
        return commands.indexOf(textString) !== -1;
    }

    public getGreetingMessage(lang: Lang, region: string) {
        const translations: { [key: string]: any } = {
            [Lang.EN]: {
                greetingMessage: () => `Hello! I will help you to quickly apply and pay for the Covid test in ${region} airport. I’ll ask a few simple questions. Then I’ll send you a QR code. You should show it to our manager and in a minute, we’ll collect your test. As soon as the result is ready, we will send it to your e-mail.
PCR test ready in up to ${region === 'Boryspil' ? '6 hours - UAH 1500': region === 'Kharkiv'? '12 hours - UAH 1400' : '24 hours - UAH 1800'}
Express-test ready in 15 minutes - UAH 950`
            },
            [Lang.UK]: {
                greetingMessage: () => `Доброго дня! Я допоможу Вам швидко оформити й сплатити аналіз на Covid в аеропорту ${region}. Для цього я задам кілька простих запитань. Після цього Ви отримаєте QR код, покажете його нашому менеджеру і за хвилиту тест буде здано. Результат Ви отримаєте електронною поштою.
ПЦР тест з результатом до ${region === 'Бориспіль' ? '6 годин - 1500 грн': region === 'Харків'? '12 годин - 1400 грн' :'24 години - 1800 грн'}
Экспрес за 15 хвилин - 950 грн`
            },
            [Lang.RU]: {
                greetingMessage: () => `Здравствуйте! Я помогу Вам быстро оформить и оплатить анализ на Covid в аэропорту ${region}. Для этого я задам несколько простых вопросов. После этого Вы получите QR код, покажете его нашему менеджеру и через минуту тест будет сдан. Результат Вы получите на электронную почту.
ПЦР тест с результатом до ${region === 'Борисполь' ? '6 часов - 1500 грн': region === 'Харьков'? '12 часов - 1400 грн' : '24 часов - 1800 грн'}
Экспресс тест за 15 минут - 950 грн`
            }
        };
        return translations[lang].greetingMessage();
    }
}
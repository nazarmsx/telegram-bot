import "reflect-metadata";

import {container} from "tsyringe";
import {DBService, UserService, ExternalApiService} from "./services";
import {BotFlow} from "./bot-utils";
import {KyivBotFlow} from "./bot-utils";

container.register<UserService>(UserService, {useClass: UserService});
container.register<DBService>(DBService, {useClass: DBService});
container.register<BotFlow>(BotFlow, {useClass: BotFlow});
container.register<BotFlow>(KyivBotFlow, {useClass: BotFlow});
container.register<ExternalApiService>(ExternalApiService, {useClass: ExternalApiService});


export default container;
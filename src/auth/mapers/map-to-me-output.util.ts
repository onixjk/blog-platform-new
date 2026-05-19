import {WithId} from "mongodb";
import {User} from "../../modules/user/types/user";
import {MeOutput} from "../output/me-output";

export function mapToMeOutput(user: WithId<User>): MeOutput {
    return {
        login: user.login,
        email: user.email,
        userId: user._id.toString(),
    }
}
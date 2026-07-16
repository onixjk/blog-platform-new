import { User } from "../../types/user";
import { UserOutput } from "../../types/output/user-output";

export function mapToUserOutput(user: User & { _id: any }): UserOutput {
    return {
        id: user._id.toString(),
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
    }
}
import {userQueryRepository} from "../../modules/user/repositories/user.query.repository";
import {bcryptService} from "../adapters/bcrypt.service";

export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string,
    ): Promise<{ accessToken: string } | null> {
        const isCorrectCredentials = await this.checkUserCredentials(
            loginOrEmail,
            password,
        );

        if (!isCorrectCredentials) {
            return null;
        }

        return { accessToken: "token" };
    },

    async checkUserCredentials(
        loginOrEmail: string,
        password: string,
    ): Promise<boolean> {
        const user = await userQueryRepository.findByLoginOrEmail(loginOrEmail);
        if (!user) return false;

        return bcryptService.checkPassword(password, user.passwordHash);

    },
}
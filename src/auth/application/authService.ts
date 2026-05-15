import {bcryptService} from "../adapters/bcrypt.service";
import {usersService} from "../../modules/user/application/usersService";

export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string,
    ): Promise<{ accessToken: string } | null> {
        const isCorrectCredentials = await this.checkUserCredentials(loginOrEmail, password);

        if (!isCorrectCredentials) {
            return null;
        }

        return { accessToken: "token" };
    },

    async checkUserCredentials(
        loginOrEmail: string,
        password: string,
    ): Promise<boolean> {
        const user = await usersService.findByLoginOrEmail(loginOrEmail);
        if (!user) return false;

        return bcryptService.checkPassword(password, user.passwordHash);
    },
}
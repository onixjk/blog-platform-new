import {bcryptService} from "../adapters/bcrypt.service";
import {usersService} from "../../modules/user/application/usersService";
import {ResultStatus} from "../../core/result/resultCode";
import {IUserDB} from "../../modules/user/types/user.db.interface";
import {WithId} from "mongodb";
import {Result} from "../../core/result/result.type";
import {jwtService} from "../adapters/jwt.service";


export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string,
    ): Promise<Result<{ accessToken: string } | null>> {
        const result = await this.checkUserCredentials(loginOrEmail, password);

        if (result.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: "Unauthorized",
                extensions: [{field: loginOrEmail, message: "Wrong credentials"}]
            };
        }

        const accessToken = await jwtService.createToken(result.data!._id.toString());

        return {
            status: ResultStatus.Success,
            data: { accessToken },
            extensions: [],
        };
    },

    async checkUserCredentials(
        loginOrEmail: string,
        password: string,
    ): Promise<Result<WithId<IUserDB> | null>> {
        const user = await usersService.findByLoginOrEmail(loginOrEmail);

        if (!user)
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: "Not Found",
                extensions: [{field: loginOrEmail, message: "Not Found"}]
            };

        const isPassCorrect = await bcryptService.checkPassword(password, user.passwordHash);

        if (!isPassCorrect)
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad Request',
                extensions: [{field: 'password', message: 'Wrong password'}],
            };

        return {
            status: ResultStatus.Success,
            data: user,
            extensions: [],
        };
    },
}
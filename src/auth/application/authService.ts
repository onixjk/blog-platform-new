import {bcryptService} from "../adapters/bcrypt.service";
import {usersService} from "../../modules/user/application/usersService";
import {ResultStatus} from "../../core/result/resultCode";
import {IUserDB} from "../../modules/user/types/user.db.interface";
import {WithId} from "mongodb";
import {Result} from "../../core/result/result.type";
import {jwtService} from "../adapters/jwt.service";
import {nodemailerService} from "../adapters/nodemailer.service";
import {randomUUID} from "node:crypto";
import {emailExamples} from "../adapters/email-examples";
import {usersRepository} from "../../modules/user/repositories/user.repository";


export const authService = {
    async loginUser(
        loginOrEmail: string,
        password: string,
    ): Promise<Result<{ accessToken: string } | null>> {
        const result = await authService.checkUserCredentials(loginOrEmail, password);

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
            data: {accessToken},
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

    async registerUser(
        login: string,
        password: string,
        email: string
    ): Promise<Result<string | null>> {

        const user = await usersService.findByLoginOrEmail(login)

        if (user) {
            return {
                status: ResultStatus.BadRequest,
                errorMessage: 'Bad Request',
                data: null,
                extensions: [{field: 'loginOrEmail', message: 'Already Registered'}],
            }
        }

        const passwordHash = await bcryptService.generateHash(password);

        const newUser = {
            login: login,
            passwordHash: passwordHash,
            email: email,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                isConfirmed: false,
            }
        };

        const createdId = await usersRepository.create(newUser);

        try {
            await nodemailerService
                .sendEmail(
                    newUser.email,
                    newUser.emailConfirmation.confirmationCode,
                    emailExamples.registrationEmail
                )
        } catch (e) {
            console.error('error in send email:', e);
        }
        // nodemailerService
        //     .sendEmail(
        //         newUser.email,
        //         newUser.emailConfirmation.confirmationCode,
        //         emailExamples.registrationEmail
        //     )
        //     .catch(er => console.error('error in send email:', er));

        return {
            status: ResultStatus.NoContent,
            data: createdId,
            extensions: [],
        };
    }
}
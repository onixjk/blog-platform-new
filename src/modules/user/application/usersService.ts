import {WithId} from "mongodb";
import {UserQueryInput} from "../routers/input/user-query.input";
import {User} from "../types/user";
import {UserInputDto} from "../routers/input/user.input-dto";
import {usersRepository} from "../repositories/user.repository";
import {userQueryRepository} from "../repositories/user.query.repository";
import {IUserDB} from "../types/user.db.interface";
import {bcryptService} from "../../../auth/adapters/bcrypt.service";

export const usersService = {
    async findMany(
        queryDto: UserQueryInput
    ): Promise<{ items: WithId<User>[], totalCount: number }> {
        return userQueryRepository.findMany(queryDto);
    },

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        return userQueryRepository.findByIdOrFail(id);
    },

    async create(dto: UserInputDto): Promise<string> {

        const user = await userQueryRepository.findByLoginOrEmail(dto.login);

        if (user?.login === dto.login) {
            throw new Error("Login already exist");
        }

        if (user?.email === dto.email) {
            throw new Error("Email already exist");
        }

        const passwordHash = await bcryptService.generateHash(dto.password);

        const newUser: IUserDB = {
            login: dto.login,
            passwordHash: passwordHash,
            email: dto.email,
            createdAt: new Date().toISOString(),
        }

        return usersRepository.create(newUser);
    },

    async delete(id: string): Promise<void> {
        await usersRepository.delete(id);
        return;
    },
}
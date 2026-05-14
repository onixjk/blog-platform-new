import {WithId} from "mongodb";
import {UserQueryInput} from "../routers/input/user-query.input";
import {User} from "../types/user";
import {UserInputDto} from "../routers/input/user.input-dto";
import {usersRepository} from "../repositories/user.repository";
import {usersQueryRepository} from "../repositories/users.query.repository";
import {IUserDB} from "../types/user.db.interface";
import {bcryptService} from "../../../auth/adapters/bcrypt.service";
import {IPagination} from "../types/pagination";

export const usersService = {
    async findMany(
        queryDto: UserQueryInput
    ): Promise<IPagination<User[]>> {
        return usersQueryRepository.findMany(queryDto);
    },

    async findByIdOrFail(id: string): Promise<WithId<User>> {
        return usersRepository.findByIdOrFail(id);
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<IUserDB> | null> {
        return usersRepository.findByLoginOrEmail(loginOrEmail);
    },

    async create(dto: UserInputDto): Promise<string> {

        const userByLogin = await usersRepository.findByLoginOrEmail(dto.login);

        if (userByLogin?.login === dto.login) {
            throw new Error("Login already exist");
        }

        const userByEmail = await usersRepository.findByLoginOrEmail(dto.email);

        if (userByEmail?.email === dto.email) {
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
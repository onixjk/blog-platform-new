import bcrypt from 'bcrypt'

export const bcryptService = {
    async generateHash(password: string) {
        return await bcrypt.hash(password, 10);
    },

    async checkPassword(password: string, hash: string) {
        return bcrypt.compare(password, hash)
    }
}
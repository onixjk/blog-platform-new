import {config} from 'dotenv'

config()

export const appConfig = {

    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL as string,
    DB_NAME: process.env.DB_NAME as string,
    AC_SECRET: process.env.AC_SECRET as string || "default_test_secret_key",
    AC_TIME: process.env.AC_TIME as string || "300s",
    RT_SECRET: process.env.RT_SECRET || "default_test_secret_key",
    RT_TIME: process.env.RT_TIME as string || "600s",
    DB_TYPE: process.env.DB_TYPE,
    EMAIL: process.env.EMAIL as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,
}
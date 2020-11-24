import {config as configDotenv} from 'dotenv'
import {resolve} from 'path'

configDotenv({
    path: resolve(__dirname, "../../.env")
})

const throwIfNot = <T, K extends keyof T>(obj: Partial<T>, prop: K): T[K] => {
    if (!obj[prop]) {
        throw new Error(`Environment is missing variable ${prop}`)
    } else {
        return obj[prop] as T[K]
    }
};

['AUTH_TOKEN', 'USER_AGENT'].forEach(v => {
    throwIfNot(process.env, v)
});

export const GITHUB_USER = {
    auth: process.env.AUTH_TOKEN,
    userAgent: process.env.USER_AGENT
};
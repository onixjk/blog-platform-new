export type Session = {
    user_id: string;
    device_id: string;
    iat: Date;
    browserName: string;
    ip: string;
    exp: Date;
}
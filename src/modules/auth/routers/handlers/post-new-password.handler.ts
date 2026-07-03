import { Request, Response } from "express";
import { NewPasswordRecoveryInput } from "../../types/new-password-recovery.input";

export async function newPasswordHandler(
    req: Request<{}, {}, NewPasswordRecoveryInput>,
    res: Response,
) {


}
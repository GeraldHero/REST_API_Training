import express from "express";

import { getUserByEmail, createUser } from "../model/users";
import { random, authentication } from "../helpers";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) res.sendStatus(403);

    const user = await getUserByEmail(email).select(
      "+authentication.password +authentication.salt"
    );

    if (!user) res.sendStatus(403);

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) res.sendStatus(403);

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );
    await user.save();

    res.cookie(process.env.SECRET_KEY, user.authentication.sessionToken, {
      domain: "localhost",
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.sendStatus(400);
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.sendStatus(400);

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });
    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

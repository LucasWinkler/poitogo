import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/server/auth/auth";

export const { POST, GET } = toNextJsHandler(auth);

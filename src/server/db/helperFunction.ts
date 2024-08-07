import { randomUUID } from "crypto";

export function generateUuidWithPrefix(prefix: string){
    return `${prefix}${randomUUID()}`
}
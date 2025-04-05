import {serve} from "inngest/next";
import { inngest,SyncUserCreation,SyncUserUpdation,SyncUserDeletion ,createUserOrder} from "@/config/inngest";
export const{GET,POST,PUT} =serve({
    client:inngest,
    functions:[
        SyncUserCreation,SyncUserUpdation,SyncUserDeletion,createUserOrder
    ],
});
import { Inngest } from "inngest";
import { Contrail_One } from "next/font/google";
import connectDB from "./db";
import User from "@/models/user";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

export const SyncUserCreation = inngest.createFunction(
    
    {id: 'sync-user-from-clerk'},
    { event: 'clerk/user.created' },
    async ({event})=>{
       const {id,first_name,last_name,email_addresses,image_url}=event.data
       const userData ={_id:id,
        email:email_addresses[0].email_address,
        name:first_name+' '+last_name,
        image_url:image_url

       }
       await connectDB()
       await User.create(userData)
    }

)
export const SyncUserUpdation =inngest.createFunction(
  {id:'update-user-from-clerk'},
  {event:'clerk/user.update'},
 
    async ({event})=>{
       const {id,first_name,last_name,email_addresses,image_url}=event.data
       const userData ={_id:id,
        email:email_addresses[0].email_address,
        name:first_name+' '+last_name,
        image_url:image_url

       }
    
       await connectDB()
       await User.findByIdAndUpdate(id,userData)
  }
)

export const SyncUserDeletion = inngest.createFunction(
    {id:'delete-user-with-clerk'},
    {event:'clerk/user.deleted'},
    async({event})=>{
        const {id}=event.data
        await connectDB()
        await User.findByIdAndDelete(id)
    }
)


import { Inngest } from "inngest";
import { Contrail_One } from "next/font/google";
import connectDB from "./db";
import User from "@/models/User";
import { assets } from "@/assets/assets";
import Order from "@/models/Order";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "quickcart-next" });

// export const SyncUserCreation = inngest.createFunction(
    
//     {id: 'sync-user-from-clerk'},
//     { event: 'clerk/user.created' },
//     async ({event})=>{
//        const {id,first_name,last_name,email_addresses,image_url}=event.data
//        //console.log(event.data)
//        const userData ={_id:id,
//         email:email_addresses[0].email_address,
//         name:first_name+' '+last_name,
//         imageUrl:image_url

//        }
//        await connectDB()
//        await User.create(userData)
//     }

// )

export const SyncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
      try {
          console.log("📝 Event Data:", event.data); // Log incoming data

          const { id, first_name, last_name, email_addresses, image_url } = event.data;

          if (!id || !email_addresses || !email_addresses[0].email_address) {
              throw new Error("Missing required user data.");
          }

          const userData = {
              _id: id,
              email: email_addresses[0].email_address,
              name: `${first_name} ${last_name}`,
              imageUrl: image_url 
          };

          console.log("📥 User Data to Insert:", userData); // Log data before insertion

          await connectDB();
          const createdUser = await User.create(userData);

          console.log("✅ User Created Successfully:", createdUser); // Success log
      } catch (error) {
          console.error("❌ Error Creating User:", error.message);
      }
  }
);

export const SyncUserUpdation =inngest.createFunction(
  {id:'update-user-from-clerk'},
  {event:'clerk/user.update'},
 
    async ({event})=>{
       const {id,first_name,last_name,email_addresses,image_url}=event.data
       const userData ={_id:id,
        email:email_addresses[0].email_address,
        name:first_name+' '+last_name,
         imageUrl:image_url

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

// Inngest Function to create user's order in database
export const createUserOrder = inngest.createFunction(
    {
      id: 'create-user-order',
      batchEvents: {
        maxSize: 5,
        timeout: '5s',
      },
    },
    {event: '/order/created'},
    async ({ events }) => {
      const orders = events.map((event) => {
        return {
          userId: event.data.userId,
          items: event.data.items,
          amount: event.data.amount,
          address: event.data.address,
          date: event.data.date,
        };
      });
  
      await connectDB();
      await Order.insertMany(orders);
  
      return { success: true, processed: orders.length };
    }
  );


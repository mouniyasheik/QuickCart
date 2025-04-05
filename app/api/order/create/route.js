import { inngest } from '@/config/inngest';
import Product from '@/models/Product';
import User from '@/models/User';
import { getAuth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { address, items } = await request.json();

    if (!address || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid data' });
    }

    // Calculate the total amount
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product);
        if (!product) throw new Error(`Product with ID ${item.product} not found`);
        if (item.quantity <= 0) throw new Error(`Invalid quantity for product ID ${item.product}`);
        return product.offerPrice * item.quantity;
      })
    );

    const amount = products.reduce((acc, price) => acc + price, 0);
    const finalAmount = amount + Math.floor(amount * 0.02); // Adding 2% fee

    // Send event
    await inngest.send({
      name: 'order/created',
      data: {
        userId,
        address,
        items,
        amount: finalAmount,
        date: new Date().toISOString(),
      },
    });

    // Clear the user's cart
    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: 'Order Placed' });
  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

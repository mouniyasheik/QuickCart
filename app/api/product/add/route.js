import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice"); // Fixed here
    const files = formData.getAll("images");

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, message: "No files uploaded" }, { status: 400 });
    }

    const result = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(buffer);
        });
      })
    );

    const images = result.map((res) => res.secure_url);

    const product = new Product({
      userId,
      name,
      description,
      category,
      price,
      offerPrice,   // Fixed here
      images,
      date: new Date(),
    });

    await product.save(); // Use .save() instead of .create() for better error handling

    return NextResponse.json({ success: true, message: "Product added successfully", product }, { status: 201 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ success: false, message: error.message || "Server error" }, { status: 500 });
  }
}

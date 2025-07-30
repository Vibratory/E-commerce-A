import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";

// ✅ Reusable CORS header adder
function addCorsHeaders(res: NextResponse, req: NextRequest) {
  const origin = req.headers.get("origin");

  const allowedOrigins = [
    "https://boutika-brands.com",
    
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }

  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return res;
}

// ✅ Handle preflight
export const OPTIONS = async (req: NextRequest) => {
  const res = new NextResponse(null, { status: 204 });
  return addCorsHeaders(res, req);
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const {
      title,
      description,
      media,
      category,
      collections,
      stock,
      tags,
      sizes,
      colors,
      price,
      hidden,
      colorVariants,
      solde,
      newprice,
      brand
    } = await req.json();

    if (!title || !description || !media || !category || !price || !stock) {
      return new NextResponse("Not enough data to create a product", {
        status: 400,
      });
    }

    const newProduct = await Product.create({
      title,
      description,
      media,
      category,
      collections,
      stock,
      tags,
      sizes,
      colors,
      price,
      hidden,
      colorVariants,
      solde,
      newprice,
      brand
    });

    if (collections?.length) {
      await Promise.all(
        collections.map((collectionId: string) =>
          Collection.findByIdAndUpdate(
            collectionId,
            { $addToSet: { products: newProduct._id } }
          )
        )
      );
    }

    const res = NextResponse.json(newProduct, { status: 200 });
    return addCorsHeaders(res, req);
  } catch (err) {
    console.log("[products_POST]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const products = await Product.find()
      .sort({ createdAt: "desc" })
      .populate({ path: "collections", model: Collection });

    const res = NextResponse.json(products, { status: 200 });
    return addCorsHeaders(res, req);
  } catch (err) {
    console.log("[products_GET]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";

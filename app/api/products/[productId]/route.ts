import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs/server";
//import { Users } from "lucide-react";

import { NextRequest, NextResponse } from "next/server";
import User from "@/lib/models/User";

export const GET = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    await connectToDB();

    const product = await Product.findById(params.productId).populate({
      path: "collections",
      model: Collection,
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }
    return new NextResponse(JSON.stringify(product), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": `${process.env.ECOMMERCE_STORE_URL}`,
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (err) {
    console.log("[productId_GET]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

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


    if (!title || !description || !media || !category || !price) {
      return new NextResponse("Not enough data to create a new product", {
        status: 400,
      });
    }

  // Get the old and new collection IDs
    const oldCollectionIds = product.collections.map(String);
    const newCollectionIds = collections.map(String);

    const addedCollections = newCollectionIds.filter(
      (id:string) => !oldCollectionIds.includes(id)
    );

    const removedCollections = oldCollectionIds.filter(
      (id:string) => !newCollectionIds.includes(id)
    );

    // Add product to new collections
    await Promise.all(
      addedCollections.map((collectionId:string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $addToSet: { products: product._id },
        })
      )
    );

    // Remove product from old collections that no longer apply
    await Promise.all(
      removedCollections.map((collectionId:string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { products: product._id },
        })
      )
    );



    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      {
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

      },
      { new: true }
    ).populate({ path: "collections", model: Collection });




    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.log("[productId_POST]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse(
        JSON.stringify({ message: "Product not found" }),
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(product._id);

    // Update collections
    await Promise.all(
      product.collections.map((collectionId: string) =>
        Collection.findByIdAndUpdate(collectionId, {
          $pull: { products: product._id },
        })
      )
    );

    //update wishlist

    await User.updateMany(
      { wishlist: product._id },
      { $pull: { wishlist: product._id } }
    );

    return new NextResponse(JSON.stringify({ message: "Product deleted" }), {
      status: 200,
    });
  } catch (err) {
    console.log("[productId_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const PUT = async (req: NextRequest, { params }: { params: { productId: string } }) => {

  try {
    const userId = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });

    }
    await connectToDB();

    const product = await Product.findById(params.productId);

    if (!product) {
      return new NextResponse("Product not found", { status: 404 })
    }

    const body = await req.json();

    const updatedFields: Partial<typeof product> = {};
    if (body.hasOwnProperty("hidden")) updatedFields.hidden = body.hidden;

    const updatedProduct = await Product.findByIdAndUpdate(
      params.productId,
      updatedFields,
      { new: true }
    );



    return new NextResponse(JSON.stringify(params.productId), { status: 200 });

  } catch (err) {

    console.error("[productId_PUT]", err);
    return new NextResponse("Internal error", { status: 500 });

  }


}

export const dynamic = "force-dynamic";


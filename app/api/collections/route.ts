import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import Collection from "@/lib/models/Collection";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    await connectToDB()

    const { title, description, image } = await req.json()

    const existingCollection = await Collection.findOne({ title })

    if (existingCollection) {
      return new NextResponse("Collection already exists", { status: 400 })
    }

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 })
    }

    const newCollection = await Collection.create({
      title,
      description,
      image,
    })

    await newCollection.save()

    return NextResponse.json(newCollection, { status: 200 })
  } catch (err) {
    console.log("[collections_POST]", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB()

    const collections = await Collection.find().sort({ createdAt: "desc" })
    const response = NextResponse.json(collections, { status: 200 })

    response.headers.set("Access-Control-Allow-Origin", "*"); // or replace * with your domain
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return response
  } catch (err) {
    console.log("[collections_GET]", err)
    return new NextResponse("Internal Server Error", { status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }, })
  }
}

export const dynamic = "force-dynamic";

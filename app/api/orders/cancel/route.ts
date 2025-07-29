import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import mongoose from "mongoose";

export async function OPTIONS() {
    return NextResponse.json({}, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": `${process.env.ADMIN_DASHBOARD_URL}`, 
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}


export const POST = async (req: NextRequest) => {
    await connectToDB();

    try {
        const { orderId } = await req.json()

        console.log("OrderID", orderId)

        const result = await Order.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId) }, { $set: { status: "Canceled" } });

        return NextResponse.json(
            { success: true, result },
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": `${process.env.ADMIN_DASHBOARD_URL}`, 
                    "Content-Type": "application/json"
                },
            })

    } catch {
        return NextResponse.json('internarl server error', { status: 500 })

    }


}

import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import { connectToDB } from "@/lib/mongoDB";

import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const orders = await Order.find()
      .sort({ createdAt: "desc" })
      .populate("products.product");

    const orderDetails = await Promise.all(
      orders.map(async (order) => {

        const customer = await Customer.findOne({
          clerkId: order.customerClerkId,
        });

        return {
          _id: order._id,
          customer: customer?.name || "Unknown",
           name: order.shippingAddress.name ,
          products: order.products, // full product info now
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: format(order.createdAt, "MMM do, yyyy HH:mm:ss"),
         
        };
      })
    );

    return NextResponse.json(orderDetails, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";

import Order from "@/lib/models/Order";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/lib/models/Product";
import { ColorVariationsType, SizeVariationsType } from "@/lib/types";

export const POST = async (req: NextRequest) => {
    let result;
    await connectToDB();

    try {
        const { orderId, itemId, newQuantity, action, statuses, total, status } = await req.json();

        console.log("orderId", orderId, "itemId", itemId, "newQuantity", newQuantity, "action", action, "statuses", statuses, "total is ", total, "current stat", status);

        //update status in order table
        if (action == "status") {
            result = await Order.updateOne(

                { _id: new mongoose.Types.ObjectId(orderId) }, { $set: { status: statuses } }
            )
            if (statuses === "Confirmed") { //statuses = new stat
                //get all products and quantitis from order id and cycle thorugh each peoduct and modify his quantity

                const order = await Order.findById(orderId).populate("products.product");

                if (!order) throw new Error("Order not found");

                for (const item of order.products) {
                    const productTable = item.product; // product object
                    const orderQuantity = item.quantity; // quantity ordered of product 

                    console.log(item.quantity, item.color, item.size);

                    //find how much is in stock 
                    const color = productTable.colorVariants.find(
                        (color: ColorVariationsType) => color.name /*is from product table */ === item.color /*is from order table */);
                   
                    const size = color?.sizes.find(
                        (size: SizeVariationsType) => size.name/*is from product table */ === item.size /*is from order table */);

                    size.quantity -= orderQuantity;
                    
                    //make sure we dont go negative on stock
                    if (size.quantity < 0) {
                        size.quantity = 0;
                    }
                    await Product.findByIdAndUpdate(productTable._id, {
                        colorVariants: productTable.colorVariants, // push the new edited size quantity from memory to DB
                        updateAt: new Date()
                    });

                }
            }

            if (statuses === "Canceled" && status === "Confirmed") { //status = old stat
                //get all products and quantitis from order id and cycle thorugh each peoduct and modify his quantity

                const order = await Order.findById(orderId).populate("products.product");

                if (!order) throw new Error("Order not found");

                  for (const item of order.products) {
                    const productTable = item.product; // product object
                    const orderQuantity = item.quantity; // quantity ordered of product 

                    console.log(item.quantity, item.color, item.size);

                    //find how much is in stock 
                    const color = productTable.colorVariants.find(
                        (color: ColorVariationsType) => color.name /*is from product table */ === item.color /*is from order table */);
                   
                    const size = color?.sizes.find(
                        (size: SizeVariationsType) => size.name/*is from product table */ === item.size /*is from order table */);

                    size.quantity += orderQuantity;
                    
                    //make sure we dont go negative on stock
                    if (size.quantity < 0) {
                        size.quantity = 0;
                    }
                    await Product.findByIdAndUpdate(productTable._id, {
                        colorVariants: productTable.colorVariants, // push the new edited size quantity from memory to DB
                        updateAt: new Date()
                    });

                }
            }
            console.log("All product stocks updated.");





        } else if (itemId && newQuantity !== undefined) {

            //else update quantity in order table
            result = await Order.updateOne(
                { _id: new mongoose.Types.ObjectId(orderId), 'products._id': new mongoose.Types.ObjectId(itemId), },

                {
                    $set: {
                        'products.$.quantity': newQuantity,
                        totalAmount: total
                    }
                }

            )
        }


        console.log("UPDATE RESULT:", result);

        return NextResponse.json({ status: 200, result })

    } catch (err) {
        console.log('order id get error ', err)
        return NextResponse.json('in ternarl server error', { status: 500 })
    }
}
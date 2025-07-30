import { type NextRequest, NextResponse } from "next/server"
//import { stripe } from "@/lib/stripe"
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";
import axios from "axios";
import Product from "@/lib/models/Product";
import { OrderItemType } from "@/lib/types";




const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: NextRequest) {
  try {
    const { cartItems, customer, shipInfo, orderstatus } = await req.json()


    if (!cartItems || !shipInfo) {
      console.log("not enough data ")

      return NextResponse.json({ error: "Not enough data to checkout" }, { status: 400, headers: corsHeaders })
    }

    if (!cartItems.length) {

      return NextResponse.json({ error: "Cart is empty" }, { status: 400, headers: corsHeaders })
    }

    //getting price of product  from db 

    await connectToDB();

    let totalAmount = 0;

    for (const item of cartItems) {
      const DBproduct = await Product.findById(item.item._id);

      if (!DBproduct) {
        return NextResponse.json(
          { error: `product with id ${item.item._id} not found` },
          { status: 404, headers: corsHeaders }

        );
      }

      const itemTotal = DBproduct.price * item.quantity;
      totalAmount += itemTotal;

    }

    //adding order to database

    const newOrder = new Order({
      customerClerkId: customer.clerkId,
      products: cartItems.map((item: any) => ({
        product: item.item._id,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
      })),
      shippingAddress: shipInfo,
      shippingRate: "from delivery api", //yalidine api to get shipping price
      totalAmount,
      status: "New Order"

    })

    await newOrder.save()


    let user = await Customer.findOne({ clerkId: customer.clerkId })

    if (user) {
      user.orders.push(newOrder._id)
    } else {
      user = new Customer({
        ...customer,
        orders: [newOrder._id],
      })
    }

    await user.save()


    //telegram message notification  api

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID;

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const message = "Nouvelle commande";


    let text = `Message : ${message} \n\n`; // should include all details of order and time of order

    cartItems.forEach((item: any) => {
      console.log("item.product is ===============> ", item.item)
      text += `Produit: ${item.item.title}\n`
      text += `Quantity: ${item.quantity}\n`
      text += `Taille: ${item.size}\n`
      text += `Couleur: ${item.color}\n\n`
    })

    text += `Client\n`
    text += `Nom: ${shipInfo.name}\n`;
    text += `Numero: ${shipInfo.number}\n`;
    text += `Email: ${shipInfo.email}\n`;
    text += `Wilaya: ${shipInfo.state}\n`;
    text += `Ville: ${shipInfo.city}\n`;
    text += `Code Postal: ${shipInfo.zip}`;

    try {
      const response = await axios.post(telegramUrl, {
        chat_id,
        text,
      });

      if (response.data.ok) {

        return NextResponse.json(
          { redirectUrl: `${process.env.ECOMMERCE_STORE_URL}/payment_success?orderId=${newOrder._id}&name=${shipInfo.name}}`
 },
          { status: 200, headers: corsHeaders }
        );



      } else {

        return NextResponse.json({ error: "message failed to send" }, { headers: corsHeaders })
      }

    } catch (error) {

      console.error('error sending message to telegram', error)

      return NextResponse.json("error sending message", { headers: corsHeaders })

    }

    // stripe not applicable to algerian customer base

    /*const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["DZ", "CA"],
      },
      shipping_options: [
        { shipping_rate: "shr_1MfufhDgraNiyvtnDGef2uwK" },
        { shipping_rate: "shr_1OpHFHDgraNiyvtnOY4vDjuY" },
      ],
      line_items: cartItems.map((cartItem: any) => ({
        price_data: {
          currency: "dzd",
          product_data: {
            name: cartItem.item.title,
            metadata: {
              productId: cartItem.item._id,
              ...(cartItem.size && { size: cartItem.size }),
              ...(cartItem.color && { color: cartItem.color }),
            },
          },
          unit_amount: cartItem.item.price * 100,
        },
        quantity: cartItem.quantity,
      })),
      client_reference_id: customer.clerkId,
      success_url: `${process.env.ECOMMERCE_STORE_URL}/payment_success`,
      cancel_url: `${process.env.ECOMMERCE_STORE_URL}/cart`,
    })

    console.log("Stripe session created:", session.id)*/

  } catch (err) {
    console.error("[checkout_POST]", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500, headers: corsHeaders },
    )
  }
}

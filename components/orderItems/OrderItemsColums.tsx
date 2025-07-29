"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ColorVariationsType, SizeVariationsType, OrderItemType } from "@/lib/types"


// Quantity Cell Component to rerender quantity

export const QuantityCell = ({
  initialQuantity,
  itemId,
  itemPrice,
  orderId,
  total

}: {
  initialQuantity: number;
  itemId: string;
  itemPrice: number
  orderId: string;
  total: number;
}) => {

  let newTotal = total;

  const [quantity, setQuantity] = useState(initialQuantity)
  const [newQuantity, setNewQuantity] = useState<number>(initialQuantity)
  const [isLoading, setIsLoading] = useState(false)

  //updates quantity in DB after u click minus or plus 
  const updateQuantityInDB = async (newQuantity: number, newtotal: number) => {
    setIsLoading(true)
    try {
      await fetch(`/api/orders/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newQuantity,
          itemId,
          orderId,
          total: newtotal

        }),
      })
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setIsLoading(false)
    }
  }


  /*/when u click plus button
  const quantityIncrease = () => {

    const newQuantity = quantity + 1
    console.log("total", total, "itemPrice", itemPrice, "quantity", quantity, "newQuantity", newQuantity);

    total = total + (itemPrice * (newQuantity - initialQuantity))

    console.log("total after calculations", total)

    setQuantity(newQuantity)
    updateQuantityInDB(newQuantity)

  }
  //when u click minus button 
  const quantityDecrease = () => {
    if (quantity > 0) {
      // Prevent going below 1
      const newQuantity = quantity - 1
      console.log("total", total, "itemPrice", itemPrice, "quantity", quantity, "newQuantity", newQuantity);

      total = total - (itemPrice * (initialQuantity - newQuantity))

      setQuantity(newQuantity)
      updateQuantityInDB(newQuantity)

    }
  }*/


  //when u click enter on the quantity field
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {

      let calculatedTotal = newTotal;

      if (newQuantity > quantity) {
        calculatedTotal = calculatedTotal + (itemPrice * (newQuantity - quantity));
      } else {
        calculatedTotal = calculatedTotal - (itemPrice * (quantity - newQuantity))
      }


      //set new quantity asinitial cuz it doesnt refetch it again if u change it twice or more
      setQuantity(newQuantity)
      newTotal = calculatedTotal;
      updateQuantityInDB(newQuantity, calculatedTotal)

    }
  }

  return (
    <div className="flex gap-4 items-center">

      <input
        className={`hover:text-red-1 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        type="number"
        value={newQuantity}
        onChange={(e) => setNewQuantity(parseFloat(e.target.value))}
        placeholder={initialQuantity.toString()}
        onKeyDown={handleKeyPress}
      />

    </div>
  )
}

//products inside each specific order


export const columns: ColumnDef<OrderItemType>[] = [
  {
    accessorKey: "product",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original.product

      if (!product) {
        return <span className="text-gray-400 italic">Unknown Product</span>
      }

      return (
        <Link href={`/products/${row.original.product._id}`} className="hover:text-red-1">
          {row.original.product.title}
        </Link>
      )
    },
  },
  {
    accessorKey: "media",
    header: "Image",
    cell: ({ row }) => (
      <Image src={row.original.product.media[0] || "/placeholder.svg"} alt="product image" width={150} height={150} />
    ),
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <div>
        <QuantityCell
          initialQuantity={row.original.quantity}
          itemId={row.original._id}
          itemPrice={row.original.product.price}
          orderId={row.original.orderId}
          total={row.original.totalAmount}
        />

      </div>


    ),
  },
  {
    accessorKey: "stock",
    header: "In Stock",
    cell: ({ row }) => {
      //chack quantity from databse and alert user if item is out of stock befor confirming
      return (
        (() => {
          const variant = row.original.product.colorVariants.find(
            (variant: ColorVariationsType) => variant.name === row.original.color
          );

          const size = variant?.sizes.find(
            (size: SizeVariationsType) => size.name === row.original.size
          );

          // checks if quantity orderes is in stock or the order is more than what we have in stock
          if(size){if (size.quantity === 0) {

            return <p className="text-red-600">Epuise</p>


          } else if (size.quantity < row.original.quantity) {
            return <p className="text-red-600">Quantite demande depasse le stock</p>


          } else {
            return <p>Stock: {size.quantity}</p>
          }
        }

        })()
      )

    }
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (

      <p>
        {row.original.product.solde && row.original.product.newprice ?
          <p>{row.original.product.newprice * row.original.quantity}</p> :
          <p>{row.original.product.price * row.original.quantity}</p>
        } DA
      </p>
    )
  }
]

import { DataTable } from "@/components/custom ui/DataTable"
import { columns, QuantityCell } from "@/components/orderItems/OrderItemsColums"
import { UpdateStatus } from "@/components/orders/OrderUpdate"
import { formatDZD } from "@/lib/actions/actions"
import { Button } from "@radix-ui/themes"

const OrderDetails = async ({ params }: { params: { orderId: string } }) => {

  const res = await fetch(`${process.env.ADMIN_DASHBOARD_URL}/api/orders/${params.orderId}`)

  const { orderDetails } = await res.json()
  const { city, state, zip, number, name } = orderDetails.shippingAddress


  //addd update price in DB

  // get and show new total price of order in case admin updated quantity but db still same

  const totalPrice =  orderDetails.products.reduce((acc: number, orderItem:any) => {
                    const { price, newprice, solde } = orderItem.product;
                    const effectivePrice = solde && newprice ? newprice : price;
                    return acc + effectivePrice * orderItem.quantity;
                  }, 0);



  // Inject Order ID into products so i can update qauntity in the order table

  const productsWithOrderId = orderDetails.products.map((item: any) => ({
    ...item,
    orderId: orderDetails._id,
    ///totalAmount : totalPrice // silently attach it

  }));



  //Specific order page


  return (
    <div className="flex flex-col p-10 gap-5">
      <p className="text-base-bold">
        Order ID: <span className="text-base-medium">{orderDetails._id}</span>
      </p>
      <p className="text-base-bold">
        Customer name: <span className="text-base-medium">{name}</span>
      </p>
      <p className="text-base-bold">
        Phone Number: <span className="text-base-medium">{number}</span>
      </p>
      <p className="text-base-bold">
        Shipping address: <span className="text-base-medium">, {city}, {state}, {zip}</span>
      </p>

      <p className="text-base-bold">
        Shipping rate: <span className="text-base-medium">{orderDetails.shippingRate}</span>
      </p>
      <p className="text-base-bold  ">
        Total: <span className="text-green-600 text-base-medium">{formatDZD(totalPrice)}</span>
      </p>
      <p className="text-base-bold ">
        Status :
        {orderDetails.status === "Canceled" ?

          <span className="text-red-600 text-base-medium">  {orderDetails.status}</span>
          :
          <span className="text-green-600 text-base-medium">  {orderDetails.status}</span>
        }
      </p>

      <DataTable columns={columns} data={productsWithOrderId} searchKey="product" />

      <UpdateStatus
        orderId={orderDetails._id}
        status={orderDetails.status} />
    </div>
  )
}

export default OrderDetails
"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@radix-ui/themes"

export const UpdateStatus =  ({ orderId, status }: { orderId: string, status: string }) => {

    const [isLoading, setIsLoading] = useState(false)
    //const [status, setStatus] = useState("")


    const Update = async (statuses: string) => { //statuses = which button is clicked , status the current state of order
        setIsLoading(true)

        //Updating Status first
        try {

            await fetch("/api/orders/update", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    statuses,
                    action: "status",
                    status
                })


            })

            toast.success(`The order has been ${statuses} and stock updated`)

        } catch (error) {
            console.error('Failed to update status:', error)

        } finally {
            setIsLoading(false)

        }

    }

    return (
        <div className="flex justify-end gap-3 mt-4">

            {status !== "Confirmed" ?
                <Button
                    onClick={() => Update('Confirmed')}
                    className={`rounded-lg w-full sm:w-48 bg-green-600 text-white h-10 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    Confirm
                </Button>
                : ""}

            {status !== "Canceled" ?

                <Button
                    onClick={() => Update('Canceled')}
                    className={`rounded-lg w-full sm:w-48 bg-red-600 text-white h-10 cursor-pointer ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    Cancel
                </Button>
                : ""}

        </div>

    )




}
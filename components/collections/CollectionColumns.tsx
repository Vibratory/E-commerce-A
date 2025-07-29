"use client";

import { ColumnDef } from "@tanstack/react-table";
import Delete from "../custom ui/Delete";
import Link from "next/link";
import Image from "next/image";
import { CollectionType } from "@/lib/types";


export const columns: ColumnDef<CollectionType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/collections/${row.original._id}`}
        className="hover:text-red-1"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => <p>{row.original.products.length}</p>,
  },
  {
    accessorKey: "image",
    header: "Picture",
    cell: ({ row }) => (
      <Image
        width={150}
        height={150}
        sizes="(max-width: 768px) 100vw, 300px"
        style={{ objectFit: 'contain' }}
        alt="Product Image"
        src={row.original.image}>

      </Image>

    )

  },
  {
    id: "actions",
    cell: ({ row }) => <Delete item="collection" id={row.original._id} />,
  },
];

// components/ProductForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { boolean, z } from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/custom ui/ImageUpload";
import Delete from "@/components/custom ui/Delete";
import MultiText from "@/components/custom ui/MultiText";
import MultiSelect from "@/components/custom ui/MultiSelect";
import Loader from "@/components/custom ui/Loader";

import { ProductType, CollectionType } from "@/lib/types";
import ColorVariantItem from "./Variants";
import { useWatch } from "react-hook-form";


const formSchema = z.object({
  title: z.string().min(2).max(150),
  description: z.string().min(2).max(500),
  media: z.array(z.string()),
  category: z.string(),
  collections: z.array(z.string()),
  stock: z.coerce.number().min(0),
  tags: z.array(z.string()),

  colorVariants: z.array(
    z.object({
      name: z.string().min(1),
      sizes: z.array(
        z.object({
          name: z.string().min(1),
          quantity: z.coerce.number().min(0),
        })
      ),
    })
  ),

  sizes: z.array(z.string()),
  colors: z.array(z.string()),
  price: z.coerce.number(),
  solde: z.boolean(),
  newprice: z.coerce.number(),
  brand: z.string(),

});

interface ProductFormProps {
  initialData?: ProductType | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionType[]>([]);
  //const [checked, setLoading] = useState(true);


  const getCollections = async () => {
    try {
      const res = await fetch("/api/collections", { method: "GET" });
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      toast.error("Failed to load collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCollections();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
        ...initialData,
        collections: initialData.collections.map((c) => c._id),
      }
      : {
        title: "",
        description: "",
        media: [],
        category: "",
        collections: [],
        stock: 1,
        tags: [],
        colorVariants: [
          {
            name: "",
            sizes: [{ name: "", quantity: 0 }],
          },
        ],
        sizes: [],
        colors: [],
        price: 100,
        solde: false,
        newprice: 0,
        brand:"",
      },
  });

  const { control, register, handleSubmit } = form;

  const {
    fields: colorFields,
    append: addColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: "colorVariants",
  });

  //show new price only when sale is checked
  const solde = useWatch({
    control,
    name: "solde",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/products/${initialData._id}`
        : "/api/products";

      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success(`Product ${initialData ? "updated" : "created"}`);
        router.push("/products");
      } else {
        toast.error("Failed to save product.");
      }
    } catch (err) {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-10">
      {initialData ? (
        <div className="flex items-center justify-between">
          <p className="text-heading2-bold">Edit Product</p>
          <Delete id={initialData._id} item="product" />
        </div>
      ) : (
        <p className="text-heading2-bold">Create Product</p>
      )}

      <Separator className="bg-grey-1 mt-4 mb-7" />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Product title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="media"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => field.onChange([...field.value, url])}
                    onRemove={(url) =>
                      field.onChange(field.value.filter((img) => img !== url))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (DA)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="solde"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="solde"
                      className="w-5 h-5 cursor-pointer"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="solde" className="cursor-pointer">
                    Solde ?
                  </FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />


            {solde && (
              <FormField
                control={control}
                name="newprice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau prix</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="In stock" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-2 w-full">

            <FormField
              control={control}
              name="tags"
              render={({ field }) => (
                <FormItem className="w-full"
                >
                  <FormLabel>Tags</FormLabel>
                  <FormControl >
                    <MultiText
                      placeholder="Enter tags"
                      value={field.value}
                      onChange={(tag) => field.onChange([...field.value, tag])}
                      onRemove={(tagToRemove) =>
                        field.onChange(field.value.filter((tag) => tag !== tagToRemove))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {collections.length > 0 && (
              <FormField
                control={control}
                name="collections"
                render={({ field }) => (
                  <FormItem className="w-full"
                  >
                    <FormLabel>Collections</FormLabel>
                    <FormControl>
                      <MultiSelect
                        placeholder="Select collections"
                        value={field.value}
                        onChange={(id) => field.onChange([...field.value, id])}
                        onRemove={(idToRemove) =>
                          field.onChange(field.value.filter((id) => id !== idToRemove))
                        }
                        collections={collections}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

             <FormField
             
            control={control}
            name="brand"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Marque</FormLabel>
                <FormControl>
                  <Input  placeholder="Marque" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          </div>
          <div className="space-y-4">
            <p className="text-lg font-medium">Color Variants</p>
            {colorFields.map((_, index) => (
              <ColorVariantItem
                key={index}
                index={index}
                control={control}
                register={register}
                removeColor={() => removeColor(index)}
              />
            ))}
            <Button
              type="button"
              onClick={() => addColor({ name: "", sizes: [{ name: "", quantity: 0 }] })}
            >
              + Add Color
            </Button>
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="bg-blue-600 text-white">
              Submit
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/products")}
            >
              Discard
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
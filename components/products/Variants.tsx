// components/ColorVariantItem.tsx
import { useFieldArray, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FaTrash } from 'react-icons/fa';

import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ColorVariantItemProps {
  index: number;
  control: any;
  register: any;
  removeColor: () => void;
}

const ColorVariantItem: React.FC<ColorVariantItemProps> = ({
  index,
  control,
  register,
  removeColor,
}) => {
  const { fields: sizeFields, append: addSize, remove: removeSize } =
    useFieldArray({
      control,
      name: `colorVariants.${index}.sizes`,
    });

  return (
    <div className="border p-4 rounded space-y-4">
      <FormField
        control={control}
        name={`colorVariants.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color Name</FormLabel>
            <FormControl>
              <Input placeholder="Color name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <div className="flex gap-2">
          <Label className="w-1/3">Size</Label>
          <Label className="w-1/3">Quantity</Label>
          <div className="w-1/3" /> {/* Empty space for Remove button */}
        </div>

        {sizeFields.map((size, sizeIndex) => (
          <div key={size.id} className="flex gap-2">
            <Input
              placeholder="Size"
              className="w-1/3"
              {...register(`colorVariants.${index}.sizes.${sizeIndex}.name`)}
            />
            <Input
              type="number"
              placeholder="Quantity"
              className="w-1/3"
              {...register(`colorVariants.${index}.sizes.${sizeIndex}.quantity`, {
                valueAsNumber: true,
              })}
            />
            <FaTrash
              type="button"
              className="w-1/6 h-7 text-red-600 rounded"
              size={10}
              onClick={() => removeSize(sizeIndex)}
            >
            </FaTrash>
          </div>
        ))}
      </div>



      <Button
        className="bg-blue-600 text-white"
        type="button"
        variant="outline"
        onClick={() => addSize({ name: "", quantity: 0 })}
      >
        + Add Size
      </Button>

      <Button
        className="bg-red-600 text-white"
        type="button"
        onClick={removeColor}
      >
        Remove Color
      </Button>
    </div>
  );
};

export default ColorVariantItem;

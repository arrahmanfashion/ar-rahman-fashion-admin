/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCategoryMutation,
  useEditCategoryMutation,
} from "@/redux/featured/categories/categoryApi";
import { useForm, FormProvider } from "react-hook-form";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { FileWithPreview, useFileUpload } from "@/hooks/use-file-upload";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export type Option = {
  value: string;
  label: string;
  disable?: boolean;
};

type CategoryFormValues = {
  name: string;
  details: string;
};

type SubCategory = {
  _id: string;
  name: string;
};
export default function Category({
  children,
  type,
  editCategory,
  refetch,
}: {
  children?: React.ReactNode;
  type?: string;
  editCategory?: any;
  refetch?: any;
}) {
  const [createCategory, { isLoading, isSuccess }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: EditLoading }] =
    useEditCategoryMutation();
  const [bannerImg, setBannerImg] = useState<FileWithPreview | null>(null);
  const [open, setOpen] = useState(false);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const methods = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      details: "",
    },
  });

  const { handleSubmit, register, setValue, watch, reset } = methods;

  useEffect(() => {
    if (editCategory) {
      reset({
        name: editCategory.name || "",
        details: editCategory.details || "",
      });
    }
  }, [editCategory, reset]);

  useEffect(() => {
    if (!editCategory) return;

    if (bannerImg && editCategory.bannerImg) {
      setDeletedImages([editCategory.bannerImg]);
    }
  }, [bannerImg, editCategory]);



  const onSubmit = async (data: CategoryFormValues) => {
    const submitToast = toast.loading(
      type === "edit" ? "Updating Category..." : "Creating Category..."
    );

    try {
      const formData = new FormData();
      const payload = {
        name: data.name,
        details: data.details,
        ...(type === "edit" && editCategory && { deletedImages: deletedImages || "" }),
      };

      // 🔹 Append payload JSON
      formData.append("data", JSON.stringify(payload));

      // 🔹 Handle banner image upload
      if (bannerImg?.file) {
        formData.append("bannerImg", bannerImg.file as File);
      }

      // 🔹 Submit request
      if (type === "edit" && editCategory?._id) {
        await updateCategory({
          id: editCategory._id,
          updateDetails: formData,
        }).unwrap();
        toast.success("Category updated successfully!", { id: submitToast });
      } else {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully!", { id: submitToast });
      }

      // 🔹 Reset states
      setOpen(false);
      reset();
      refetch();
      setBannerImg(null);
    } catch (error: any) {
      const errorMessage =
        error?.data?.errorSources?.[0]?.message ||
        error?.data?.message ||
        error?.message ||
        "Something went wrong!";
      toast.error(errorMessage, { id: submitToast });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{children}</Button>
      </DialogTrigger>
      <DialogContent className="flex  flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b px-6 py-4 text-base">
            {type === "edit" ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Add new category details here.
        </DialogDescription>

        <div className="overflow-y-auto">
          <div className="px-6 pt-4 pb-6 ">
            <div className="max-h-[300px]">
              <BannerImage
                setBannerImg={setBannerImg}
                editCategory={editCategory}
              />
              <FormProvider {...methods}>
                <form
                  id="add-category"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1 space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        placeholder="Category Name"
                        {...register("name", { required: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Details</Label>
                    <Textarea
                      placeholder="Category Details"
                      {...register("details", { required: true })}
                    />
                  </div>








                </form>
              </FormProvider>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t px-6 py-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button form="add-category" type="submit">
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// UPDATED BannerImage Component
function BannerImage({
  setBannerImg,
  editCategory,
}: {
  setBannerImg: React.Dispatch<React.SetStateAction<FileWithPreview | null>>;
  editCategory?: any;
}) {
  const [{ files, errors }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      accept: "image/*",
      maxSize: 5 * 1024 * 1024, // 5MB limit
      initialFiles: [],
    });

  // Show error toast for file upload issues
  useEffect(() => {
    if (errors.length > 0) {
      toast.error(errors[0]);
    }
  }, [errors]);

  useEffect(() => {
    if (files && files.length > 0) {
      setBannerImg(files[0]);
    } else {
      setBannerImg(null);
    }
  }, [files, setBannerImg]);

  const currentImage = files[0]?.preview || null;

  const imageUrl =
    currentImage ||
    editCategory?.bannerImg ||
    "https://via.placeholder.com/400x200?text=Banner+Image";

  return (
    <div className="space-y-2 mb-4">
      <Label>Banner Image</Label>
      <div className="relative w-full h-48 flex items-center justify-center overflow-hidden rounded-md bg-muted cursor-pointer border-2 border-dashed border-gray-300">
        <Image
          src={imageUrl}
          alt="Category banner"
          className="object-cover w-full h-full"
          width={400}
          height={200}
        />
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 transition">
          <button
            type="button"
            onClick={openFileDialog}
            className="rounded-full bg-white/80 p-2 hover:bg-white"
          >
            <ImagePlusIcon size={20} className="text-black" />
          </button>
          {currentImage && (
            <button
              type="button"
              onClick={() => removeFile(files[0]?.id)}
              className="rounded-full bg-white/80 p-2 hover:bg-white"
            >
              <XIcon size={20} className="text-black" />
            </button>
          )}
        </div>
        <input {...getInputProps()} className="sr-only" />
      </div>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/hide-scroll.css";
import { UserService } from "@/services/user";
import { UploadService } from "@/services/upload";

export function ModalUpdateProfile({ data }: { data: any }) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);

  const validateForm = () => {
    if (name === "" || email === "") {
      toast({
        variant: "destructive",
        title: "Vui lòng điền đầy đủ thông tin",
      });
      return false;
    } else {
      return true;
    }
  };

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn file hình ảnh",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const uploadMainImage: any = await UploadService.uploadToCloudinary([
      mainPreview,
    ]);

    const body = {
      user_name: name,
      email: email,
      avatar: uploadMainImage?.[0]?.secure_url || data?.avatar,
    };
    await UserService.updateUser(data?._id, body);
    setIsLoading(false);

    window.location.href = "/profile";
  };

  const updateDOM = () => {
    if (data) {
      setName(data?.user_name || "");
      setEmail(data?.email || "");
      setMainPreview(data?.avatar || null);
    }
  };

  useEffect(() => {}, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={updateDOM}>
        <button>
          <div className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Chỉnh sửa thông tin
          </div>
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chỉnh sửa thông tin</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chỉnh sửa thông tin thông tin và nhấn{" "}
              <strong className="text-orange-500">Cập nhật</strong> để lưu thông
              tin.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[90vh]">
          <div className="mb-6">
            <Label htmlFor="thumbnail" className="text-right !text-[16px]">
              Ảnh đại diện
            </Label>
            <div className="mt-2">
              {!mainPreview && (
                <div
                  onClick={handleUpdateMainImage}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <span>+ Tải hình lên</span>
                    <span className="text-xs text-gray-500">
                      hoặc kéo thả file vào đây
                    </span>
                  </div>
                </div>
              )}
              <input
                type="file"
                ref={mainImageInputRef}
                onChange={handleMainImageChange}
                accept="image/*"
                className="hidden"
              />
              {mainPreview && (
                <div className="mt-2">
                  <Image
                    src={mainPreview}
                    alt="main-preview"
                    className="w-full h-80 object-cover rounded-md mt-2"
                    width={1000}
                    height={1000}
                  />
                  <div
                    onClick={handleUpdateMainImage}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-5 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-500">
                        Thay đổi hình ảnh
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-2 overflow-auto scroll-bar-style">
            <Label htmlFor="description" className="text-[16px]">
              Tên học viên
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên học viên"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="description" className="text-[16px]">
              Email học viên
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email học viên"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
          </div>
        </div>
        <DialogFooter className="w-full !flex !flex-row !justify-between !items-center">
          <div className=""></div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px]"
              >
                Huỷ
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="!px-10 !text-[16px] !bg-orange-500 hover:!bg-orange-600 !text-white"
            >
              Cập nhật
              {isLoading && <Loader className="animate-spin" size={48} />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

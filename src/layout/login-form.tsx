"use client";

import { toast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { IMAGES } from "@/utils/images";
import Cookies from "js-cookie";
import { UserService } from "@/services/user";
import { usePathname } from "next/navigation";
import { Loader } from "lucide-react";
import "@/styles/login-form.css";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { API } from "@/utils/api";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logined, setLogined] = useState(false);
  const pathname = usePathname();
  // const [selectedOption, setSelectedOption] = useState(1);

  // const handleSubmitWithGoogle = async (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   window.location.href = API.LOGIN_WITH_GOOGLE;
  // };

  const validateForm = () => {
    if (email === "" || password === "") {
      toast({
        variant: "destructive",
        title: "Vui lòng điền đầy đủ thông tin",
      });
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const data = await UserService.loginUserEmail(email, password);

      if (data?.message === "SUCCESS") {
        Cookies.set("isLogin", data?.data._id, { expires: 7 });
        Cookies.set("userLogin", data?.data._id, { expires: 7 });
        setLogined(true);
        window.location.href = pathname;
      } else {
        throw new Error("Email hoặc mật khẩu chưa chính xác");
      }
    } catch (error) {
      console.error("========= Error Login:", error);
      toast({
        variant: "destructive",
        title: "Email hoặc mật khẩu chưa chính xác",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex items-center gap-3">
          <Button className="flex text-[14px] lg:text-[16px] bg-[rgb(var(--secondary-rgb))] text-white rounded-full px-6 hover:opacity-80 hover:bg-[rgb(var(--secondary-rgb))]">
            Đăng nhập
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="w-full flex flex-col">
            <div className="mb-1">
              <div className="flex justify-start items-center gap-4">
                <h1 className="text-2xl font-bold">Đăng nhập</h1>
              </div>
            </div>
            <div className="mt-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[16px] font-medium flex items-center">
                    Email <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    id="email"
                    type="text"
                    placeholder="Nhập email hoặc số điện thoại"
                    className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ fontSize: "16px" }}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-[16px] font-medium flex items-center"
                  >
                    Mật khẩu <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu"
                      className="w-full p-3 rounded-md border pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ fontSize: "16px" }}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-center items-center gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full text-[16px] py-6 bg-orange-500 hover:bg-orange-500 hover:opacity-85 text-white rounded-md"
                  >
                    {isLoading ? (
                      <>
                        Vui lòng đợi{" "}
                        <Loader className="animate-spin ml-2" size={20} />
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </Button>
                  {/* <Button
                    onClick={handleSubmitWithGoogle}
                    className="w-16 text-[14px] py-6 bg-gray-100 hover:bg-gray-200 text-white rounded-md"
                  >
                    <Image
                      src={IMAGES.GG_LOGO}
                      alt="Google Login"
                      className="w-full h-auto rounded-full"
                      width={1000}
                      height={0}
                    />
                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginForm;

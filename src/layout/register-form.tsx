"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { API } from "@/utils/api";

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      toast({ variant: "destructive", title: "Vui lòng điền đầy đủ thông tin" });
      return false;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Mật khẩu xác nhận không khớp" });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(API.REGISTER, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data?.message === "SUCCESS") {
        toast({ title: "Đăng ký thành công!", variant: "default" });
        window.location.reload();
      } else {
        toast({ title: data?.message || "Đăng ký thất bại!", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Lỗi hệ thống!", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-600 text-white rounded-full px-6 hover:opacity-80">Đăng ký</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="w-full flex flex-col gap-4">
          <h1 className="text-2xl font-bold mb-2">Đăng ký tài khoản</h1>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            className="w-full p-3 rounded-md border focus:outline-none focus:ring-2 focus:ring-green-500"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <Button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full text-[16px] py-6 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            {isLoading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterForm;

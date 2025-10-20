"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  House,
  BookOpenText,
  Headphones,
  SquarePen,
  BookCheck,
  UserRound,
  LogOut,
} from "lucide-react";
import { IMAGES } from "@/utils/images";
import { usePathname } from "next/navigation";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import Cookies from "js-cookie";
import { ROUTES } from "@/utils/routes";
import { UserService } from "@/services/user";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

interface UserAccount {
  _id: string;
  user_name: string;
  avatar: string;
  email: string;
  password: string;
  created_at: string;
}

const Header = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [logined, setLogined] = useState<boolean | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      const isLogin = Cookies.get("isLogin");
      if (isLogin) {
        try {
          const data = await UserService.getUserById(isLogin);
          if (data) {
            setUserAccount(data);
            setLogined(true);
          } else {
            setLogined(false);
            Cookies.remove("isLogin");
            Cookies.remove("userLogin");
          }
        } catch (error) {
          console.error("Error fetching account:", error);
          setLogined(false);
          Cookies.remove("isLogin");
          Cookies.remove("userLogin");
        }
      } else {
        setLogined(false);
      }
    };

    checkLogin();
  }, []);

  const navigationItems = [
    {
      label: "Reading Test",
      href: ROUTES.READING_HOME || "/",
      icon: BookOpenText,
    },
    { label: "Listening Test", href: ROUTES.LISTENING_HOME, icon: Headphones },
    { label: "Writing Test", href: ROUTES.WRITING_HOME, icon: SquarePen },
    { label: "Full IELTS Test", href: ROUTES.FULLTEST_HOME, icon: BookCheck },
  ];

  const isActive = (item: any) => {
    if (item.label === "Reading Test") {
      return pathname === "/" || pathname === "/reading";
    }
    return item.href === pathname;
  };

  const handleLogOut = () => {
    Cookies.remove("isLogin");
    Cookies.remove("userLogin");
    setLogined(false);
    setUserAccount(null);
    window.location.href = ROUTES.HOME;
  };

  if (logined === null) {
    return <div className="h-20"></div>;
  }

  return (
    <header className="w-full flex justify-center items-center border-b">
      <div className="w-full lg:w-3/4 px-4 lg:px-0">
        <div className="flex items-center justify-between h-24">
          <div className="flex lg:hidden flex-col justify-center">
            <button
              className="text-gray-500 w-10 h-10 relative focus:outline-none"
              onClick={() => setOpen(!open)}
            >
              <span className="sr-only">Open main menu</span>
              <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span
                  aria-hidden="true"
                  className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                    open ? "rotate-45 translate-y-0" : "-translate-y-1.5"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`block absolute h-0.5 w-5 bg-current transform transition duration-300 ease-in-out ${
                    open ? "-rotate-45 translate-y-0" : "translate-y-1.5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
          <Link href={"https://tn-7-edu.vercel.app/"} className="flex items-center gap-2">
            <Image
              src={IMAGES.LOGO}
              alt="Logo"
              className="w-full h-8 lg:h-12 object-contain"
              width={1000}
              height={0}
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-8">
            {navigationItems.map((item) => (
              <div key={item.label} className="relative group">
                <Link
                  href={item.href}
                  className={`text-[14px] font-medium transition-colors duration-200 uppercase ${
                    isActive(item)
                      ? "text-[rgb(var(--secondary-rgb))] font-semibold"
                      : "text-gray-500"
                  } group-hover:text-[rgb(var(--secondary-rgb))] group-hover:font-semibold`}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 mb-1">Tư vấn liên hệ Zalo</span>
              <a
                href="tel:0763771191"
                className="flex items-center text-gray-600 hover:text-[rgb(var(--secondary-rgb))] transition-colors duration-200"
              >
                <Image
                  src="https://res.cloudinary.com/farmcode/image/upload/v1748364890/ielts-test/zalo_q3w1pc.png"
                  alt="Zalo"
                  width={16}
                  height={16}
                  className="inline-block"
                />
                <span className="ml-1">0763.771.191</span>
              </a>
            </div>
          </div>
          {logined ? (
            <>
              <div className="flex justify-center lg:hidden w-12 h-12">
                <Image
                  src={userAccount?.avatar || ""}
                  alt="Avatar"
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover rounded-full cursor-pointer"
                />
              </div>
              <div className="hidden lg:flex mr-4 lg:mr-0">
                <Dropdown>
                  <DropdownTrigger>
                    <Image
                      src={userAccount?.avatar || ""}
                      alt="Avatar"
                      width={1000}
                      height={1000}
                      className="w-11 h-11 object-cover rounded-full cursor-pointer"
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    className="bg-white rounded-md border border-gray-200"
                    aria-label="Static Actions"
                  >
                    <DropdownItem
                      className="px-3 py-2.5 text-left text-md hover:bg-gray-200 rounded-md"
                      key="Quản lí hồ sơ"
                    >
                      <a
                        href={`${ROUTES.USER_PROFILE}`}
                        className="flex items-center justify-start gap-4 text-gray-700 hover:text-black"
                      >
                        <UserRound size={18} /> Quản lí hồ sơ
                      </a>
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      className="text-[rgb(var(--primary-rgb))] hover:text-white hover:bg-[rgb(var(--primary-rgb))] font-medium rounded-lg text-md px-3 py-2.5 text-left"
                    >
                      <button
                        onClick={handleLogOut}
                        className="flex items-center justify-start gap-2 hover:text-white"
                      >
                        <LogOut size={18} /> Đăng xuất
                      </button>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* <LoginForm />
              <RegisterForm /> */}
            </div>
          )}
        </div>
      </div>
      {open && (
        <div className="absolute top-24 left-0 bottom-0 w-full bg-white shadow-md border-t border-gray-200 z-20">
          <ul className="flex flex-col space-y-10 py-10 px-5">
            <li className="font-bold flex flex-row items-center gap-3">
              <House size={20} />
              <a
                href={ROUTES.HOME}
                className={`text-gray-700 hover:text-[rgb(var(--secondary-rgb))] transition-colors duration-200 ${
                  pathname === ROUTES.HOME
                    ? "text-[rgb(var(--secondary-rgb))] font-semibold"
                    : ""
                }`}
              >
                Trang chủ
              </a>
            </li>
            {navigationItems.map((item) => (
              <li
                key={item.label}
                className="font-bold flex flex-row items-center gap-3"
              >
                <item.icon size={20} />
                <a
                  href={item.href}
                  className={`text-gray-700 hover:text-[rgb(var(--secondary-rgb))] transition-colors duration-200 ${
                    isActive(item)
                      ? "text-[rgb(var(--secondary-rgb))] font-semibold"
                      : ""
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
            {logined && (
              <li className="font-bold flex flex-row items-center text-[rgb(var(--primary-rgb))] gap-3">
                <button
                  onClick={handleLogOut}
                  className="flex items-center justify-start gap-4 hover:text-white"
                >
                  <LogOut size={18} /> Đăng xuất
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;

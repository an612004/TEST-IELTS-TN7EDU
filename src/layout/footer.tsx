import React, { ReactNode } from 'react';
import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { ROUTES } from '@/utils/routes';

// Tạo interface tạm thời để tránh lỗi
interface IAppConfig {
  contact: {
    phone: string;
    email: string;
  };
  footer: {
    links: Array<{
      name: string;
      url: string;
    }>;
  };
  seo: {
    site_name: string;
  };
}

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
  config?: IAppConfig; // Optional để tránh lỗi khi không truyền
};

const Footer = (props: IMainProps) => {
  // Default config nếu không được truyền vào
  const defaultConfig: IAppConfig = {
    contact: {
      phone: "0939.217.718",
      email: "thayhauieltsct@gmail.com"
    },
    footer: {
      links: [
        { name: "Trang Chủ", url: ROUTES.HOME },
        { name: "Reading Test", url: ROUTES.READING_HOME },
        { name: "Listening Test", url: ROUTES.LISTENING_HOME },
        { name: "Writing Test", url: ROUTES.WRITING_HOME },
      ]
    },
    seo: {
      site_name: "IELTS VIET"
    }
  };

  const config = props.config || defaultConfig;

  return (
    <div className="antialiased w-full relative">
      <style jsx global>{`
        .footer-gradient {
          background: linear-gradient(
            135deg,
            #1e293b 0%,
            #334155 50%,
            #475569 100%
          );
        }

        .footer-link {
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          padding: 0.25rem 0;
        }

        .footer-link:hover {
          color: #60a5fa;
          transform: translateX(4px);
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          transform: translateX(4px);
        }

        .gradient-text {
          background: linear-gradient(
            135deg,
            #60a5fa 0%,
            #3b82f6 50%,
            #1d4ed8 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <div className="w-full text-gray-700 px-3 md:px-0">
        {props.meta}
        <div className="mx-auto">
          <div className="text-xl">{props.children}</div>
        </div>
      </div>

      {/* IELTS Viet Footer */}
      <footer className="w-full bg-[#1f1f2e] text-white flex flex-col justify-center items-center px-6 lg:px-0">
        <div className="w-full lg:w-3/4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold gradient-text">TN7 EDU</span>
              </div>
              <p className="text-gray-400">
                Trở thành đối tác chiến lược hàng đầu tại Việt Nam về giáo dục quốc tế,
                phát triển nguồn nhân lực và di trú toàn cầu – mang theo khát vọng vươn ra thế giới của người Việt Nam,
                đồng thời mang kiến ​​thức và cơ hội toàn cầu trở về để nâng tầm thế hệ trẻ Việt Nam.
              </p>
              <div className="flex gap-4">
                <a
                  target="_blank"
                  href="https://www.facebook.com/tn7education"
                  className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                  rel="noopener noreferrer"
                >
                  <Facebook size={20} />
                </a>
                
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:pl-16">
              <h3 className="text-xl font-semibold mb-6 gradient-text">Truy Cập Nhanh</h3>
              <ul className="space-y-4">
                {config.footer.links.map(({ name, url }) => (
                  <li key={name}>
                    <Link
                      href={url}
                      className="text-gray-400 hover:text-white transition-colors footer-link"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold mb-6 gradient-text">Liên Hệ</h3>
              <ul className="space-y-4">
                <li className="contact-item">
                  <Mail size={20} className="text-blue-400 mr-3 mt-1" />
                  <span className="text-gray-400">Contact@tn7.vn</span>
                </li>
                <li className="contact-item">
                  <Phone size={20} className="text-blue-400 mr-3 mt-1" />
                  <span className="text-gray-400">0763.771.191</span>
                </li>
                <li className="contact-item">
                  <MapPin size={20} className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">
                    Cơ sở : Tầng 8, số 19 Cao Thắng,
Phường Bàn Cờ, TP. Hồ Chí Minh
                  </span>
                </li>
                {/* <li className="contact-item">
                  <MapPin size={20} className="text-blue-400 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">
                    Cơ sở 2: 20 Đường số 43,
Phường Bình Thuận, TP.HCM
                  </span>
                </li> */}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="w-full border-t border-gray-800 flex justify-center items-center">
          <div className="w-full lg:w-3/4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">
                © {new Date().getFullYear()} TN7EDU. All rights reserved.
              </p>
              <div className="hidden lg:flex gap-6 text-center">
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { Footer as Main };
export default Footer;

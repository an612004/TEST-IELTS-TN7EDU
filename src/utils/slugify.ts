import slugify from "slugify";

export function slugifyURL(text: string) {
  if (!text) return "";

  text = text
    .replace(/ơ/g, "o")
    .replace(/ư/g, "u")
    .replace(/á|à|ả|ã|ạ/g, "a")
    .replace(/ấ|ầ|ẩ|ẫ|ậ/g, "a")
    .replace(/ă/g, "a")
    .replace(/é|è|ẻ|ẽ|ẹ/g, "e")
    .replace(/ê/g, "e")
    .replace(/í|ì|ỉ|ĩ|ị/g, "i")
    .replace(/ó|ò|ỏ|õ|ọ/g, "o")
    .replace(/ô|ố|ồ|ổ|ỗ|ộ/g, "o")
    .replace(/ơ/g, "o")
    .replace(/ú|ù|ủ|ũ|ụ/g, "u")
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/g, "y")
    .replace(/đ/g, "d")
    .replace(/[^A-Za-z0-9\s\u00C0-\u00FF\u0100-\u017F\u1EA0-\u1EF9]/g, "-");

  text = slugify(text, {
    replacement: "-",
    lower: true,
    locale: "vi",
    trim: true,
  });

  text = text.replace(/-+/g, "-");

  return text;
}

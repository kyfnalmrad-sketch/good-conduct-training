import * as XLSX from "xlsx";

const row = {
  fullNameAr: "جميل جبر أحمد",
  fullNameEn: "Jameel Jabr Ahmed",
  surnameAr: "الرملي",
  surnameEn: "Al Ramli",
  birthPlaceAr: "السعودية، جدة",
  birthPlaceEn: "Jeddah, Saudi Arabia",
  birthDate: "16/02/1995",
  idTypeAr: "جواز سفر",
  idTypeEn: "Passport",
  idNumberAr: "10878313",
  idNumberEn: "10878313",
  passportAr: "11/03/2026",
  passportEn: "11/03/2026",
  nationalityAr: "اليمن",
  nationalityEn: "Yemen",
  occupationAr: "منسوب مبيعات",
  occupationEn: "Sales Representative",
  idIssueDateAr: "01/03/2023",
  idIssueDateEn: "01/03/2023",
  idIssuePlaceAr: "معين",
  idIssuePlaceEn: "Ma'in",
  departmentAr: "سفارة عمان",
  departmentEn: "Embassy of Oman",
  issueDate: "11/12/2025",
  expiryAr: "11/03/2026",
  expiryEn: "11/03/2026",
  notesAr: "تم التحقق من سجلاتنا.",
  notesEn: "OUR RECORDS HAVE BEEN VERIFIED.",
};
const sheet = XLSX.utils.json_to_sheet([row]);
sheet["!cols"] = Object.keys(row).map(() => ({ wch: 22 }));
const instructions = XLSX.utils.aoa_to_sheet([
  ["تعليمات تعبئة قالب حسن السيرة والسلوك"],
  ["اكتب بيانات شخص واحد فقط في الصف الثاني من ورقة Good Conduct."],
  ["تواريخ Excel: استخدم DD/MM/YYYY أو YYYY-MM-DD."],
  ["الأرقام النظامية ينشئها النظام تلقائيًا ولا تُستورد من Excel."],
  ["الصورة تُرفع من داخل النظام وليست داخل ملف Excel."],
  ["مقاس الصورة الموصى به: 400 × 600 بكسل بنسبة 2:3، JPG أو PNG، وبحد أقصى 5MB."],
  ["تُستخدم الصورة نفسها للعلامة المائية، ويزيل النظام الخلفية البيضاء من نسختها فقط."],
  ["مقاس الصورة داخل الوثيقة: 40 × 60mm. مقاس العلامة المائية: 24 × 36mm تقريبًا."],
  ["لا تغيّر أسماء أعمدة ورقة Good Conduct حتى يتم الاستيراد بشكل صحيح."],
]);
instructions["!cols"] = [{ wch: 120 }];
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, sheet, "Good Conduct");
XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");
XLSX.writeFile(workbook, "Good Conduct Data Template.xlsx");

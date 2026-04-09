import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LANGUAGES = ["en", "hi", "kn"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const savedLanguage = localStorage.getItem("language");
const language: SupportedLanguage =
  savedLanguage === "hi" || savedLanguage === "kn" ? savedLanguage : "en";

const resources = {
  en: {
    translation: {
      appName: "Sales Trackr",
      language: "Language",
      langEnglish: "English",
      langHindi: "हिंदी",
      langKannada: "ಕನ್ನಡ",
      auth: {
        register: "Register",
        login: "Login",
        createAccount: "Create account",
        signIn: "Sign in",
        name: "Name",
        shopName: "Shop Name",
        email: "Email",
        password: "Password",
        welcome: "Welcome! You are logged in.",
        unableRegister: "Unable to register.",
        invalidLogin: "Invalid email or password.",
      },
      nav: {
        dashboard: "Dashboard",
        categories: "Categories",
        products: "Products",
        logout: "Logout",
        menu: "Menu",
        openMenu: "Open menu",
      },
      messages: {
        categoryCreated: "Category created.",
        categoryUpdated: "Category updated.",
        categoryDeleted: "Category deleted.",
        productCreated: "Product created.",
        productUpdated: "Product updated.",
        productDeleted: "Product deleted.",
        unableSaveCategory: "Unable to save category.",
        unableSaveProduct: "Unable to save product.",
      },
      validation: {
        productNameRequired: "Product name is required",
        productNameMax: "Product name cannot exceed 100 characters",
        pluRequired: "PLU number is required",
        pluRange: "PLU number must be between 1 and 500",
        costPriceRange:
          "Cost price must be greater than 0 and less than or equal to 100000",
        sellingPriceRange:
          "Selling price must be greater than 0 and less than or equal to 100000",
        quantityValueRange:
          "Quantity value must be greater than 0 and less than or equal to 1000",
        categoryRequired: "Category is required",
        categoryNameRequired: "Category name is required",
        categoryNameMax: "Category name cannot be longer than 100 characters",
        selectValidProduct: "Please select a valid product from search.",
        quantityAndPriceRequired:
          "Quantity and selling price must be greater than 0.",
        addOneSaleItem: "Add at least one sale item.",
        fillRequiredCreateProduct:
          "Please fill all required fields to create product.",
        costAndSellingPriceRequired:
          "Cost price and selling price must be greater than 0.",
      },
      dashboard: {
        totalAmount: "Total Amount",
        cashAmount: "Cash Amount",
        upiAmount: "UPI Amount",
        cashTransactions: "Cash Transaction",
        upiTransactions: "UPI Transaction",
        totalTransactions: "Total Transaction Count",
        addSale: "Add Sale",
        topSellingItems: "Top 5 Selling Items",
        topSellingItemsZeroState: {
          title: "No items sold yet",
          description:
            "Your top 5 selling products will appear here once sales start rolling in.",
        },
        topTransactions: "Top 5 Transactions",
        topTransactionsZeroState: {
          title: "No transactions yet",
          description:
            "Your highest value orders will be highlighted in this section.",
        },
        recentTransactions: "Recent 5 Transactions",
        recentTransactionsZeroState: {
          title: "Your sales history is empty",
          description:
            "Record your first sale to start seeing recent activity here.",
        },
        highestBillTotals: "Highest bill totals in the selected period",
        items: "Items:",
        itemCount: "{{count}} item(s)",
        datePresets: {
          TODAY: "Today",
          YESTERDAY: "Yesterday",
          THIS_WEEK: "This Week",
          LAST_WEEK: "Last Week",
          THIS_MONTH: "This Month",
          LAST_MONTH: "Last Month",
        },
      },
      categories: {
        title: "Category",
        categoryName: "Category Name",
        updateCategory: "Update Category",
        addCategory: "Add Category",
        edit: "Edit",
        delete: "Delete",
      },
      products: {
        title: "Product",
        productName: "Product Name",
        pluNo: "PLU No",
        costPrice: "Cost Price",
        sellingPrice: "Selling Price",
        quantityValue: "Quantity Value",
        unit: "Unit",
        category: "Category",
        createCategory: "+ Create Category",
        updateProduct: "Update Product",
        addProduct: "Add Product",
        edit: "Edit",
        delete: "Delete",
        createCategoryTitle: "Create Category",
        cancel: "Cancel",
        create: "Create",
        createCategoryHint:
          'If you do not find the right category in the list, click "Create Category" to add one and continue product creation.',
        details:
          "PLU: {{pluNo}} | CP: ₹ {{costPrice}} | SP: ₹ {{sellingPrice}} per {{quantityValue}} {{quantityUnit}} | {{categoryName}}",
      },
      sales: {
        title: "Add Sale",
        searchOrSelectProduct: "Search or select product",
        typeToFilter: "Type to filter...",
        productNotFoundCreate: "Product not found? Create",
        addOneMoreSale: "Add One More Sale",
        createProductTitle: "Create Product",
        createProduct: "Create Product",
        itemsCurrentBill: "Items in Current Bill",
        total: "Total: ₹ {{amount}}",
        paymentMode: "Payment Mode",
        completeSale: "Complete Sale",
      },
      common: {
        cash: "Cash",
        upi: "UPI",
        unit: {
          kg: "kg",
          g: "g",
          l: "l",
          ml: "ml",
          nos: "nos",
        },
      },
    },
  },
  hi: {
    translation: {
      appName: "सेल्स ट्रैकर",
      language: "भाषा",
      langEnglish: "English",
      langHindi: "हिंदी",
      langKannada: "ಕನ್ನಡ",
      auth: {
        register: "रजिस्टर",
        login: "लॉगिन",
        createAccount: "खाता बनाएं",
        signIn: "साइन इन",
        name: "नाम",
        shopName: "दुकान का नाम",
        email: "ईमेल",
        password: "पासवर्ड",
        welcome: "स्वागत है! आप लॉग इन हैं।",
        unableRegister: "रजिस्टर नहीं हो सका।",
        invalidLogin: "ईमेल या पासवर्ड गलत है।",
      },
      nav: {
        dashboard: "डैशबोर्ड",
        categories: "श्रेणियां",
        products: "प्रोडक्ट्स",
        logout: "लॉगआउट",
        menu: "मेन्यू",
        openMenu: "मेन्यू खोलें",
      },
      messages: {
        categoryCreated: "श्रेणी बनाई गई।",
        categoryUpdated: "श्रेणी अपडेट की गई।",
        categoryDeleted: "श्रेणी हटाई गई।",
        productCreated: "प्रोडक्ट बनाया गया।",
        productUpdated: "प्रोडक्ट अपडेट किया गया।",
        productDeleted: "प्रोडक्ट हटाया गया।",
        unableSaveCategory: "श्रेणी सेव नहीं हो सकी।",
        unableSaveProduct: "प्रोडक्ट सेव नहीं हो सका।",
      },
      validation: {
        productNameRequired: "प्रोडक्ट का नाम आवश्यक है",
        productNameMax: "प्रोडक्ट का नाम 100 अक्षरों से अधिक नहीं हो सकता",
        pluRequired: "PLU नंबर आवश्यक है",
        pluRange: "PLU नंबर 1 से 500 के बीच होना चाहिए",
        costPriceRange: "कॉस्ट प्राइस 0 से अधिक और 100000 तक होना चाहिए",
        sellingPriceRange: "सेलिंग प्राइस 0 से अधिक और 100000 तक होना चाहिए",
        quantityValueRange: "मात्रा 0 से अधिक और 1000 तक होनी चाहिए",
        categoryRequired: "श्रेणी आवश्यक है",
        categoryNameRequired: "श्रेणी का नाम आवश्यक है",
        categoryNameMax: "श्रेणी का नाम 100 अक्षरों से अधिक नहीं हो सकता",
        selectValidProduct: "कृपया खोज से एक सही प्रोडक्ट चुनें।",
        quantityAndPriceRequired:
          "मात्रा और सेलिंग प्राइस 0 से अधिक होने चाहिए।",
        addOneSaleItem: "कम से कम एक बिक्री आइटम जोड़ें।",
        fillRequiredCreateProduct:
          "प्रोडक्ट बनाने के लिए सभी आवश्यक फ़ील्ड भरें।",
        costAndSellingPriceRequired:
          "कॉस्ट प्राइस और सेलिंग प्राइस 0 से अधिक होने चाहिए।",
      },
      dashboard: {
        totalAmount: "कुल राशि",
        cashAmount: "नकद राशि",
        upiAmount: "यूपीआई राशि",
        cashTransactions: "नकद लेन-देन",
        upiTransactions: "यूपीआई लेन-देन",
        totalTransactions: "कुल लेन-देन संख्या",
        addSale: "बिक्री जोड़ें",
        topSellingItems: "शीर्ष 5 बिकने वाले आइटम",
        topSellingItemsZeroState: {
          title: "अभी तक कोई आइटम नहीं बिका",
          description:
            "जैसे ही बिक्री शुरू होगी, यहां आपके शीर्ष 5 बिकने वाले प्रोडक्ट दिखेंगे।",
        },
        topTransactions: "शीर्ष 5 लेन-देन",
        topTransactionsZeroState: {
          title: "अभी तक कोई लेन-देन नहीं हुआ",
          description:
            "सबसे अधिक राशि वाले ऑर्डर इस सेक्शन में दिखाए जाएंगे।",
        },
        recentTransactions: "हाल के 5 लेन-देन",
        recentTransactionsZeroState: {
          title: "आपका बिक्री इतिहास खाली है",
          description:
            "हाल की गतिविधि यहां देखने के लिए अपनी पहली बिक्री दर्ज करें।",
        },
        highestBillTotals: "चयनित अवधि में सबसे अधिक बिल राशि",
        items: "आइटम:",
        itemCount: "{{count}} आइटम",
        datePresets: {
          TODAY: "आज",
          YESTERDAY: "कल",
          THIS_WEEK: "इस सप्ताह",
          LAST_WEEK: "पिछला सप्ताह",
          THIS_MONTH: "इस महीना",
          LAST_MONTH: "पिछला महीना",
        },
      },
      categories: {
        title: "श्रेणी",
        categoryName: "श्रेणी नाम",
        updateCategory: "श्रेणी अपडेट करें",
        addCategory: "श्रेणी जोड़ें",
        edit: "एडिट",
        delete: "हटाएं",
      },
      products: {
        title: "प्रोडक्ट",
        productName: "प्रोडक्ट नाम",
        pluNo: "PLU नंबर",
        costPrice: "कॉस्ट प्राइस",
        sellingPrice: "सेलिंग प्राइस",
        quantityValue: "मात्रा",
        unit: "यूनिट",
        category: "श्रेणी",
        createCategory: "+ श्रेणी बनाएं",
        updateProduct: "प्रोडक्ट अपडेट करें",
        addProduct: "प्रोडक्ट जोड़ें",
        edit: "एडिट",
        delete: "हटाएं",
        createCategoryTitle: "श्रेणी बनाएं",
        cancel: "रद्द करें",
        create: "बनाएं",
        createCategoryHint:
          'यदि सूची में सही श्रेणी नहीं मिलती है, तो "श्रेणी बनाएं" पर क्लिक करें और प्रोडक्ट बनाना जारी रखें।',
        details:
          "PLU: {{pluNo}} | CP: ₹ {{costPrice}} | SP: ₹ {{sellingPrice}} प्रति {{quantityValue}} {{quantityUnit}} | {{categoryName}}",
      },
      sales: {
        title: "बिक्री जोड़ें",
        searchOrSelectProduct: "प्रोडक्ट खोजें या चुनें",
        typeToFilter: "फ़िल्टर करने के लिए टाइप करें...",
        productNotFoundCreate: "प्रोडक्ट नहीं मिला? बनाएं",
        addOneMoreSale: "एक और बिक्री जोड़ें",
        createProductTitle: "प्रोडक्ट बनाएं",
        createProduct: "प्रोडक्ट बनाएं",
        itemsCurrentBill: "वर्तमान बिल के आइटम",
        total: "कुल: ₹ {{amount}}",
        paymentMode: "भुगतान मोड",
        completeSale: "बिक्री पूरी करें",
      },
      common: {
        cash: "नकद",
        upi: "यूपीआई",
        unit: {
          kg: "किलो",
          g: "ग्राम",
          l: "लीटर",
          ml: "मिलीलीटर",
          nos: "नंबर",
        },
      },
    },
  },
  kn: {
    translation: {
      appName: "ಸೇಲ್ಸ್ ಟ್ರ್ಯಾಕರ್",
      language: "ಭಾಷೆ",
      langEnglish: "English",
      langHindi: "हिंदी",
      langKannada: "ಕನ್ನಡ",
      auth: {
        register: "ನೋಂದಣಿ",
        login: "ಲಾಗಿನ್",
        createAccount: "ಖಾತೆ ರಚಿಸಿ",
        signIn: "ಸೈನ್ ಇನ್",
        name: "ಹೆಸರು",
        shopName: "ಅಂಗಡಿ ಹೆಸರು",
        email: "ಇಮೇಲ್",
        password: "ಪಾಸ್ವರ್ಡ್",
        welcome: "ಸ್ವಾಗತ! ನೀವು ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ.",
        unableRegister: "ನೋಂದಣಿ ಮಾಡಲು ಆಗಲಿಲ್ಲ.",
        invalidLogin: "ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ.",
      },
      nav: {
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        categories: "ವರ್ಗಗಳು",
        products: "ಉತ್ಪನ್ನಗಳು",
        logout: "ಲಾಗ್‌ಔಟ್",
        menu: "ಮೆನು",
        openMenu: "ಮೆನು ತೆರೆಯಿರಿ",
      },
      messages: {
        categoryCreated: "ವರ್ಗವನ್ನು ರಚಿಸಲಾಗಿದೆ.",
        categoryUpdated: "ವರ್ಗವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.",
        categoryDeleted: "ವರ್ಗವನ್ನು ಅಳಿಸಲಾಗಿದೆ.",
        productCreated: "ಉತ್ಪನ್ನವನ್ನು ರಚಿಸಲಾಗಿದೆ.",
        productUpdated: "ಉತ್ಪನ್ನವನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.",
        productDeleted: "ಉತ್ಪನ್ನವನ್ನು ಅಳಿಸಲಾಗಿದೆ.",
        unableSaveCategory: "ವರ್ಗವನ್ನು ಉಳಿಸಲು ಆಗಲಿಲ್ಲ.",
        unableSaveProduct: "ಉತ್ಪನ್ನವನ್ನು ಉಳಿಸಲು ಆಗಲಿಲ್ಲ.",
      },
      validation: {
        productNameRequired: "ಉತ್ಪನ್ನದ ಹೆಸರು ಅಗತ್ಯವಿದೆ",
        productNameMax: "ಉತ್ಪನ್ನದ ಹೆಸರು 100 ಅಕ್ಷರಗಳನ್ನು ಮೀರಬಾರದು",
        pluRequired: "PLU ಸಂಖ್ಯೆ ಅಗತ್ಯವಿದೆ",
        pluRange: "PLU ಸಂಖ್ಯೆ 1 ರಿಂದ 500 ನಡುವೆ ಇರಬೇಕು",
        costPriceRange:
          "ಕಾಸ್ಟ್ ಪ್ರೈಸ್ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಮತ್ತು 100000 ಕ್ಕಿಂತ ಕಡಿಮೆ ಅಥವಾ ಸಮ ಇರಬೇಕು",
        sellingPriceRange:
          "ಸೆಲ್ಲಿಂಗ್ ಪ್ರೈಸ್ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಮತ್ತು 100000 ಕ್ಕಿಂತ ಕಡಿಮೆ ಅಥವಾ ಸಮ ಇರಬೇಕು",
        quantityValueRange:
          "ಪ್ರಮಾಣ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಮತ್ತು 1000 ಕ್ಕಿಂತ ಕಡಿಮೆ ಅಥವಾ ಸಮ ಇರಬೇಕು",
        categoryRequired: "ವರ್ಗ ಅಗತ್ಯವಿದೆ",
        categoryNameRequired: "ವರ್ಗದ ಹೆಸರು ಅಗತ್ಯವಿದೆ",
        categoryNameMax: "ವರ್ಗದ ಹೆಸರು 100 ಅಕ್ಷರಗಳನ್ನು ಮೀರಬಾರದು",
        selectValidProduct:
          "ದಯವಿಟ್ಟು ಹುಡುಕಾಟದಿಂದ ಸರಿಯಾದ ಉತ್ಪನ್ನವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        quantityAndPriceRequired:
          "ಪ್ರಮಾಣ ಮತ್ತು ಸೆಲ್ಲಿಂಗ್ ಪ್ರೈಸ್ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಇರಬೇಕು.",
        addOneSaleItem: "ಕನಿಷ್ಠ ಒಂದು ಮಾರಾಟ ಐಟಂ ಸೇರಿಸಿ.",
        fillRequiredCreateProduct:
          "ಉತ್ಪನ್ನ ರಚಿಸಲು ಎಲ್ಲಾ ಅಗತ್ಯ ಫೀಲ್ಡ್‌ಗಳನ್ನು ತುಂಬಿ.",
        costAndSellingPriceRequired:
          "ಕಾಸ್ಟ್ ಪ್ರೈಸ್ ಮತ್ತು ಸೆಲ್ಲಿಂಗ್ ಪ್ರೈಸ್ 0 ಕ್ಕಿಂತ ಹೆಚ್ಚು ಇರಬೇಕು.",
      },
      dashboard: {
        totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
        cashAmount: "ನಗದು ಮೊತ್ತ",
        upiAmount: "ಯುಪಿಐ ಮೊತ್ತ",
        cashTransactions: "ನಗದು ವ್ಯವಹಾರಗಳು",
        upiTransactions: "ಯುಪಿಐ ವ್ಯವಹಾರಗಳು",
        totalTransactions: "ಒಟ್ಟು ವ್ಯವಹಾರಗಳ ಸಂಖ್ಯೆ",
        addSale: "ಮಾರಾಟ ಸೇರಿಸಿ",
        topSellingItems: "ಅಗ್ರ 5 ಮಾರಾಟವಾದ ಐಟಂಗಳು",
        topSellingItemsZeroState: {
          title: "ಇನ್ನೂ ಯಾವುದೇ ಐಟಂ ಮಾರಾಟವಾಗಿಲ್ಲ",
          description:
            "ಮಾರಾಟ ಆರಂಭವಾದ ಕೂಡಲೇ, ಇಲ್ಲಿ ನಿಮ್ಮ ಅಗ್ರ 5 ಮಾರಾಟವಾದ ಉತ್ಪನ್ನಗಳು ಕಾಣಿಸುತ್ತವೆ.",
        },
        topTransactions: "ಅಗ್ರ 5 ವ್ಯವಹಾರಗಳು",
        topTransactionsZeroState: {
          title: "ಇನ್ನೂ ಯಾವುದೇ ವ್ಯವಹಾರಗಳಿಲ್ಲ",
          description:
            "ಅತ್ಯಧಿಕ ಮೊತ್ತದ ಆರ್ಡರ್‌ಗಳನ್ನು ಈ ವಿಭಾಗದಲ್ಲಿ ಹೈಲೈಟ್ ಮಾಡಲಾಗುತ್ತದೆ.",
        },
        recentTransactions: "ಇತ್ತೀಚಿನ 5 ವ್ಯವಹಾರಗಳು",
        recentTransactionsZeroState: {
          title: "ನಿಮ್ಮ ಮಾರಾಟ ಇತಿಹಾಸ ಖಾಲಿಯಾಗಿದೆ",
          description:
            "ಇಲ್ಲಿ ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಯನ್ನು ನೋಡಲು ನಿಮ್ಮ ಮೊದಲ ಮಾರಾಟವನ್ನು ದಾಖಲಿಸಿ.",
        },
        highestBillTotals: "ಆಯ್ದ ಅವಧಿಯಲ್ಲಿನ ಅತಿ ಹೆಚ್ಚು ಬಿಲ್ ಮೊತ್ತಗಳು",
        items: "ಐಟಂಗಳು:",
        itemCount: "{{count}} ಐಟಂ(ಗಳು)",
        datePresets: {
          TODAY: "ಇಂದು",
          YESTERDAY: "ನಿನ್ನೆ",
          THIS_WEEK: "ಈ ವಾರ",
          LAST_WEEK: "ಕಳೆದ ವಾರ",
          THIS_MONTH: "ಈ ತಿಂಗಳು",
          LAST_MONTH: "ಕಳೆದ ತಿಂಗಳು",
        },
      },
      categories: {
        title: "ವರ್ಗ",
        categoryName: "ವರ್ಗ ಹೆಸರು",
        updateCategory: "ವರ್ಗ ನವೀಕರಿಸಿ",
        addCategory: "ವರ್ಗ ಸೇರಿಸಿ",
        edit: "ತಿದ್ದು",
        delete: "ಅಳಿಸಿ",
      },
      products: {
        title: "ಉತ್ಪನ್ನ",
        productName: "ಉತ್ಪನ್ನ ಹೆಸರು",
        pluNo: "PLU ಸಂಖ್ಯೆ",
        costPrice: "ಕಾಸ್ಟ್ ಪ್ರೈಸ್",
        sellingPrice: "ಸೆಲ್ಲಿಂಗ್ ಪ್ರೈಸ್",
        quantityValue: "ಪ್ರಮಾಣ",
        unit: "ಯುನಿಟ್",
        category: "ವರ್ಗ",
        createCategory: "+ ವರ್ಗ ರಚಿಸಿ",
        updateProduct: "ಉತ್ಪನ್ನ ನವೀಕರಿಸಿ",
        addProduct: "ಉತ್ಪನ್ನ ಸೇರಿಸಿ",
        edit: "ತಿದ್ದು",
        delete: "ಅಳಿಸಿ",
        createCategoryTitle: "ವರ್ಗ ರಚಿಸಿ",
        cancel: "ರದ್ದುಮಾಡಿ",
        create: "ರಚಿಸಿ",
        createCategoryHint:
          'ಪಟ್ಟಿಯಲ್ಲಿ ಸರಿಯಾದ ವರ್ಗ ಸಿಗದಿದ್ದರೆ, "ವರ್ಗ ರಚಿಸಿ" ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಉತ್ಪನ್ನ ರಚನೆಯನ್ನು ಮುಂದುವರಿಸಿ.',
        details:
          "PLU: {{pluNo}} | CP: ₹ {{costPrice}} | SP: ₹ {{sellingPrice}} ಪ್ರತಿ {{quantityValue}} {{quantityUnit}} | {{categoryName}}",
      },
      sales: {
        title: "ಮಾರಾಟ ಸೇರಿಸಿ",
        searchOrSelectProduct: "ಉತ್ಪನ್ನ ಹುಡುಕಿ ಅಥವಾ ಆಯ್ಕೆಮಾಡಿ",
        typeToFilter: "ಫಿಲ್ಟರ್ ಮಾಡಲು ಟೈಪ್ ಮಾಡಿ...",
        productNotFoundCreate: "ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲವೇ? ರಚಿಸಿ",
        addOneMoreSale: "ಇನ್ನೊಂದು ಮಾರಾಟ ಸೇರಿಸಿ",
        createProductTitle: "ಉತ್ಪನ್ನ ರಚಿಸಿ",
        createProduct: "ಉತ್ಪನ್ನ ರಚಿಸಿ",
        itemsCurrentBill: "ಪ್ರಸ್ತುತ ಬಿಲ್ಲಿನ ಐಟಂಗಳು",
        total: "ಒಟ್ಟು: ₹ {{amount}}",
        paymentMode: "ಪಾವತಿ ವಿಧಾನ",
        completeSale: "ಮಾರಾಟ ಪೂರ್ಣಗೊಳಿಸಿ",
      },
      common: {
        cash: "ನಗದು",
        upi: "ಯುಪಿಐ",
        unit: {
          kg: "ಕೆಜಿ",
          g: "ಗ್ರಾಂ",
          l: "ಲೀ",
          ml: "ಮಿಲಿ",
          nos: "ಸಂಖ್ಯೆ",
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

void i18n.changeLanguage(language);

export default i18n;

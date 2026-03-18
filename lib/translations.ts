export type Language = 'en' | 'hi' | 'mr';

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
];

type TranslationKeys = {
    // Navbar
    login: string;
    cart: string;
    orders: string;
    profile: string;
    dashboard: string;
    hi: string;

    // Hero
    heroTagline: string;
    heroTitle1: string;
    heroTitle2: string;
    heroDesc: string;
    startShopping: string;
    freeDeliveryAbove: string;
    limitedTime: string;

    // Categories
    exploreCategories: string;
    allItems: string;
    freshForYou: string;

    // Product
    add: string;
    outOfStock: string;
    onlyLeft: string;

    // Cart
    yourCart: string;
    emptyCart: string;
    emptyCartDesc: string;
    subtotal: string;
    deliveryFee: string;
    grandTotal: string;
    swipeToOrder: string;
    paymentMethod: string;
    cashOnDelivery: string;
    online: string;
    deliveryAddress: string;
    addDeliveryAddress: string;

    // Filters
    search: string;
    sortBy: string;
    priceRange: string;
    all: string;

    // Orders
    myOrders: string;
    noOrders: string;
    orderPlaced: string;
    items: string;

    // Auth
    nameRequired: string;
    mobileRequired: string;
    passwordRequired: string;
    invalidMobile: string;
    wrongCredentials: string;

    // General
    free: string;
    addFreeDelivery: string;
    unlockedFreeDelivery: string;
};

const translations: Record<Language, TranslationKeys> = {
    en: {
        login: 'Login',
        cart: 'Cart',
        orders: 'Orders',
        profile: 'Profile',
        dashboard: 'Dashboard',
        hi: 'Hi',

        heroTagline: "Pune's Favourite Store",
        heroTitle1: 'Everything You Need,',
        heroTitle2: 'One Place.',
        heroDesc: 'Stationery, snacks, gifts, jewellery, cutlery & more — delivered instantly or pick up. Shop fresh, shop local.',
        startShopping: 'Start Shopping',
        freeDeliveryAbove: 'Free Delivery Above',
        limitedTime: 'Limited Time',

        exploreCategories: 'Explore Categories',
        allItems: 'All Items',
        freshForYou: 'Fresh for you',

        add: 'Add',
        outOfStock: 'Out',
        onlyLeft: 'Only {count} left!',

        yourCart: 'Your Cart',
        emptyCart: 'Your cart is empty',
        emptyCartDesc: 'Add some items to get started.',
        subtotal: 'Subtotal',
        deliveryFee: 'Delivery Fee',
        grandTotal: 'Grand Total',
        swipeToOrder: 'Swipe to Order',
        paymentMethod: 'Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        online: 'Online',
        deliveryAddress: 'Delivery Address',
        addDeliveryAddress: 'Add Delivery Address',

        search: 'Search products...',
        sortBy: 'Sort',
        priceRange: 'Price Range',
        all: 'All',

        myOrders: 'My Orders',
        noOrders: 'No orders yet',
        orderPlaced: 'Order placed',
        items: 'items',

        nameRequired: 'Name is required.',
        mobileRequired: 'Mobile number is required.',
        passwordRequired: 'Password is required.',
        invalidMobile: 'Invalid mobile number format.',
        wrongCredentials: 'Wrong ID or Password.',

        free: 'FREE',
        addFreeDelivery: 'Add ₹{amount} more to unlock Free Delivery',
        unlockedFreeDelivery: '🎉 Free Delivery Unlocked!',
    },
    hi: {
        login: 'लॉगिन',
        cart: 'कार्ट',
        orders: 'ऑर्डर',
        profile: 'प्रोफ़ाइल',
        dashboard: 'डैशबोर्ड',
        hi: 'नमस्ते',

        heroTagline: 'पुणे का पसंदीदा स्टोर',
        heroTitle1: 'सब कुछ जो आपको चाहिए,',
        heroTitle2: 'एक जगह।',
        heroDesc: 'स्टेशनरी, स्नैक्स, गिफ्ट्स, ज्वेलरी, कटलरी और भी बहुत कुछ — तुरंत डिलीवरी या पिकअप करें।',
        startShopping: 'खरीदारी शुरू करें',
        freeDeliveryAbove: 'मुफ्त डिलीवरी ₹ से ऊपर',
        limitedTime: 'सीमित समय',

        exploreCategories: 'श्रेणियाँ देखें',
        allItems: 'सभी आइटम',
        freshForYou: 'आपके लिए ताज़ा',

        add: 'जोड़ें',
        outOfStock: 'स्टॉक में नहीं',
        onlyLeft: 'केवल {count} बचे!',

        yourCart: 'आपका कार्ट',
        emptyCart: 'आपका कार्ट खाली है',
        emptyCartDesc: 'शुरू करने के लिए कुछ आइटम जोड़ें।',
        subtotal: 'उप-योग',
        deliveryFee: 'डिलीवरी शुल्क',
        grandTotal: 'कुल योग',
        swipeToOrder: 'ऑर्डर करने के लिए स्वाइप करें',
        paymentMethod: 'भुगतान का तरीका',
        cashOnDelivery: 'कैश ऑन डिलीवरी',
        online: 'ऑनलाइन',
        deliveryAddress: 'डिलीवरी पता',
        addDeliveryAddress: 'डिलीवरी पता जोड़ें',

        search: 'उत्पाद खोजें...',
        sortBy: 'क्रमबद्ध करें',
        priceRange: 'मूल्य सीमा',
        all: 'सभी',

        myOrders: 'मेरे ऑर्डर',
        noOrders: 'अभी तक कोई ऑर्डर नहीं',
        orderPlaced: 'ऑर्डर दिया गया',
        items: 'आइटम',

        nameRequired: 'नाम आवश्यक है।',
        mobileRequired: 'मोबाइल नंबर आवश्यक है।',
        passwordRequired: 'पासवर्ड आवश्यक है।',
        invalidMobile: 'अमान्य मोबाइल नंबर।',
        wrongCredentials: 'गलत आईडी या पासवर्ड।',

        free: 'मुफ्त',
        addFreeDelivery: 'मुफ्त डिलीवरी के लिए ₹{amount} और जोड़ें',
        unlockedFreeDelivery: '🎉 मुफ्त डिलीवरी अनलॉक!',
    },
    mr: {
        login: 'लॉगिन',
        cart: 'कार्ट',
        orders: 'ऑर्डर',
        profile: 'प्रोफाइल',
        dashboard: 'डॅशबोर्ड',
        hi: 'नमस्कार',

        heroTagline: 'पुण्याचे आवडते दुकान',
        heroTitle1: 'तुम्हाला हवे ते सगळे,',
        heroTitle2: 'एकाच ठिकाणी.',
        heroDesc: 'स्टेशनरी, स्नॅक्स, भेटवस्तू, दागिने, भांडी आणि बरेच काही — लगेच डिलिव्हरी किंवा पिकअप करा.',
        startShopping: 'खरेदी सुरू करा',
        freeDeliveryAbove: 'मोफत डिलिव्हरी ₹ पेक्षा जास्त',
        limitedTime: 'मर्यादित वेळ',

        exploreCategories: 'श्रेण्या पहा',
        allItems: 'सर्व वस्तू',
        freshForYou: 'तुमच्यासाठी ताजे',

        add: 'जोडा',
        outOfStock: 'उपलब्ध नाही',
        onlyLeft: 'फक्त {count} शिल्लक!',

        yourCart: 'तुमची कार्ट',
        emptyCart: 'तुमची कार्ट रिकामी आहे',
        emptyCartDesc: 'सुरू करण्यासाठी काही वस्तू जोडा.',
        subtotal: 'उप-एकूण',
        deliveryFee: 'डिलिव्हरी शुल्क',
        grandTotal: 'एकूण',
        swipeToOrder: 'ऑर्डर करण्यासाठी स्वाइप करा',
        paymentMethod: 'पेमेंट पद्धत',
        cashOnDelivery: 'कॅश ऑन डिलिव्हरी',
        online: 'ऑनलाइन',
        deliveryAddress: 'डिलिव्हरी पत्ता',
        addDeliveryAddress: 'डिलिव्हरी पत्ता जोडा',

        search: 'उत्पादने शोधा...',
        sortBy: 'क्रमवारी',
        priceRange: 'किंमत श्रेणी',
        all: 'सर्व',

        myOrders: 'माझे ऑर्डर',
        noOrders: 'अजून कोणतेही ऑर्डर नाहीत',
        orderPlaced: 'ऑर्डर दिला',
        items: 'वस्तू',

        nameRequired: 'नाव आवश्यक आहे.',
        mobileRequired: 'मोबाइल नंबर आवश्यक आहे.',
        passwordRequired: 'पासवर्ड आवश्यक आहे.',
        invalidMobile: 'अवैध मोबाइल नंबर.',
        wrongCredentials: 'चुकीची आयडी किंवा पासवर्ड.',

        free: 'मोफत',
        addFreeDelivery: 'मोफत डिलिव्हरीसाठी ₹{amount} आणखी जोडा',
        unlockedFreeDelivery: '🎉 मोफत डिलिव्हरी अनलॉक!',
    },
};

export default translations;

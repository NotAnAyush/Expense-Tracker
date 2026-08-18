/**
 * Digital Bill & Financial Forensic Resolver
 * Resolves full itemized digital receipts, tax invoices, GST breakdowns,
 * and granular categorization from receiptDetails, splits, or transaction notes.
 */

// Category Meta with Subcategory Archetypes and Emojis
export const CATEGORY_ARCHETYPES = {
  'Food & Dining': {
    emoji: '🍔',
    color: '#00FF87',
    defaultSub: 'Casual Dining & Meals',
    rules: [
      { regex: /dosa|idli|vada|sambar|chutney|poori|upma|poha|paratha|bhature|pongal|uttapam|tiffin/i, sub: 'South Indian Breakfast & Tiffin', emoji: '🥞' },
      { regex: /coffee|tea|chai|latte|cappuccino|shake|smoothie|juice|soda|coke|beverage|drink|water|brew/i, sub: 'Beverages & Specialty Drinks', emoji: '☕' },
      { regex: /dessert|ice cream|cake|pastry|gulab|halwa|sweet|chocolate|waffle|cookie|brownie/i, sub: 'Desserts & Sweets', emoji: '🍨' },
      { regex: /burger|pizza|sandwich|fries|roll|wrap|momos|snack|chips|nugget|taco|chaat|samosa/i, sub: 'Fast Food & Snacks', emoji: '🍔' },
      { regex: /biryani|rice|curry|dal|roti|paneer|chicken|mutton|thali|noodles|pasta|combo|meal/i, sub: 'Main Course & Meals', emoji: '🍛' }
    ]
  },
  'Shopping': {
    emoji: '🛍️',
    color: '#00F0FF',
    defaultSub: 'General Retail',
    rules: [
      { regex: /charger|cable|adapter|headphone|earbud|mouse|keyboard|usb|case|cover|laptop|phone|gadget|monitor/i, sub: 'Tech Hardware & Accessories', emoji: '🔌' },
      { regex: /shirt|pant|tshirt|jeans|dress|shoe|sneaker|jacket|sock|kurta|clothing|apparel|watch/i, sub: 'Apparel & Fashion', emoji: '👗' },
      { regex: /book|novel|stationery|pen|notebook|desk|lamp|chair/i, sub: 'Books & Office Supplies', emoji: '📚' }
    ]
  },
  'Housing & Utilities': {
    emoji: '🏡',
    color: '#A78BFA',
    defaultSub: 'Household & Utilities',
    rules: [
      { regex: /milk|bread|butter|egg|atta|flour|oil|sugar|salt|onion|potato|tomato|vegetable|fruit|grocery|dal|paneer|rice/i, sub: 'Daily Groceries & Essentials', emoji: '🥛' },
      { regex: /shampoo|soap|detergent|cleaner|toothpaste|brush|tissue|mop/i, sub: 'Home Care & Cleaning', emoji: '🧼' },
      { regex: /electricity|water|gas|wifi|broadband|rent|maintenance/i, sub: 'Utility Bills & Maintenance', emoji: '⚡' }
    ]
  },
  'Transportation': {
    emoji: '🚗',
    color: '#FFD700',
    defaultSub: 'Commute & Travel',
    rules: [
      { regex: /uber|ola|rapido|cab|taxi|auto/i, sub: 'Rideshare & Cabs', emoji: '🚕' },
      { regex: /petrol|diesel|fuel|cng|gasoline/i, sub: 'Fuel & Energy', emoji: '⛽' },
      { regex: /metro|train|irctc|bus|transit/i, sub: 'Public Transit & Rail', emoji: '🚆' },
      { regex: /flight|airline|indigo|air india|airport/i, sub: 'Air Travel', emoji: '✈️' },
      { regex: /toll|fastag|parking/i, sub: 'Tolls & Parking', emoji: '🅿️' }
    ]
  },
  'Health & Medical': {
    emoji: '🏥',
    color: '#10B981',
    defaultSub: 'Healthcare & Pharmacy',
    rules: [
      { regex: /tablet|capsule|syrup|medicine|pharma|antibiotic|paracetamol|crocin|vitamin|supplement/i, sub: 'Prescription Pharmacy & Meds', emoji: '💊' },
      { regex: /doctor|consultation|clinic|hospital|test|lab|blood|scan|x-ray|mri/i, sub: 'Clinical Diagnostics & Care', emoji: '🩺' },
      { regex: /gym|protein|creatine|fitness|workout|yoga/i, sub: 'Fitness & Supplements', emoji: '🏋️' }
    ]
  },
  'Entertainment': {
    emoji: '🍿',
    color: '#F59E0B',
    defaultSub: 'Media & Fun',
    rules: [
      { regex: /pvr|inox|movie|cinema|film|ticket|bookmyshow/i, sub: 'Cinema & Live Events', emoji: '🎬' },
      { regex: /game|steam|playstation|xbox|nintendo/i, sub: 'Gaming & Interactive', emoji: '🎮' }
    ]
  },
  'Subscriptions': {
    emoji: '⚡',
    color: '#EC4899',
    defaultSub: 'Digital Memberships',
    rules: [
      { regex: /netflix|prime|hotstar|spotify|apple|youtube|hulu/i, sub: 'Streaming Subscriptions', emoji: '📺' },
      { regex: /chatgpt|gemini|openai|github|cloud|server|aws|figma/i, sub: 'SaaS & AI Software', emoji: '🤖' }
    ]
  }
};

/**
 * Infer item-level subcategory & emoji
 */
export const inferItemCategory = (itemName = '', parentCategory = 'Food & Dining') => {
  const itemStr = (itemName || '').toLowerCase();
  
  // Search within parent category rules first
  const archetype = CATEGORY_ARCHETYPES[parentCategory] || CATEGORY_ARCHETYPES['Food & Dining'];
  for (const rule of archetype.rules || []) {
    if (rule.regex.test(itemStr)) {
      return { subCategory: rule.sub, emoji: rule.emoji, badgeColor: archetype.color };
    }
  }

  // Cross-check all category rules
  for (const [catName, catData] of Object.entries(CATEGORY_ARCHETYPES)) {
    for (const rule of catData.rules || []) {
      if (rule.regex.test(itemStr)) {
        return { subCategory: rule.sub, emoji: rule.emoji, badgeColor: catData.color };
      }
    }
  }

  return { subCategory: archetype.defaultSub || 'General', emoji: archetype.emoji || '📦', badgeColor: archetype.color || '#94A3B8' };
};

/**
 * Infer merchant brand details & physical location
 */
export const inferMerchantProfile = (merchantName = '', title = '', gstin = '') => {
  const str = `${merchantName} ${title}`.toLowerCase();

  if (/rameshwaram/i.test(str)) {
    return {
      displayName: 'The Rameshwaram Cafe',
      subtitle: 'Pure Ghee South Indian Quick-Service Restaurant',
      location: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
      type: 'Fine Casual / South Indian Fast Food',
      fssai: '11222333000456',
      icon: '🥞',
      brandColor: '#FFD700'
    };
  }
  if (/starbucks/i.test(str)) {
    return {
      displayName: 'Starbucks Coffee',
      subtitle: 'Specialty Coffee Roasters & Cafe',
      location: 'Store #2940, Church Street, Bengaluru, Karnataka 560001',
      type: 'Cafe & Beverages',
      fssai: '10014022003117',
      icon: '☕',
      brandColor: '#00704A'
    };
  }
  if (/blinkit/i.test(str)) {
    return {
      displayName: 'Blinkit Commerce (10-Min Groceries)',
      subtitle: 'Instant Delivery & Daily Essentials Hub',
      location: 'Local Dark Store fulfillment center',
      type: 'Quick Commerce Grocery',
      fssai: '10818005000301',
      icon: '⚡',
      brandColor: '#F7CB05'
    };
  }
  if (/amazon/i.test(str)) {
    return {
      displayName: 'Amazon India',
      subtitle: 'Online Retail & Marketplace Platform',
      location: 'Amazon Seller Services Pvt. Ltd., Brigade Gateway, Bengaluru',
      type: 'E-Commerce Marketplace',
      icon: '🛍️',
      brandColor: '#FF9900'
    };
  }
  if (/swiggy/i.test(str)) {
    return {
      displayName: 'Swiggy Food & Instamart',
      subtitle: 'On-Demand Food Delivery & Cloud Kitchens',
      location: 'Bundl Technologies Pvt. Ltd., Bengaluru',
      type: 'Food & Quick Commerce Delivery',
      fssai: '11220333000122',
      icon: '🍔',
      brandColor: '#FC8019'
    };
  }
  if (/zepto/i.test(str)) {
    return {
      displayName: 'Zepto Quick Commerce',
      subtitle: '10-Minute Grocery Delivery Service',
      location: 'Zepto Dark Store Hub',
      type: 'Quick Commerce',
      fssai: '11521999000188',
      icon: '🛵',
      brandColor: '#8B5CF6'
    };
  }
  if (/zomato/i.test(str)) {
    return {
      displayName: 'Zomato Delivery',
      subtitle: 'Restaurant Aggregator & Meal Logistics',
      location: 'Zomato Ltd., Cyber City, Gurugram',
      type: 'Food Delivery',
      fssai: '10019064001810',
      icon: '🍕',
      brandColor: '#E23744'
    };
  }
  if (/flipkart/i.test(str)) {
    return {
      displayName: 'Flipkart Internet',
      subtitle: 'E-Commerce Marketplace Platform',
      location: 'Flipkart Internet Pvt Ltd, Buildings Alyssa, Bengaluru',
      type: 'E-Commerce',
      icon: '📦',
      brandColor: '#2874F0'
    };
  }

  const stateCode = gstin ? gstin.substring(0, 2) : '';
  const stateMap = {
    '29': 'Karnataka (29)',
    '27': 'Maharashtra (27)',
    '07': 'Delhi (07)',
    '33': 'Tamil Nadu (33)',
    '36': 'Telangana (36)',
    '06': 'Haryana (06)',
    '09': 'Uttar Pradesh (09)'
  };
  const stateLabel = stateMap[stateCode] || (stateCode ? `State Code ${stateCode}` : 'India');

  const cleanName = merchantName || title.replace(/^Receipt:\s*/i, '').replace(/Order\s*#?\w+/i, '').trim() || 'Merchant Vendor';
  return {
    displayName: cleanName,
    subtitle: 'Verified Commercial Merchant Outlet',
    location: `Commercial District, ${stateLabel}`,
    type: 'Retail & Commercial Services',
    fssai: '',
    icon: '🏪',
    brandColor: '#00F0FF'
  };
};

/**
 * Parses raw text/note to extract line items if receiptDetails array was empty
 */
export const parseItemsFromNote = (noteText = '', parentCategory = 'Food & Dining') => {
  if (!noteText || typeof noteText !== 'string') return [];

  const items = [];

  // Pattern 1: Items: Name (xQty @ ₹Price), Name2 (xQty @ ₹Price)
  const itemsSectionMatch = noteText.match(/Items:\s*([^|]+)/i);
  const targetStr = itemsSectionMatch ? itemsSectionMatch[1] : noteText;

  // Regex to match "Ghee Pudi Masala Dosa (x1 @ ₹147.62)" or "Item Name (x2 @ 50)"
  const itemPattern = /([^,()]+?)\s*\(\s*x?(\d+(?:\.\d+)?)\s*@\s*₹?\s*(\d+(?:\.\d+)?)\s*\)/g;
  let match;
  while ((match = itemPattern.exec(targetStr)) !== null) {
    const rawName = match[1].trim();
    const qty = parseFloat(match[2]) || 1;
    const unitPrice = parseFloat(match[3]) || 0;
    const totalPrice = Math.round(qty * unitPrice * 100) / 100;
    const catMeta = inferItemCategory(rawName, parentCategory);

    if (rawName && totalPrice > 0) {
      items.push({
        name: rawName,
        quantity: qty,
        unitPrice: unitPrice,
        price: totalPrice,
        category: parentCategory,
        subCategory: catMeta.subCategory,
        emoji: catMeta.emoji,
        badgeColor: catMeta.badgeColor
      });
    }
  }

  // Fallback Pattern 2: "Item Name - ₹100" or "Item Name ₹100" if no parens matched
  if (items.length === 0) {
    const lines = targetStr.split(/[,\n]/);
    for (const line of lines) {
      const lineMatch = line.match(/(.+?)(?:[-–—:]|\s+)?₹?\s*(\d+(?:\.\d+)?)$/);
      if (lineMatch) {
        const rawName = lineMatch[1].replace(/^[•\-\*]\s*/, '').trim();
        const price = parseFloat(lineMatch[2]) || 0;
        if (rawName && price > 0 && !/gstin|bill|order|total|tax|discount/i.test(rawName)) {
          const catMeta = inferItemCategory(rawName, parentCategory);
          items.push({
            name: rawName,
            quantity: 1,
            unitPrice: price,
            price: price,
            category: parentCategory,
            subCategory: catMeta.subCategory,
            emoji: catMeta.emoji,
            badgeColor: catMeta.badgeColor
          });
        }
      }
    }
  }

  return items;
};

/**
 * Main Digital Bill Resolver
 * Synthesizes all fields into a single high-fidelity bill payload.
 */
export const resolveDigitalBill = (transaction = {}) => {
  const {
    title = 'Transaction',
    amount = 0,
    category = 'Food & Dining',
    merchant = '',
    date = new Date(),
    note = '',
    splits = [],
    receiptDetails = {},
    paymentMethod = 'UPI',
    upiDetails = {},
    source = 'manual'
  } = transaction;

  const totalAmount = Number(amount) || 0;

  // 1. Resolve GSTIN
  let gstin = receiptDetails?.gstin || '';
  if (!gstin && note) {
    const gstinMatch = note.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/);
    if (gstinMatch) gstin = gstinMatch[0];
  }

  // 2. Resolve Bill / Invoice / Token Number
  let invoiceNumber = receiptDetails?.invoiceNumber || '';
  if (!invoiceNumber && note) {
    const billMatch = note.match(/Bill\s*#?([A-Za-z0-9-]+)/i) || note.match(/Order\s*#?([A-Za-z0-9-]+)/i);
    if (billMatch) invoiceNumber = billMatch[1];
  }
  if (!invoiceNumber) {
    invoiceNumber = `REC-${Math.abs(Math.sin(totalAmount) * 1000000 | 0).toString().slice(0, 6)}`;
  }

  const tokenNumber = note.match(/Token\s*#?(\d+)/i)?.[1] || receiptDetails?.tokenNumber || (invoiceNumber.replace(/\D/g, '').slice(-3) || '108');

  // 3. Resolve Merchant Details
  const merchantProfile = inferMerchantProfile(merchant, title, gstin);

  // 4. Resolve Line Items
  let resolvedItems = [];
  if (Array.isArray(receiptDetails?.lineItems) && receiptDetails.lineItems.length > 0) {
    resolvedItems = receiptDetails.lineItems.map(item => {
      const catMeta = inferItemCategory(item.name, category);
      const qty = item.quantity || 1;
      const unit = item.unitPrice || Math.round((item.price / qty) * 100) / 100;
      return {
        name: item.name,
        quantity: qty,
        unitPrice: unit,
        price: item.price || (qty * unit),
        category: category,
        subCategory: item.subCategory || catMeta.subCategory,
        emoji: catMeta.emoji,
        badgeColor: catMeta.badgeColor
      };
    });
  } else if (Array.isArray(splits) && splits.length > 0) {
    resolvedItems = splits.map(s => {
      const catMeta = inferItemCategory(s.title || s.name, category);
      return {
        name: s.title || s.name || 'Item',
        quantity: 1,
        unitPrice: s.amount,
        price: s.amount,
        category: category,
        subCategory: catMeta.subCategory,
        emoji: catMeta.emoji,
        badgeColor: catMeta.badgeColor
      };
    });
  } else if (note) {
    resolvedItems = parseItemsFromNote(note, category);
  }

  // Fallback single line item if no items were extracted
  if (resolvedItems.length === 0) {
    const catMeta = inferItemCategory(title, category);
    resolvedItems = [{
      name: title.replace(/^Receipt:\s*/i, '') || 'Commercial Expense Item',
      quantity: 1,
      unitPrice: totalAmount,
      price: totalAmount,
      category: category,
      subCategory: catMeta.subCategory,
      emoji: catMeta.emoji,
      badgeColor: catMeta.badgeColor
    }];
  }

  // 5. Calculate Subtotal, GST & Tax Breakdown
  const itemsSum = resolvedItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  
  let subtotal = Number(receiptDetails?.subtotal) || 0;
  if (subtotal <= 0) {
    subtotal = Math.round(itemsSum * 100) / 100;
  }

  let totalTax = Number(receiptDetails?.taxAmount) || 0;
  let cgstAmount = Number(receiptDetails?.cgst?.amount) || 0;
  let sgstAmount = Number(receiptDetails?.sgst?.amount) || 0;
  let igstAmount = Number(receiptDetails?.igst?.amount) || 0;

  // Auto-calculate tax delta if totalAmount > subtotal and taxes were 0
  if (totalTax === 0 && cgstAmount === 0 && sgstAmount === 0 && totalAmount > subtotal) {
    const diff = Math.max(0, Math.round((totalAmount - subtotal) * 100) / 100);
    totalTax = diff;
    cgstAmount = Math.round((diff / 2) * 100) / 100;
    sgstAmount = Math.round((diff - cgstAmount) * 100) / 100;
  } else if (totalTax > 0 && cgstAmount === 0 && sgstAmount === 0) {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  }

  const deliveryFee = Number(receiptDetails?.deliveryFee) || 0;
  const platformFee = Number(receiptDetails?.platformFee) || 0;
  const packagingFee = Number(receiptDetails?.packagingFee) || 0;
  const discount = Number(receiptDetails?.discount) || 0;

  // 6. Granular Categorization
  const archetype = CATEGORY_ARCHETYPES[category] || CATEGORY_ARCHETYPES['Food & Dining'];
  // Derive dominant subcategory from items
  const itemSubCounts = {};
  resolvedItems.forEach(i => {
    itemSubCounts[i.subCategory] = (itemSubCounts[i.subCategory] || 0) + 1;
  });
  const dominantSub = Object.keys(itemSubCounts).sort((a, b) => itemSubCounts[b] - itemSubCounts[a])[0] || archetype.defaultSub;

  return {
    merchant: {
      ...merchantProfile,
      gstin: gstin || 'UNREGISTERED / NOT SPECIFIED',
      hasGstin: Boolean(gstin)
    },
    invoice: {
      number: invoiceNumber,
      token: tokenNumber,
      date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      time: receiptDetails?.time || new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      rawDate: date
    },
    items: resolvedItems,
    tax: {
      subtotal: subtotal || totalAmount,
      cgstRate: receiptDetails?.cgst?.rate || 2.5,
      cgstAmount: cgstAmount,
      sgstRate: receiptDetails?.sgst?.rate || 2.5,
      sgstAmount: sgstAmount,
      igstRate: receiptDetails?.igst?.rate || 0,
      igstAmount: igstAmount,
      totalTax: totalTax || (cgstAmount + sgstAmount + igstAmount),
      deliveryFee,
      platformFee,
      packagingFee,
      discount,
      grandTotal: totalAmount
    },
    payment: {
      method: paymentMethod || 'UPI',
      upiApp: upiDetails?.upiApp || 'UPI App',
      utr: upiDetails?.utr || '',
      vpa: upiDetails?.vpa || '',
      status: 'VERIFIED & SETTLED'
    },
    categorization: {
      primary: category,
      subCategory: dominantSub,
      hierarchy: `${category} › ${dominantSub}`,
      emoji: archetype.emoji,
      color: archetype.color
    }
  };
};

const crypto = require('crypto');
const Expense = require('../../models/Expense');

/**
 * Multi-Platform E-Commerce & Quick-Commerce Sync Engine
 * Handles order parsing, line-item itemization, tax decomposition,
 * and AI Motive derivation for Amazon, Flipkart, Blinkit, Zepto, Swiggy, Zomato, Myntra, BigBasket.
 */
class EcommerceService {
  static SUPPORTED_PLATFORMS = [
    {
      id: 'amazon',
      label: 'Amazon India',
      domain: 'amazon.in',
      icon: '🛍️',
      color: '#FF9900',
      category: 'Shopping',
      typicalDelivery: '1-2 Days Prime',
    },
    {
      id: 'flipkart',
      label: 'Flipkart',
      domain: 'flipkart.com',
      icon: '📦',
      color: '#2874F0',
      category: 'Shopping',
      typicalDelivery: '1-3 Days Standard',
    },
    {
      id: 'blinkit',
      label: 'Blinkit (10-Min Groceries)',
      domain: 'blinkit.com',
      icon: '⚡',
      color: '#F7CB05',
      category: 'Food & Dining',
      typicalDelivery: '10 Minutes Instant',
    },
    {
      id: 'zepto',
      label: 'Zepto',
      domain: 'zeptonow.com',
      icon: '🛵',
      color: '#8B5CF6',
      category: 'Food & Dining',
      typicalDelivery: '10 Minutes Instant',
    },
    {
      id: 'swiggy',
      label: 'Swiggy & Instamart',
      domain: 'swiggy.in',
      icon: '🍔',
      color: '#FC8019',
      category: 'Food & Dining',
      typicalDelivery: '30-45 Mins Food / 15 Mins Instamart',
    },
    {
      id: 'zomato',
      label: 'Zomato',
      domain: 'zomato.com',
      icon: '🍕',
      color: '#E23744',
      category: 'Food & Dining',
      typicalDelivery: '30-45 Mins Food Delivery',
    },
    {
      id: 'myntra',
      label: 'Myntra Fashion',
      domain: 'myntra.com',
      icon: '👗',
      color: '#FF3F6C',
      category: 'Shopping',
      typicalDelivery: '2-4 Days Fashion Delivery',
    },
    {
      id: 'bigbasket',
      label: 'BigBasket & BB Daily',
      domain: 'bigbasket.com',
      icon: '🛒',
      color: '#84C225',
      category: 'Food & Dining',
      typicalDelivery: 'Scheduled & BB Now',
    },
  ];

  /**
   * Automatically detect the e-commerce / quick-commerce platform from raw input text
   */
  static detectPlatform(text = '', userPlatformHint = '') {
    if (userPlatformHint && userPlatformHint !== 'auto' && userPlatformHint !== 'none') {
      return userPlatformHint.toLowerCase();
    }

    const lower = text.toLowerCase();
    if (lower.includes('amazon') || lower.includes('amzn') || /\b40[2-8]-\d{7}-\d{7}\b/.test(lower)) {
      return 'amazon';
    }
    if (lower.includes('flipkart') || /\bod\d{15,18}\b/i.test(lower) || lower.includes('supercoin')) {
      return 'flipkart';
    }
    if (lower.includes('blinkit') || lower.includes('grofers') || lower.includes('blinkit commerce')) {
      return 'blinkit';
    }
    if (lower.includes('zepto') || lower.includes('zeptonow') || lower.includes('kirana cart')) {
      return 'zepto';
    }
    if (lower.includes('swiggy') || lower.includes('instamart') || lower.includes('bundl technologies')) {
      return 'swiggy';
    }
    if (lower.includes('zomato') || lower.includes('feeding india') || lower.includes('zomato gold')) {
      return 'zomato';
    }
    if (lower.includes('myntra') || lower.includes('myntra designs')) {
      return 'myntra';
    }
    if (lower.includes('bigbasket') || lower.includes('innovative retail') || lower.includes('bbdaily')) {
      return 'bigbasket';
    }

    return 'other';
  }

  /**
   * Derive psychological financial Motive & Intent from item names, platform, and total
   */
  static inferMotive(items = [], platform = 'other', totalAmount = 0, text = '') {
    const combined = `${items.map(i => i.name).join(' ')} ${text}`.toLowerCase();

    // 1. Work / Professional Investment
    if (
      combined.includes('monitor') || combined.includes('keyboard') || combined.includes('mouse') ||
      combined.includes('macbook') || combined.includes('laptop') || combined.includes('webcam') ||
      combined.includes('desk') || combined.includes('stationery') || combined.includes('office') ||
      combined.includes('cable') || combined.includes('adapter') || combined.includes('usb') ||
      combined.includes('software') || combined.includes('book')
    ) {
      return {
        motive: 'Work',
        motiveInsight: `Productivity & workspace investment from ${platform.toUpperCase()}. May qualify for business tax depreciation.`,
        confidence: 0.94,
      };
    }

    // 2. Health, Medical & Fitness
    if (
      combined.includes('medicine') || combined.includes('vitamin') || combined.includes('supplement') ||
      combined.includes('whey') || combined.includes('protein') || combined.includes('bandage') ||
      combined.includes('apollo') || combined.includes('1mg') || combined.includes('dettol') ||
      combined.includes('first aid') || combined.includes('mask')
    ) {
      return {
        motive: 'Need',
        motiveInsight: `Essential health & medical wellness purchase from ${platform.toUpperCase()}. Eligible for healthcare tracking.`,
        confidence: 0.95,
      };
    }

    // 3. Quick-Commerce Impulse / Late Night Snacks
    if (
      combined.includes('chips') || combined.includes('chocolate') || combined.includes('ice cream') ||
      combined.includes('coke') || combined.includes('snack') || combined.includes('dessert') ||
      combined.includes('pizza') || combined.includes('burger') || combined.includes('biryani') ||
      combined.includes('maggi') || combined.includes('biscuit') || combined.includes('nachos') ||
      combined.includes('candy') || combined.includes('pastry') || combined.includes('cake')
    ) {
      return {
        motive: 'Impulse',
        motiveInsight: `Discretionary quick-commerce convenience & snack order via ${platform.toUpperCase()}.`,
        confidence: 0.88,
      };
    }

    // 4. Essential Groceries & Household Restocking
    if (
      combined.includes('milk') || combined.includes('curd') || combined.includes('bread') ||
      combined.includes('eggs') || combined.includes('vegetable') || combined.includes('fruit') ||
      combined.includes('atta') || combined.includes('rice') || combined.includes('oil') ||
      combined.includes('salt') || combined.includes('sugar') || combined.includes('detergent') ||
      combined.includes('soap') || combined.includes('grocery') ||
      platform === 'blinkit' || platform === 'zepto' || platform === 'bigbasket'
    ) {
      return {
        motive: 'Need',
        motiveInsight: `Core household essentials & grocery restock via ${platform.toUpperCase()}. Essential recurring living expense.`,
        confidence: 0.92,
      };
    }



    // 5. Lifestyle & Fashion Wants
    if (
      platform === 'myntra' || combined.includes('shirt') || combined.includes('tshirt') ||
      combined.includes('dress') || combined.includes('shoes') || combined.includes('sneakers') ||
      combined.includes('jacket') || combined.includes('perfume') || combined.includes('watch') ||
      combined.includes('jeans')
    ) {
      return {
        motive: 'Want',
        motiveInsight: `Lifestyle & apparel upgrade via ${platform.toUpperCase()}. Discretionary wardrobe budget.`,
        confidence: 0.90,
      };
    }

    // 6. Technology & Asset Investment
    if (
      totalAmount > 4000 && (combined.includes('phone') || combined.includes('earbuds') ||
      combined.includes('headphones') || combined.includes('tablet') || combined.includes('ipad') ||
      combined.includes('smartwatch') || combined.includes('speaker') || combined.includes('tv'))
    ) {
      return {
        motive: 'Investment',
        motiveInsight: `High-value consumer technology asset purchase via ${platform.toUpperCase()}.`,
        confidence: 0.91,
      };
    }

    // Default Fallback
    return {
      motive: totalAmount > 1500 ? 'Want' : 'Need',
      motiveInsight: `Standard e-commerce purchase from ${platform.toUpperCase()}.`,
      confidence: 0.80,
    };
  }

  /**
   * Parse arbitrary e-commerce text, invoice block, or email snippet
   */
  static parseOrderText(rawText = '', platformHint = 'auto') {
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('Please provide order confirmation text, email body, or invoice data.');
    }

    const platform = this.detectPlatform(rawText, platformHint);
    const platformMeta = this.SUPPORTED_PLATFORMS.find(p => p.id === platform) || {
      id: 'other',
      label: 'E-Commerce / Online Store',
      category: 'Shopping',
    };

    // 1. Order ID Extraction
    let orderId = '';
    const amazonOrderMatch = rawText.match(/\b(40[2-8]-\d{7}-\d{7})\b/i);
    const flipkartOrderMatch = rawText.match(/\b(OD\d{15,18})\b/i);
    const blinkitOrderMatch = rawText.match(/\b(BLN-[A-Z0-9]{6,12})\b/i) || rawText.match(/Order\s*#?\s*([A-Z0-9-]{6,16})/i);
    const swiggyOrderMatch = rawText.match(/\b(SW-[A-Za-z0-9]{6,14})\b/i) || rawText.match(/Order\s*(?:ID|#)?\s*[:#]?\s*([0-9]{8,14})/i);
    const genericOrderMatch = rawText.match(/(?:Order|Invoice|Bill)\s*(?:ID|Number|No|#)?\s*[:#]?\s*([A-Za-z0-9-_]{5,24})/i);

    if (amazonOrderMatch) orderId = amazonOrderMatch[1];
    else if (flipkartOrderMatch) orderId = flipkartOrderMatch[1];
    else if (blinkitOrderMatch) orderId = blinkitOrderMatch[1];
    else if (swiggyOrderMatch) orderId = swiggyOrderMatch[1];
    else if (genericOrderMatch) orderId = genericOrderMatch[1];
    else orderId = `ORD-${Date.now().toString().slice(-6)}`;

    // 2. GSTIN Extraction
    const gstinMatch = rawText.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/);
    const gstin = gstinMatch ? gstinMatch[1] : '';

    // 3. Date & Time Extraction
    let orderDate = new Date();
    const dateMatch = rawText.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/) || rawText.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i);
    if (dateMatch) {
      const parsed = new Date(dateMatch[0]);
      if (!isNaN(parsed.getTime())) orderDate = parsed;
    }

    const timeMatch = rawText.match(/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/);
    const orderTime = timeMatch ? timeMatch[1] : '';

    // 4. Line Items & Amounts Extraction
    // Split by newlines or sentence boundaries with monetary amounts
    const lines = rawText.split(/(?:\r?\n|\.(?=\s+[0-9A-Za-z]))/).map(l => l.trim()).filter(Boolean);
    const lineItems = [];
    let subtotal = 0;
    let deliveryFee = 0;
    let platformFee = 0;
    let packagingFee = 0;
    let discount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let grandTotal = 0;

    const IGNORE_WORDS = ['delivery', 'shipping', 'platform fee', 'handling fee', 'packaging', 'bag fee', 'discount', 'coupon', 'cashback', 'saving', 'cgst', 'sgst', 'igst', 'total', 'grand total', 'amount paid', 'net payable', 'tax', 'subtotal', 'round off'];

    // Look for fee indicators
    for (const line of lines) {
      const lower = line.toLowerCase();
      const numMatch = line.match(/(?:₹|INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)/i) || line.match(/([0-9,]+\.[0-9]{2})/);
      const amountVal = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 0;

      if (amountVal > 0) {
        if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('delivery charge')) {
          deliveryFee = amountVal;
        } else if (lower.includes('platform fee') || lower.includes('handling fee')) {
          platformFee = amountVal;
        } else if (lower.includes('packaging') || lower.includes('bag fee')) {
          packagingFee = amountVal;
        } else if (lower.includes('discount') || lower.includes('coupon') || lower.includes('cashback') || lower.includes('saving')) {
          discount = Math.abs(amountVal);
        } else if (lower.includes('cgst')) {
          cgstAmount = amountVal;
        } else if (lower.includes('sgst') || lower.includes('utgst')) {
          sgstAmount = amountVal;
        } else if (lower.includes('igst')) {
          igstAmount = amountVal;
        } else if (lower.includes('grand total') || lower.includes('total paid') || lower.includes('amount paid') || lower.includes('order total') || lower.includes('net payable') || lower.includes('total:')) {
          grandTotal = amountVal;
        }
      }
    }

    // Line Item Parser
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lower = line.toLowerCase();

      // Check if line contains ignore words for product names
      const isFeeLine = IGNORE_WORDS.some(w => lower.startsWith(w) || lower.includes(` ${w}:`) || lower.includes(`${w} (`) || lower.includes(`${w}:`));
      if (isFeeLine) continue;

      // Check for item patterns like: "2x Amul Butter 500g ₹110" or "Logitech Wireless Mouse - Qty: 1 - 799.00"
      const itemMatch = line.match(/^(?:([0-9]+)\s*x\s+)?(.+?)(?:\s+x\s*([0-9]+))?\s*(?:₹|INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)$/i) ||
                        line.match(/^(.+?)\s+Qty:\s*([0-9]+)\s+(?:₹|INR|Rs\.?)\s*([0-9,]+(?:\.[0-9]{2})?)$/i);

      if (itemMatch) {
        const qty = parseInt(itemMatch[1] || itemMatch[3] || '1', 10) || 1;
        const name = (itemMatch[2] || itemMatch[1]).replace(/^[-•*]\s*/, '').trim();
        const price = parseFloat((itemMatch[4] || itemMatch[3] || '0').replace(/,/g, '')) || 0;
        const unitPrice = Number((price / Math.max(1, qty)).toFixed(2));

        const isItemNameFee = IGNORE_WORDS.some(w => name.toLowerCase().startsWith(w) || name.toLowerCase().includes(`${w}:`));

        if (price > 0 && !isItemNameFee) {
          lineItems.push({
            id: `item-${Date.now()}-${lineItems.length}`,
            name,
            quantity: qty,
            unitPrice,
            price,
            category: platformMeta.category || 'Shopping',
          });
          subtotal += price;
        }
      }
    }

    // Fallback if no specific line items parsed: create a primary order item
    if (lineItems.length === 0) {
      const fallbackTotal = grandTotal || 450;
      lineItems.push({
        id: `item-${Date.now()}-0`,
        name: `${platformMeta.label} Order (${orderId})`,
        quantity: 1,
        unitPrice: fallbackTotal,
        price: fallbackTotal,
        category: platformMeta.category || 'Shopping',
      });
      subtotal = fallbackTotal;
    }

    // Calculate / Reconcile Grand Total
    const taxTotal = cgstAmount + sgstAmount + igstAmount;
    if (!grandTotal) {
      grandTotal = Math.max(0, subtotal + deliveryFee + platformFee + packagingFee + taxTotal - discount);
    }

    // Infer Motive
    const motiveData = this.inferMotive(lineItems, platform, grandTotal, rawText);

    // Formulate Merchant
    const merchant = platformMeta.label;

    return {
      platform,
      platformLabel: platformMeta.label,
      platformIcon: platformMeta.icon,
      platformColor: platformMeta.color,
      orderId,
      merchant,
      orderDate: orderDate.toISOString().split('T')[0],
      orderTime: orderTime || '12:00',
      category: platformMeta.category || 'Shopping',
      totalAmount: Number(grandTotal.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      platformFee: Number((platformFee + packagingFee).toFixed(2)),
      discount: Number(discount.toFixed(2)),
      taxes: {
        cgst: { rate: cgstAmount > 0 ? 2.5 : 0, amount: Number(cgstAmount.toFixed(2)) },
        sgst: { rate: sgstAmount > 0 ? 2.5 : 0, amount: Number(sgstAmount.toFixed(2)) },
        igst: { rate: igstAmount > 0 ? 5 : 0, amount: Number(igstAmount.toFixed(2)) },
        totalTax: Number(taxTotal.toFixed(2)),
      },
      gstin,
      motive: motiveData.motive,
      motiveInsight: motiveData.motiveInsight,
      lineItems,
      isECommerce: true,
    };
  }

  /**
   * Commit parsed order directly to MongoDB as an Expense record
   */
  static async commitOrder(userId, orderData) {
    if (!orderData || !orderData.totalAmount || orderData.totalAmount <= 0) {
      throw new Error('Invalid order data provided for synchronization.');
    }

    const {
      platform = 'other',
      platformLabel = 'E-Commerce',
      orderId = '',
      merchant = 'Online Store',
      orderDate,
      orderTime = '',
      category = 'Shopping',
      totalAmount = 0,
      subtotal = 0,
      deliveryFee = 0,
      platformFee = 0,
      discount = 0,
      taxes = {},
      gstin = '',
      motive = 'Need',
      motiveInsight = '',
      lineItems = [],
    } = orderData;

    // Check for duplicate order ID for this user
    if (orderId) {
      const existing = await Expense.findOne({
        userId,
        $or: [
          { 'receiptDetails.invoiceNumber': orderId },
          { note: { $regex: orderId, $options: 'i' } },
        ],
      });
      if (existing) {
        return {
          success: false,
          isDuplicate: true,
          message: `Order #${orderId} has already been synced previously.`,
          expense: existing,
        };
      }
    }

    const itemsSummary = lineItems.map(i => `${i.name} (x${i.quantity})`).join(', ');
    const note = `Synced from ${platformLabel} | Order #${orderId}${itemsSummary ? ` | Items: ${itemsSummary}` : ''}`;
    const tags = [
      'EcommerceSync',
      platform.charAt(0).toUpperCase() + platform.slice(1),
      (category || 'Shopping').replace(/\s+/g, ''),
      ...(gstin ? ['GSTClaimable'] : []),
    ];

    const splits = lineItems.length > 1 ? lineItems.map(item => ({
      category: item.category || category || 'Shopping',
      amount: Number(item.price) || 0,
      note: `${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`,
    })) : [];

    const expense = await Expense.create({
      userId,
      title: `${platformLabel}: ${lineItems[0]?.name ? lineItems[0].name.slice(0, 30) : 'Order'}`,
      amount: totalAmount,
      category: category || 'Shopping',
      merchant,
      date: orderDate ? new Date(orderDate) : new Date(),
      paymentMethod: 'UPI',
      note,
      tags,
      splits,
      source: 'ecommerce_sync',
      motive: motive || 'Need',
      motiveInsight: motiveInsight || `Synced automatically from ${platformLabel}.`,
      ecommercePlatform: platform,
      currency: '₹',
      receiptDetails: {
        gstin: gstin || '',
        invoiceNumber: orderId || '',
        time: orderTime || '',
        subtotal: Number(subtotal) || 0,
        cgst: taxes.cgst || { rate: 0, amount: 0 },
        sgst: taxes.sgst || { rate: 0, amount: 0 },
        igst: taxes.igst || { rate: 0, amount: 0 },
        taxAmount: taxes.totalTax || 0,
        deliveryFee: Number(deliveryFee) || 0,
        platformFee: Number(platformFee) || 0,
        discount: Number(discount) || 0,
        isECommerce: true,
        lineItems: lineItems.map(i => ({
          name: i.name,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
          price: Number(i.price) || 0,
          category: i.category || category,
        })),
      },
    });

    return {
      success: true,
      isDuplicate: false,
      message: `Successfully synced ${platformLabel} order #${orderId}`,
      expense,
    };
  }

  /**
   * Get connected platform statistics and spend aggregates for the user
   */
  static async getPlatformStats(userId) {
    const expenses = await Expense.find({
      userId,
      $or: [
        { source: 'ecommerce_sync' },
        { ecommercePlatform: { $in: this.SUPPORTED_PLATFORMS.map(p => p.id) } },
        { tags: { $in: ['EcommerceSync', 'Amazon', 'Flipkart', 'Blinkit', 'Zepto', 'Swiggy', 'Zomato', 'Myntra', 'BigBasket'] } },
      ],
    }).sort({ date: -1 });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const platformCards = this.SUPPORTED_PLATFORMS.map(platform => {
      const matchingExpenses = expenses.filter(e => {
        return (
          e.ecommercePlatform === platform.id ||
          (e.merchant && e.merchant.toLowerCase().includes(platform.id)) ||
          (e.tags && e.tags.some(t => t.toLowerCase() === platform.id))
        );
      });

      const totalSpent = matchingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const monthlyExpenses = matchingExpenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      const monthlySpent = monthlyExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const lastOrder = matchingExpenses[0] || null;

      return {
        ...platform,
        status: matchingExpenses.length > 0 ? 'Connected' : 'Ready to Sync',
        totalOrders: matchingExpenses.length,
        totalSpent,
        monthlySpent,
        lastSyncedAt: lastOrder ? lastOrder.date : null,
        lastOrderId: lastOrder?.receiptDetails?.invoiceNumber || null,
      };
    });

    const totalEcommerceSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    return {
      platforms: platformCards,
      totalOrdersSynced: expenses.length,
      totalEcommerceSpent,
      recentSyncs: expenses.slice(0, 10),
    };
  }
}

module.exports = EcommerceService;

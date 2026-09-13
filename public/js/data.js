/* ============================================================
   KIDAMEgebeya — Mock catalog data
   All prices in USD. Images use Unsplash with SVG fallback.
   ============================================================ */

var CATEGORIES = [
  { id: 'electronics', name: 'Electronics', tagline: 'Audio, wearables & smart gear',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80&auto=format&fit=crop' },
  { id: 'fashion', name: 'Fashion', tagline: 'Apparel built for every day',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80&auto=format&fit=crop' },
  { id: 'home', name: 'Home & Living', tagline: 'Furniture, lighting & decor',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80&auto=format&fit=crop' },
  { id: 'beauty', name: 'Beauty & Care', tagline: 'Fragrance, skin & self-care',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900&q=80&auto=format&fit=crop' },
  { id: 'sports', name: 'Sports & Fitness', tagline: 'Train harder, recover better',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&auto=format&fit=crop' },
  { id: 'accessories', name: 'Accessories', tagline: 'Watches, bags & eyewear',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80&auto=format&fit=crop' },
];

var PRODUCTS = [
  /* ---------- Electronics ---------- */
  {
    id: 'aurora-headphones', name: 'Aurora Wireless Headphones', category: 'electronics', brand: 'KIDAMEgebeya Audio',
    price: 249, oldPrice: 299, rating: 4.8, reviewsCount: 1284, stock: 42, featured: true, tag: 'bestseller',
    colors: ['Midnight Black', 'Cloud White', 'Sunset Orange'],
    description: 'Award-winning noise cancelling, 40-hour battery life and studio-grade drivers in a featherweight frame. Aurora delivers immersive sound that travels with you.',
    specs: [['Driver', '40mm dynamic'], ['Battery', '40h (ANC on)'], ['Bluetooth', '5.3'], ['ANC', 'Adaptive hybrid'], ['Weight', '254 g'], ['Charging', 'USB-C / Qi']],
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'pulse-smartwatch', name: 'Pulse Smartwatch Series 5', category: 'electronics', brand: 'KIDAMEgebeya Wear',
    price: 179, oldPrice: 229, rating: 4.6, reviewsCount: 862, stock: 58, featured: true, tag: null,
    colors: ['Graphite', 'Silver', 'Rose Gold'],
    description: 'Track workouts, sleep and heart health with a vivid always-on AMOLED display. GPS enabled and water resistant to 50m, with a 7-day battery.',
    specs: [['Display', '1.4" AMOLED'], ['Battery', '7 days'], ['Sensors', 'HR, SpO2, Temp'], ['GPS', 'Dual-band'], ['Water rating', '5 ATM']],
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'nimbus-earbuds', name: 'Nimbus Earbuds Pro', category: 'electronics', brand: 'KIDAMEgebeya Audio',
    price: 99, oldPrice: 149, rating: 4.7, reviewsCount: 1976, stock: 120, featured: true, tag: 'deal',
    colors: ['Matte Black', 'Pearl White'],
    description: 'True wireless earbuds with hybrid ANC, a transparency mode and wireless charging case. Six mics for crystal-clear calls in any environment.',
    specs: [['Drivers', '11mm neodymium'], ['Battery', '8h + 30h case'], ['ANC', 'Hybrid'], ['Codecs', 'AAC, aptX'], ['Case', 'Qi wireless']],
    images: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'vertex-camera', name: 'Vertex Mirrorless Camera X100', category: 'electronics', brand: 'Vertex',
    price: 899, oldPrice: null, rating: 4.9, reviewsCount: 312, stock: 18, featured: false, tag: 'new',
    colors: ['Carbon Black'],
    description: 'A compact full-frame mirrorless with 33MP sensor, 5-axis stabilization and razor-fast autofocus. The everyday camera that never gets in the way.',
    specs: [['Sensor', 'Full-frame 33MP'], ['ISO', '100–51,200'], ['Burst', '15 fps'], ['Stabilization', '5-axis IBIS'], ['Video', '4K60 10-bit']],
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495707902641-75cac588d2e9?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'lumen-speaker', name: 'Lumen Portable Speaker', category: 'electronics', brand: 'KIDAMEgebeya Audio',
    price: 79, oldPrice: null, rating: 4.4, reviewsCount: 546, stock: 74, featured: false, tag: null,
    colors: ['Graphite', 'Sage', 'Cobalt'],
    description: 'A 360° portable speaker with deep bass, IP67 waterproofing and 20 hours of playtime. Take the party anywhere.',
    specs: [['Output', '30W RMS'], ['Battery', '20 hours'], ['Rating', 'IP67'], ['Connect', 'Bluetooth 5.3'], ['Multi', 'Pair up to 2']],
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'orbit-charger', name: 'Orbit Wireless Charger', category: 'electronics', brand: 'KIDAMEgebeya Access',
    price: 39, oldPrice: 49, rating: 4.2, reviewsCount: 921, stock: 210, featured: false, tag: null,
    colors: ['White', 'Black'],
    description: 'Fast-charge your phone, earbuds and watch at once with a single sleek pad. 15W Qi-certified with foreign-object detection.',
    specs: [['Output', '15W max'], ['Standard', 'Qi 1.3'], ['Device', '3 in 1'], ['Cable', 'USB-C included']],
    images: [
      'https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=80&auto=format&fit=crop',
    ],
  },

  /* ---------- Fashion ---------- */
  {
    id: 'essential-tee', name: 'Essential Crew T-Shirt', category: 'fashion', brand: 'KIDAMEgebeya Basics',
    price: 29, oldPrice: 39, rating: 4.5, reviewsCount: 3421, stock: 240, featured: false, tag: 'bestseller',
    colors: ['White', 'Black', 'Heather Grey', 'Sage'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    description: 'The perfect everyday tee in heavyweight 220gsm organic cotton. A clean, structured fit that holds its shape wash after wash.',
    specs: [['Material', '220gsm organic cotton'], ['Fit', 'Regular'], ['Neck', 'Ribbed crew'], ['Cert', 'GOTS organic']],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'urban-denim-jacket', name: 'Urban Denim Jacket', category: 'fashion', brand: 'KIDAMEgebeya Studio',
    price: 119, oldPrice: 159, rating: 4.7, reviewsCount: 733, stock: 36, featured: true, tag: 'new',
    colors: ['Indigo', 'Washed Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'A modern take on a timeless classic. Japanese selvedge denim with a soft interior lining and carefully faded finish that gets better with age.',
    specs: [['Material', '13oz selvedge denim'], ['Lining', 'Chest & collar'], ['Fit', 'Tailored'], ['Buttons', 'Corozo nut']],
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'velocity-sneakers', name: 'Velocity Runner Sneakers', category: 'fashion', brand: 'KIDAMEgebeya Sport',
    price: 129, oldPrice: 179, rating: 4.6, reviewsCount: 1540, stock: 88, featured: true, tag: 'deal',
    colors: ['Cloud White', 'Triple Black', 'Bone'],
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    description: 'A featherlight everyday runner with a responsive foam midsole and breathable knit upper. Comfort that carries from sunrise to sunset.',
    specs: [['Upper', 'Engineered knit'], ['Midsole', 'EVA-foam blend'], ['Outsole', 'Gum rubber'], ['Drop', '8 mm']],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'minimal-hoodie', name: 'Minimal Heavyweight Hoodie', category: 'fashion', brand: 'KIDAMEgebeya Basics',
    price: 69, oldPrice: 89, rating: 4.5, reviewsCount: 1187, stock: 130, featured: false, tag: null,
    colors: ['Oatmeal', 'Charcoal', 'Forest', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'A 450gsm brushed-back fleece hoodie with a double-lined hood and dropped shoulders. Warm, soft and unbelievably comfortable.',
    specs: [['Material', '450gsm fleece'], ['Fit', 'Oversized'], ['Pocket', 'Kangaroo'], ['Hood', 'Double-lined']],
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'classic-jeans', name: 'Classic Slim-Fit Jeans', category: 'fashion', brand: 'KIDAMEgebeya Studio',
    price: 79, oldPrice: null, rating: 4.4, reviewsCount: 865, stock: 96, featured: false, tag: null,
    colors: ['Midwash Blue', 'Black'],
    sizes: ['28', '30', '32', '34', '36', '38'],
    description: 'A versatile slim-fit jean in stretch denim with just the right amount of give. Five-pocket styling, clean lines, endless outfit combinations.',
    specs: [['Material', '98% cotton, 2% elastane'], ['Fit', 'Slim straight'], ['Rise', 'Mid'], ['Wash', 'Enzyme stonewash']],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'canvas-cap', name: 'Everyday Canvas Cap', category: 'fashion', brand: 'KIDAMEgebeya Basics',
    price: 24, oldPrice: null, rating: 4.1, reviewsCount: 402, stock: 200, featured: false, tag: null,
    colors: ['Sand', 'Olive', 'Black'],
    sizes: ['One Size'],
    description: 'A structured six-panel cap in durable canvas with an adjustable brass buckle. Your new everyday favourite.',
    specs: [['Material', 'Canvas cotton'], ['Closure', 'Brass buckle'], ['Crown', 'Structured']],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=900&q=80&auto=format&fit=crop',
    ],
  },

  /* ---------- Home & Living ---------- */
  {
    id: 'nordic-chair', name: 'Nordic Lounge Chair', category: 'home', brand: 'KIDAMEgebeya Living',
    price: 299, oldPrice: 399, rating: 4.8, reviewsCount: 214, stock: 15, featured: true, tag: 'bestseller',
    colors: ['Natural Oak', 'Walnut'],
    description: 'A sculptural lounge chair in solid oak with a sculpted ply backrest. Minimalist silhouette, maximum comfort — designed to be lived in.',
    specs: [['Frame', 'Solid oak'], ['Backrest', 'Molded ply'], ['Finish', 'Natural oil'], ['Capacity', '140 kg'], ['Assembly', 'None']],
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'studio-lamp', name: 'Studio Floor Lamp', category: 'home', brand: 'KIDAMEgebeya Living',
    price: 149, oldPrice: 189, rating: 4.6, reviewsCount: 388, stock: 27, featured: false, tag: null,
    colors: ['Matte Black', 'Brass'],
    description: 'A floor lamp with a dimmable head that arcs into the perfect reading position. Sculptural from every angle.',
    specs: [['Height', '158 cm'], ['Bulb', 'LED (included)'], ['Dimming', 'Touch 3-step'], ['Base', 'Marble']],
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534289692684-c02577d5560d?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'aero-desk-lamp', name: 'Aero Adjustable Desk Lamp', category: 'home', brand: 'KIDAMEgebeya Living',
    price: 59, oldPrice: 79, rating: 4.3, reviewsCount: 512, stock: 64, featured: false, tag: null,
    colors: ['Black', 'Silver'],
    description: 'A fully adjustable desk lamp with flicker-free warm light, USB-C charging port and a memory-preserving touch sensor.',
    specs: [['Modes', '5 brightness / 3 temps'], ['Charging', 'USB-C on base'], ['CCT', '3000–5000K'], ['Arm', '3-point pivot']],
    images: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'stoneware-set', name: 'Stoneware Dinner Set (16pc)', category: 'home', brand: 'KIDAMEgebeya Table',
    price: 89, oldPrice: null, rating: 4.5, reviewsCount: 276, stock: 41, featured: false, tag: null,
    colors: ['Sand', 'Slate', 'Wheat'],
    description: 'A handmade-reactive stoneware set for four. Each piece is glazed by hand, so every plate has its own subtle character.',
    specs: [['Pieces', '16 (service for 4)'], ['Material', 'Reactive stoneware'], ['Care', 'Dishwasher safe'], ['Finish', 'Hand-glazed']],
    images: [
      'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'woven-throw', name: 'Woven Cotton Throw Blanket', category: 'home', brand: 'KIDAMEgebeya Living',
    price: 49, oldPrice: 69, rating: 4.4, reviewsCount: 689, stock: 150, featured: false, tag: null,
    colors: ['Oatmeal', 'Terracotta', 'Grey'],
    description: 'A lightweight woven throw in 100% cotton with hand-knotted fringe. Layer it on your sofa, or wrap up your mornings.',
    specs: [['Size', '130 x 170 cm'], ['Material', '100% cotton'], ['Weave', 'Herringbone'], ['Care', 'Machine wash']],
    images: [
      'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'smart-bulb', name: 'Glow Smart Bulb Trio', category: 'home', brand: 'KIDAMEgebeya Smart',
    price: 34, oldPrice: 45, rating: 4.2, reviewsCount: 987, stock: 300, featured: false, tag: null,
    colors: ['Warm + Color'],
    description: 'Three WiFi smart bulbs with 16 million colors, smooth dimming and voice control. Set the mood from your phone.',
    specs: [['Pack', '3 bulbs'], ['Brightness', '1100 lm'], ['Protocol', 'WiFi 2.4GHz'], ['Compatible', 'Alexa, HomeKit']],
    images: [
      'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=900&q=80&auto=format&fit=crop',
    ],
  },

  /* ---------- Beauty & Care ---------- */
  {
    id: 'velvet-parfum', name: 'Velvet Eau de Parfum 50ml', category: 'beauty', brand: 'KIDAMEgebeya Maison',
    price: 95, oldPrice: 120, rating: 4.8, reviewsCount: 511, stock: 62, featured: true, tag: 'bestseller',
    colors: ['50 ml'],
    description: 'A warm, addictive blend of amber, vanilla and smoked cedar. Long-lasting and enveloping, made to be your signature scent.',
    specs: [['Size', '50 ml'], ['Notes', 'Amber, vanilla, cedar'], ['Longevity', '8+ hours'], ['Cruelty-free', 'Yes']],
    images: [
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'hydra-glow-serum', name: 'Hydra Glow Vitamin C Serum', category: 'beauty', brand: 'KIDAMEgebeya Skincare',
    price: 54, oldPrice: 72, rating: 4.7, reviewsCount: 1402, stock: 95, featured: true, tag: 'new',
    colors: ['30 ml'],
    description: 'A brightening 15% vitamin C serum with hyaluronic acid and ferulic acid. Reveals a smoother, more radiant complexion in four weeks.',
    specs: [['Size', '30 ml'], ['Key actives', '15% Vit C, HA, Ferulic'], ['Skin type', 'All'], ['Tip', 'Use AM']],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'botanical-set', name: 'Botanical Skincare Set', category: 'beauty', brand: 'KIDAMEgebeya Skincare',
    price: 129, oldPrice: 165, rating: 4.6, reviewsCount: 388, stock: 48, featured: false, tag: 'deal',
    colors: ['Gift set'],
    description: 'The complete ritual: cleanser, toner, serum and moisturizer formulated with botanical actives. Your skin, minus the guesswork.',
    specs: [['Pieces', '4-step ritual'], ['Key actives', 'Niacinamide, squalane, ceramides'], ['Skin type', 'Normal to dry'], ['Gift-ready', 'Yes']],
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'silk-conditioner', name: 'Silk Repair Conditioner', category: 'beauty', brand: 'KIDAMEgebeya Hair',
    price: 34, oldPrice: null, rating: 4.3, reviewsCount: 759, stock: 140, featured: false, tag: null,
    colors: ['500 ml'],
    description: 'A reparative conditioner enriched with silk proteins and argan oil to smooth frizz and restore shine without weight.',
    specs: [['Size', '500 ml'], ['Key actives', 'Silk protein, argan oil'], ['Safe for', 'Color-treated hair'], ['Vegan', 'Yes']],
    images: [
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1552308995-2baac1ad5490?w=900&q=80&auto=format&fit=crop',
    ],
  },

  /* ---------- Sports & Fitness ---------- */
  {
    id: 'progrip-dumbbells', name: 'ProGrip Adjustable Dumbbell Set', category: 'sports', brand: 'KIDAMEgebeya Fit',
    price: 189, oldPrice: 249, rating: 4.7, reviewsCount: 421, stock: 30, featured: true, tag: 'bestseller',
    colors: ['Matte Black'],
    description: 'Replace an entire rack with a single pair. Adjusts from 5–52.5 lbs in seconds with a contoured, knurled-grip handle.',
    specs: [['Range', '5 – 52.5 lbs each'], ['Adjust', 'Dial, 1-step'], ['Grip', 'Knurled steel'], ['Stand', 'Included']],
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'flex-yoga-mat', name: 'Flex Yoga Mat Pro', category: 'sports', brand: 'KIDAMEgebeya Fit',
    price: 59, oldPrice: 79, rating: 4.5, reviewsCount: 923, stock: 110, featured: false, tag: null,
    colors: ['Midnight', 'Terracotta', 'Sage'],
    description: 'A 6mm alignment mat with extra cushioning and slip-resistant texture on both sides, plus a carrying strap.',
    specs: [['Thickness', '6 mm'], ['Material', 'Natural rubber'], ['Sizes', '183 x 68 cm'], ['Strap', 'Included']],
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'hydraflask-bottle', name: 'HydraFlask 1000ml Bottle', category: 'sports', brand: 'KIDAMEgebeya Active',
    price: 34, oldPrice: null, rating: 4.6, reviewsCount: 1547, stock: 260, featured: false, tag: null,
    colors: ['Matte Black', 'Steel', 'Coral'],
    description: 'Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12. Powder-coated, leak-proof and dishwasher-safe.',
    specs: [['Capacity', '1 L'], ['Insulation', '24h cold / 12h hot'], ['Material', '18/8 steel'], ['Care', 'Dishwasher safe']],
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'trail-runner-shirt', name: 'Trail Dry-Fit Running Tee', category: 'sports', brand: 'KIDAMEgebeya Sport',
    price: 39, oldPrice: 49, rating: 4.4, reviewsCount: 611, stock: 170, featured: false, tag: null,
    colors: ['Arctic', 'Volt', 'Black'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    description: 'Featherlight moisture-wicking top with flatlock seams and reflective details for early morning miles.',
    specs: [['Material', 'Recycled polyester'], ['Weight', '98 g'], ['Features', 'Reflective, anti-odor'], ['Fit', 'Athletic']],
    images: [
      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=900&q=80&auto=format&fit=crop',
    ],
  },

  /* ---------- Accessories ---------- */
  {
    id: 'aviator-sunglasses', name: 'Aviator Sunglasses Gold', category: 'accessories', brand: 'KIDAMEgebeya Eyewear',
    price: 89, oldPrice: 119, rating: 4.4, reviewsCount: 844, stock: 75, featured: false, tag: 'deal',
    colors: ['Gold / Green', 'Black / Grey'],
    description: 'Classic aviators with polarized lenses, anti-scratch coating and a secure, comfortable fit. Timeless style, modern protection.',
    specs: [['Lens', 'Polarized, UV400'], ['Frame', 'Metal alloy'], ['Weight', '31 g'], ['Case', 'Hard shell']],
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'heritage-leather-bag', name: 'Heritage Leather Tote Bag', category: 'accessories', brand: 'KIDAMEgebeya Studio',
    price: 249, oldPrice: 329, rating: 4.9, reviewsCount: 356, stock: 22, featured: true, tag: 'bestseller',
    colors: ['Tan', 'Black'],
    description: 'Full-grain vegetable-tanned leather that develops a beautiful patina over time. Hand-stitched, with an interior laptop sleeve.',
    specs: [['Material', 'Full-grain leather'], ['Interior', 'Laptop sleeve + zip'], ['Strap', 'Adjustable'], ['Care', 'Condition annually']],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'chronograph-watch', name: 'Momentum Chronograph Watch', category: 'accessories', brand: 'KIDAMEgebeya Horology',
    price: 349, oldPrice: 449, rating: 4.7, reviewsCount: 298, stock: 19, featured: true, tag: 'new',
    colors: ['Steel / Blue', 'Steel / Black'],
    description: 'A Japanese automatic movement inside a 41mm sapphire-crowned case. Water resistant to 100m with a date complication.',
    specs: [['Movement', 'Automatic'], ['Case', '41mm stainless steel'], ['Glass', 'Sapphire'], ['Water', '100 m'], ['Strap', 'Steel bracelet']],
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=900&q=80&auto=format&fit=crop',
    ],
  },
  {
    id: 'weekend-backpack', name: 'Weekend Travel Backpack 25L', category: 'accessories', brand: 'KIDAMEgebeya Studio',
    price: 119, oldPrice: 149, rating: 4.6, reviewsCount: 731, stock: 54, featured: false, tag: null,
    colors: ['Dark Olive', 'Black'],
    description: 'A water-repellent 25L backpack with a padded 16" laptop sleeve, luggage pass-through and hidden anti-theft pocket.',
    specs: [['Capacity', '25 L'], ['Laptop', 'Up to 16"'], ['Material', 'Recycled nylon'], ['Extras', 'Luggage strap, USB port']],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80&auto=format&fit=crop',
    ],
  },
];

const TESTIMONIALS = [
  { name: 'Chloe Martinez', role: 'Verified Buyer', rating: 5,
    quote: 'The Aurora headphones are the best I have owned. The sound is incredible and the delivery was lightning fast.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop' },
  { name: 'Daniel Okafor', role: 'Daily Shopper', rating: 5,
    quote: 'Quality control is clearly taken seriously here. Every item I have ordered arrived perfect and well packaged.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop' },
  { name: 'Sophie Lindqvist', role: 'Loyal Customer', rating: 5,
    quote: 'The leather tote is stunning — looks twice the price. This is now my default store for gifts and treats.',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80&auto=format&fit=crop' },
  { name: 'Marcus Chen', role: 'Verified Buyer', rating: 4,
    quote: 'Easy checkout, great filters, and the smartwatch arrived two days early. Customer support answered in minutes.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop' },
  { name: 'Ava Thompson', role: 'Interior Designer', rating: 5,
    quote: 'I furnished a whole studio from their home collection. Consistent quality and beautiful minimal design.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop' },
  { name: 'Liam O\'Brien', role: 'Verified Buyer', rating: 5,
    quote: 'From browsing to doorstep in under three days. The buy-now flow is smoother than any store I have used.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80&auto=format&fit=crop' },
];

const REVIEW_AUTHORS = [
  { name: 'Jordan P.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80&auto=format&fit=crop' },
  { name: 'Priya S.', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&q=80&auto=format&fit=crop' },
  { name: 'Theo M.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80&auto=format&fit=crop' },
  { name: 'Nina K.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80&auto=format&fit=crop' },
  { name: 'Sam W.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop' },
];

const REVIEW_TEMPLATES = (name) => [
  `Absolutely love the ${name}. Quality far exceeds the price and it arrived beautifully packaged.`,
  `I have bought from KIDAMEgebeya before and this is easily one of my favourite purchases yet. Highly recommend.`,
  `Solid build, fast shipping, exactly as described in the listing. Would buy again without hesitation.`,
  `Took a couple of days to decide but so glad I did. Great value and the customer service is top notch.`,
  `Looks even better in person than in the photos. The design language of this brand is fantastic.`,
];

/* ---------- Helpers ---------- */
const getProduct = (id) => globalThis.PRODUCTS.find((p) => p.id === id);
const getCategory = (id) => globalThis.CATEGORIES.find((c) => c.id === id);

function relatedProducts(product, limit = 4) {
  const sameCat = globalThis.PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id);
  const others = globalThis.PRODUCTS.filter((p) => p.category !== product.category && p.id !== product.id);
  return [...sameCat, ...others].slice(0, limit);
}

function generateReviews(product, count = 4) {
  const reviews = [];
  for (let i = 0; i < count; i++) {
    const author = REVIEW_AUTHORS[i % REVIEW_AUTHORS.length];
    const rating = Math.max(3, Math.min(5, Math.round(product.rating) + (i % 2 === 0 ? 0 : -1)));
    const daysAgo = (i * 13 + 3 + product.id.length) % 60;
    reviews.push({
      author: author.name,
      avatar: author.avatar,
      rating,
      title: rating >= 5 ? 'Could not be happier' : rating === 4 ? 'Really good, minor quibbles' : 'Meets expectations',
      text: REVIEW_TEMPLATES(product.name)[i % REVIEW_TEMPLATES(product.name).length],
      date: new Date(Date.now() - daysAgo * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      verified: i % 3 !== 2,
    });
  }
  return reviews;
}
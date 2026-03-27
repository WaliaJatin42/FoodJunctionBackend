const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Vendor = require("./models/Vendor");
const InventoryItem = require("./models/InventoryItem");
const Product = require("./models/Product");
const Category = require("./models/Category");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const vendorsArray = [
  {
    name: "Fresh Farms Dairy",
    phone: "9876543210",
    contactPerson: "Raju",
    email: "raju@freshfarms.com",
    address: "Plot 12, Industrial Area",
  },
  {
    name: "Spice Route Suppliers",
    phone: "9876543211",
    contactPerson: "Amit",
    email: "amit@spiceroute.com",
    address: "Old Market Line 4",
  },
  {
    name: "Prem Meat Shop",
    phone: "9876543212",
    contactPerson: "Prem",
    email: "prem@meatshop.com",
    address: "Sector 14 Market",
  },
  {
    name: "Global Produce Co",
    phone: "9876543213",
    contactPerson: "Sonia",
    email: "sonia@globalproduce.com",
    address: "Highway Exit 9",
  },
  {
    name: "City Bakery Ingredients",
    phone: "9876543214",
    contactPerson: "Rajiv",
    email: "bulk@citybakery.com",
    address: "Downtown Plaza",
  },
  {
    name: "Oceans Seafood Hub",
    phone: "9876543215",
    contactPerson: "Vikram",
    email: "fish@oceans.com",
    address: "Coastal Highway",
  },
  {
    name: "Imported Exotics Ltd",
    phone: "9876543216",
    contactPerson: "Anita",
    email: "anita@exotics.com",
    address: "Airport Cargo Road",
  },
];

// Expanded 100+ ingredient groups organized cleanly by type for heuristic mapping
const ingredientGroups = {
  general: [
    "Salt",
    "Black Pepper",
    "Water",
    "Sugar",
    "Cooking Oil",
    "Onions",
    "Garlic",
    "Tomatoes",
    "Flour",
    "Eggs",
    "Butter",
    "Lemon",
    "Vinegar",
  ],
  dairy: [
    "Milk",
    "Cheddar Cheese",
    "Mozzarella",
    "Parmesan",
    "Cream",
    "Yogurt",
    "Ghee",
    "Paneer",
    "Condensed Milk",
  ],
  meats: [
    "Chicken Breast",
    "Mutton",
    "Beef",
    "Pork",
    "Bacon",
    "Sausage",
    "Lamb Chops",
    "Minced Meat",
  ],
  seafood: [
    "Salmon",
    "Tuna",
    "Prawns",
    "Squid",
    "Crab",
    "Fish Fillets",
    "Octopus",
  ],
  spices_indian: [
    "Turmeric",
    "Cumin",
    "Coriander Powder",
    "Red Chili Powder",
    "Garam Masala",
    "Cardamom",
    "Cloves",
    "Cinnamon",
    "Mustard Seeds",
    "Curry Leaves",
  ],
  herbs_european: [
    "Basil",
    "Oregano",
    "Rosemary",
    "Thyme",
    "Parsley",
    "Sage",
    "Dill",
  ],
  asian_staples: [
    "Soy Sauce",
    "Nuoc Mam",
    "Rice Vinegar",
    "Sesame Oil",
    "Miso Paste",
    "Ginger",
    "Spring Onions",
    "Tofu",
    "Bamboo Shoots",
    "Seaweed (Nori)",
  ],
  mexican_staples: [
    "Tortillas",
    "Jalapenos",
    "Black Beans",
    "Avocado",
    "Cilantro",
    "Lime",
    "Sour Cream",
    "Cumin",
  ],
  dessert_baking: [
    "Cocoa Powder",
    "Vanilla Extract",
    "Baking Powder",
    "Yeast",
    "Chocolate Chips",
    "Honey",
    "Maple Syrup",
    "Almonds",
    "Walnuts",
  ],
  beverages: [
    "Coffee Beans",
    "Tea Leaves",
    "Matcha Powder",
    "Ice",
    "Soda Water",
    "Mint Leaves",
    "Fruit Syrups",
    "Cocoa",
    "Mangoes",
    "Strawberries",
  ],
};

// Squish together for mass DB creation
const allIngredientsList = [].concat(...Object.values(ingredientGroups));

const seedInventory = async () => {
  try {
    console.log("Clearing old inventory/vendors data specifically...");
    await Vendor.deleteMany({});
    await InventoryItem.deleteMany({});

    // 1. Create 7 Massive Vendors
    const vendorDocs = await Vendor.insertMany(vendorsArray);

    // 2. Transcribe 100+ Ingredients randomly assigning their generic vendors
    const inventoryMap = {};
    for (const item of allIngredientsList) {
      const randomVendor =
        vendorDocs[Math.floor(Math.random() * vendorDocs.length)];
      const inv = await InventoryItem.create({
        name: item,
        quantity: Math.floor(Math.random() * (1000 - 50 + 1) + 50), // Generates 50 to 1000 units easily
        unit: "kg/L/units",
        minStockLevel: 25,
        vendor: randomVendor._id,
      });
      inventoryMap[item] = inv;
    }

    console.log(
      `Created ${vendorDocs.length} Vendors and loaded ${Object.keys(inventoryMap).length} Unified Supply Chain Ingredients!`,
    );

    const getRandom = (arr, n) => {
      let result = new Array(n),
        len = arr.length,
        taken = new Array(len);
      if (n > len) return arr;
      while (n--) {
        let x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
      }
      return result;
    };

    // 3. Map ingredients logically correlating back to products
    const products = await Product.find().populate("category");
    console.log(
      `Recursively mapping granular inventory back into ${products.length} Products...`,
    );

    let updatedCount = 0;
    for (const prod of products) {
      if (!prod.category) continue; // Protect runtime
      const categoryName = prod.category.name;
      const productName = prod.name.toLowerCase();

      let basePool = [...ingredientGroups.general]; // Basic staples

      // Categorical/Lexical heuristic inclusions mapping the massive 100+ ingredient pools accurately
      if (categoryName.includes("Indian"))
        basePool.push(
          ...ingredientGroups.spices_indian,
          ...ingredientGroups.dairy,
        );
      if (categoryName.includes("Italian") || categoryName.includes("French"))
        basePool.push(
          ...ingredientGroups.herbs_european,
          ...ingredientGroups.dairy,
        );
      if (
        categoryName.includes("Chinese") ||
        categoryName.includes("Japanese") ||
        categoryName.includes("Thai") ||
        categoryName.includes("Korean") ||
        categoryName.includes("Vietnamese")
      )
        basePool.push(...ingredientGroups.asian_staples);
      if (categoryName.includes("Mexican"))
        basePool.push(...ingredientGroups.mexican_staples);
      if (
        categoryName.includes("Beverages") ||
        productName.includes("tea") ||
        productName.includes("coffee")
      ) {
        basePool = [
          ...ingredientGroups.beverages,
          ...ingredientGroups.dairy,
          "Water",
          "Sugar",
          "Ice",
        ];
      }
      if (productName.includes("chicken") || productName.includes("murgh"))
        basePool.push("Chicken Breast");
      if (
        productName.includes("beef") ||
        productName.includes("burger") ||
        productName.includes("steak")
      )
        basePool.push("Beef");
      if (
        productName.includes("fish") ||
        productName.includes("sushi") ||
        productName.includes("seafood")
      )
        basePool.push(...ingredientGroups.seafood);
      if (
        productName.includes("pizza") ||
        productName.includes("cheese") ||
        productName.includes("paneer")
      )
        basePool.push("Mozzarella", "Paneer", "Cheddar Cheese");
      if (
        productName.includes("cake") ||
        productName.includes("pie") ||
        productName.includes("dessert") ||
        productName.includes("ice cream")
      )
        basePool = [
          ...ingredientGroups.dessert_baking,
          "Sugar",
          "Eggs",
          "Milk",
          "Flour",
          "Butter",
        ];

      // Trim duplicates
      basePool = [...new Set(basePool)];

      // Inject strictly between 5 to 10 correlated sub-ingredients per dish
      const numIngredients = Math.floor(Math.random() * 6) + 5;
      const selectedNames = getRandom(basePool, numIngredients);

      const selectedIds = selectedNames
        .filter((name) => inventoryMap[name])
        .map((name) => inventoryMap[name]._id);

      prod.ingredients = selectedIds;
      await prod.save();
      updatedCount++;
    }

    console.log(
      `Successfully hard-mapped complex ingredient blueprints natively inside ${updatedCount} distinct products!`,
    );
    console.log("Supply Chain Expansion DB Seeding finalized cleanly!");
    process.exit();
  } catch (err) {
    console.error("ERROR SEEDING SUPPLY CHAIN REVISION:", err);
    process.exit(1);
  }
};

seedInventory();

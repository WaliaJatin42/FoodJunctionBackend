const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();

// Connect to DB
connectDB();

const menuData = {
  "North Indian": [
    "Butter Chicken",
    "Dal Makhani",
    "Paneer Tikka",
    "Garlic Naan",
    "Biryani",
    "Chole Bhature",
    "Tandoori Chicken",
    "Rogan Josh",
    "Malai Kofta",
    "Aloo Gobi",
  ],
  "South Indian": [
    "Masala Dosa",
    "Idli Sambar",
    "Medu Vada",
    "Uttapam",
    "Rasam",
    "Upma",
    "Lemon Rice",
    "Chicken Chettinad",
    "Fish Moilee",
    "Paniyaram",
  ],
  Italian: [
    "Margherita Pizza",
    "Pepperoni Pizza",
    "Pasta Carbonara",
    "Lasagna",
    "Ravioli",
    "Tiramisu",
    "Fettuccine Alfredo",
    "Bruschetta",
    "Risotto",
    "Caprese Salad",
  ],
  Chinese: [
    "Sweet and Sour Pork",
    "Kung Pao Chicken",
    "Spring Rolls",
    "Dim Sum",
    "Peking Duck",
    "Chow Mein",
    "Mapo Tofu",
    "Hot and Sour Soup",
    "Fried Rice",
    "Wontons",
  ],
  Continental: [
    "Grilled Chicken Breast",
    "Fish and Chips",
    "Beef Steak",
    "Roast Lamb",
    "Mashed Potatoes",
    "Caesar Salad",
    "Chicken Stroganoff",
    "Shepherd's Pie",
    "Baked Salmon",
    "Pancake",
  ],
  Mexican: [
    "Tacos al Pastor",
    "Chicken Fajitas",
    "Beef Burrito",
    "Nachos Supreme",
    "Quesadilla",
    "Guacamole",
    "Churros",
    "Enchiladas",
    "Chiles Rellenos",
    "Tamales",
  ],
  Japanese: [
    "Sushi Platter",
    "Ramen",
    "Tempura",
    "Sashimi",
    "Udon Noodles",
    "Miso Soup",
    "Chicken Teriyaki",
    "Gyoza",
    "Takoyaki",
    "Matcha Ice Cream",
  ],
  Thai: [
    "Pad Thai",
    "Tom Yum Goong",
    "Green Curry",
    "Red Curry",
    "Som Tum",
    "Massaman Curry",
    "Mango Sticky Rice",
    "Spring Rolls",
    "Satay",
    "Tom Kha Gai",
  ],
  American: [
    "Cheeseburger",
    "Hot Dog",
    "BBQ Ribs",
    "Mac and Cheese",
    "Buffalo Wings",
    "Apple Pie",
    "Pulled Pork Sandwich",
    "Clam Chowder",
    "Cornbread",
    "Brownie",
  ],
  French: [
    "Croissant",
    "Coq au Vin",
    "Ratatouille",
    "Bouillabaisse",
    "French Onion Soup",
    "Quiche Lorraine",
    "Beef Bourguignon",
    "Crème Brûlée",
    "Macarons",
    "Escargot",
  ],
  Lebanese: [
    "Hummus",
    "Falafel",
    "Shawarma",
    "Tabbouleh",
    "Baba Ghanoush",
    "Fattoush",
    "Kebab",
    "Baklava",
    "Kibbeh",
    "Manakish",
  ],
  Spanish: [
    "Paella",
    "Tapas Platter",
    "Gazpacho",
    "Tortilla Espanola",
    "Churros",
    "Patatas Bravas",
    "Jamón Ibérico",
    "Croquetas",
    "Gambas al Ajillo",
    "Crema Catalana",
  ],
  Greek: [
    "Moussaka",
    "Souvlaki",
    "Tzatziki",
    "Greek Salad",
    "Spanakopita",
    "Gyros",
    "Dolmades",
    "Feta Cheese Plate",
    "Baklava",
    "Pastitsio",
  ],
  Korean: [
    "Bibimbap",
    "Kimchi",
    "Bulgogi",
    "Korean Fried Chicken",
    "Japchae",
    "Tteokbokki",
    "Samgyeopsal",
    "Gimbap",
    "Sundubu-jjigae",
    "Bingsu",
  ],
  Vietnamese: [
    "Pho",
    "Banh Mi",
    "Spring Rolls",
    "Bun Cha",
    "Goi Cuon",
    "Com Tam",
    "Cao Lau",
    "Banh Xeo",
    "Ca Phe Sua Da",
    "Che",
  ],
  Turkish: [
    "Doner Kebab",
    "Lahmacun",
    "Pide",
    "Manti",
    "Iskender Kebab",
    "Baklava",
    "Turkish Delight",
    "Kofte",
    "Borek",
    "Kunefe",
  ],
  Moroccan: [
    "Tagine",
    "Couscous",
    "Harira",
    "Pastilla",
    "Zaalouk",
    "Mint Tea",
    "Rfissa",
    "Makouda",
    "Briouat",
    "Mechoui",
  ],
  Caribbean: [
    "Jerk Chicken",
    "Oxtail Stew",
    "Rice and Peas",
    "Ackee and Saltfish",
    "Callaloo",
    "Fried Plantains",
    "Curry Goat",
    "Roti",
    "Patties",
    "Rum Cake",
  ],
  "Healthy Bowls": [
    "Quinoa Salad",
    "Acai Bowl",
    "Buddha Bowl",
    "Poke Bowl",
    "Green Smoothie Bowl",
    "Keto Chicken Bowl",
    "Vegan Protein Bowl",
    "Avocado Toast",
    "Chia Pudding",
    "Detox Salad",
  ],
  "Beverages & Coffee": [
    "Espresso",
    "Cappuccino",
    "Latte",
    "Cold Brew",
    "Mocha",
    "Matcha Latte",
    "Lemonade",
    "Mango Shake",
    "Iced Tea",
    "Frappuccino",
  ],
};

// Generic image mappings per cuisine for variety and UX appeal
const categoryImages = {
  "North Indian":
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800",
  "South Indian":
    "https://images.unsplash.com/photo-1610192244261-3f3394ce6c63?auto=format&fit=crop&q=80&w=800",
  Italian:
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
  Chinese:
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
  Continental:
    "https://images.unsplash.com/photo-1414235077428-338988a06215?auto=format&fit=crop&q=80&w=800",
  Mexican:
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800",
  Japanese:
    "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=800",
  Thai: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=800",
  American:
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800",
  French:
    "https://images.unsplash.com/photo-1511910849309-0dffb8785146?auto=format&fit=crop&q=80&w=800",
  Lebanese:
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&q=80&w=800",
  Spanish:
    "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&q=80&w=800",
  Greek:
    "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&q=80&w=800",
  Korean:
    "https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&q=80&w=800",
  Vietnamese:
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?auto=format&fit=crop&q=80&w=800",
  Turkish:
    "https://images.unsplash.com/photo-1629814545260-bd44eff19195?auto=format&fit=crop&q=80&w=800",
  Moroccan:
    "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&q=80&w=800",
  Caribbean:
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
  "Healthy Bowls":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
  "Beverages & Coffee":
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800",
};

const seedDatabase = async () => {
  try {
    console.log(
      "Clearing existing categories and products to prevent duplicates...",
    );
    await Category.deleteMany({});
    await Product.deleteMany({});

    console.log("Mass seeding 20 Categories and 200 Products...");

    for (const [cuisine, products] of Object.entries(menuData)) {
      // 1. Create the overarching Category
      const newCategory = await Category.create({
        name: cuisine,
        description: `Authentic ${cuisine} dishes, curated for Food Junction.`,
      });

      // 2. Map and insert all 10 products pointing exactly to this Category
      const productPromises = products.map((item) => {
        return Product.create({
          name: item,
          description: `Delicious ${item} prepared freshly on-demand.`,
          price: Math.floor(Math.random() * (499 - 149 + 1) + 149), // Random prices between ₹149 and ₹499
          image: categoryImages[cuisine], // Applies the beautiful placeholder stock photo
          category: newCategory._id,
          available: true,
          stock: 50,
          customizations: [
            {
              name: "Spice Level",
              options: [
                { name: "Extra Spicy", priceAddOn: 20 },
                { name: "Mild", priceAddOn: 0 },
              ],
              required: false,
            },
          ],
        });
      });

      await Promise.all(productPromises);
      console.log(`Seeded Menu: [${cuisine}] with 10 explicit products!`);
    }

    console.log("Database Seeding Pipeline Completed Successfully!");
    process.exit();
  } catch (error) {
    console.error("CRITICAL ERROR with seeding runtime pipeline:", error);
    process.exit(1);
  }
};

seedDatabase();

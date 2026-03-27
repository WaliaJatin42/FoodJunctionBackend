const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Models
const User = require("./models/User");
const Product = require("./models/Product");
const Order = require("./models/Order");
const Delivery = require("./models/Delivery");
const Review = require("./models/Review");

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected organically: ${conn.connection.host}`);
  } catch (err) {
    console.error(`DB Error: ${err.message}`);
    process.exit(1);
  }
};

const dummyCustomers = [
  ...Array.from({ length: 5 }).map((_, i) => ({
    name: `Test Customer ${i + 1}`,
    email: `customer${i + 1}@foodjunction.com`,
    password: "password123",
    role: "customer",
    phone: `+1555000000${i}`,
    membershipTier: i % 2 === 0 ? "Gold" : "Silver",
    loyaltyPoints: Math.floor(Math.random() * 1000),
  })),
];

const dummyEmployees = [
  ...Array.from({ length: 3 }).map((_, i) => ({
    name: `Delivery Employee ${i + 1}`,
    email: `delivery${i + 1}@foodjunction.com`,
    password: "password123",
    role: "employee",
    salary: 2000 + i * 150,
    isActive: true,
  })),
];

const importEcosystem = async () => {
  try {
    await connectDB();

    console.log("Removing existing structurally unstable dummy nodes...");
    await Order.deleteMany({});
    await Delivery.deleteMany({});
    await Review.deleteMany({});
    // We only delete non-admin test users to preserve the master admin login
    await User.deleteMany({ role: { $in: ["customer", "employee"] } });

    console.log("Generating Authenticated Profiles...");
    const createdCustomers = await User.insertMany(dummyCustomers);
    const createdEmployees = await User.insertMany(dummyEmployees);

    console.log("Querying massive Product mapping...");
    const products = await Product.find().limit(50);
    if (products.length === 0) {
      console.log(
        "No dynamic products found! Please ensure 'node seedMenu.js' was executed first.",
      );
      process.exit(1);
    }

    console.log("Compiling and Dispatching 20 highly authentic test Orders...");
    const createdOrders = [];
    const orderTypes = ["cafe", "delivery", "online_pickup", "table_qr"];
    const statuses = ["received", "preparing", "completed", "cancelled"];

    for (let i = 0; i < 20; i++) {
      const orderCustomer =
        createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const oType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
      const stat = statuses[Math.floor(Math.random() * statuses.length)];

      const items = [];
      let totalVal = 0;
      const numItems = Math.floor(Math.random() * 4) + 1; // 1 to 4 independent items per cart

      for (let j = 0; j < numItems; j++) {
        const p = products[Math.floor(Math.random() * products.length)];
        const q = Math.floor(Math.random() * 3) + 1;
        items.push({
          product: p._id,
          quantity: q,
          price: p.price,
        });
        totalVal += p.price * q;
      }

      const o = await Order.create({
        employee: oType === "cafe" ? createdEmployees[0]._id : undefined,
        customerPhone: orderCustomer.phone,
        orderType: oType,
        status: stat,
        items: items,
        totalAmount: totalVal,
        paymentMethod: i % 2 === 0 ? "card" : "cash",
        paymentStatus: stat === "completed" ? "paid" : "pending",
        deliveryAddress:
          oType === "delivery"
            ? {
                address: `${Math.floor(Math.random() * 9999)} Main St, Software Suite`,
                pincode: "10010",
              }
            : undefined,
        eta:
          oType === "delivery" ? new Date(Date.now() + 30 * 60000) : undefined,
        queuePosition:
          stat === "completed" || stat === "cancelled" ? null : i + 1,
      });
      createdOrders.push(o);
    }

    console.log("Simulating Real-Time Handoff Array Deliveries...");
    const deliveryOrders = createdOrders.filter(
      (o) => o.orderType === "delivery",
    );
    for (let i = 0; i < deliveryOrders.length; i++) {
      const emp =
        createdEmployees[Math.floor(Math.random() * createdEmployees.length)];
      await Delivery.create({
        order: deliveryOrders[i]._id,
        deliveryBoy: emp._id,
        status:
          deliveryOrders[i].status === "completed" ? "delivered" : "assigned",
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        eta: deliveryOrders[i].eta,
      });
    }

    console.log(
      "Populating Frontend UX Visual Feedback Elements via 15 Reviews...",
    );
    for (let i = 0; i < 15; i++) {
      const p = products[Math.floor(Math.random() * products.length)];
      const c =
        createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      await Review.create({
        customer: c._id,
        product: p._id,
        order:
          createdOrders[Math.floor(Math.random() * createdOrders.length)]._id, // Simulate real purchase origin
        rating: Math.floor(Math.random() * 2) + 4, // Exclusively 4-5 stars for optimal mockup presentation
        comment:
          "Absolutely delicious! Masterfully crafted and natively delicious.",
      });
    }

    console.log("████████████████████████████████████████████████");
    console.log("SUCCESS! Dynamic Global Ecosystem Data Inserted.");
    console.log("████████████████████████████████████████████████");
    process.exit(0);
  } catch (error) {
    if (error.name === "ValidationError") {
      console.error("Validation Error Details:");
      for (let field in error.errors) {
        console.error(field, ":", error.errors[field].message);
      }
    } else {
      console.error("Critical Failure terminating Seeder:", error);
    }
    process.exit(1);
  }
};

importEcosystem();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";
import Service from "../models/Service.js";
import CardTemplate from "../models/CardTemplate.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in backend/.env");
  process.exit(1);
}

const sampleVendors = [
  {
    phone: "+919111111111",
    full_name: "Arun Kumar",
    brand_name: "Arun Celebrations",
    city: "Chennai",
  },
  {
    phone: "+919222222222",
    full_name: "Meera Raj",
    brand_name: "Meera Moments",
    city: "Coimbatore",
  },
  {
    phone: "+919333333333",
    full_name: "Karthik S",
    brand_name: "Karthik Wedding Studio",
    city: "Madurai",
  },
  {
    phone: "+919444444444",
    full_name: "Divya Priya",
    brand_name: "Divya Events",
    city: "Salem",
  },
];

const imageByCategory = {
  "Wedding Venues":
    "https://images.unsplash.com/photo-1519167758481-83f29c7f9f2f?auto=format&fit=crop&w=1200&q=80",
  Photographers:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
  "Bridal Makeup":
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80",
  "Henna Artists":
    "https://images.unsplash.com/photo-1596704017254-9754f6ad92fc?auto=format&fit=crop&w=1200&q=80",
  "Bridal Wear":
    "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1200&q=80",
  "Car Rental":
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
  "Wedding Cards":
    "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=1200&q=80",
};

const serviceTemplates = [
  {
    category: "Wedding Venues",
    name: "Royal Orchid Convention Hall",
    city: "Chennai",
    price_range: "80000-250000",
    description: "Spacious AC venue with decor and catering support.",
    details: { cancellation_policy: "Partially Refundable", venue_type: "Banquet", amenities: ["Parking", "Stage", "AC"] },
    pricing_packages: [
      { name: "Silver", price: 80000, inclusions: "Hall + Basic Decor" },
      { name: "Gold", price: 150000, inclusions: "Hall + Premium Decor + Lighting" },
    ],
  },
  {
    category: "Photographers",
    name: "Candid Tales Studio",
    city: "Coimbatore",
    price_range: "25000-120000",
    description: "Candid wedding photography and cinematic videography.",
    details: { cancellation_policy: "Non-refundable", expertise: ["Weddings", "Engagements"] },
    pricing_packages: [
      { name: "Photo Only", price: 25000, inclusions: "1 Day Shoot + Album" },
      { name: "Photo + Video", price: 70000, inclusions: "2 Days + Cinematic Film" },
    ],
  },
  {
    category: "Bridal Makeup",
    name: "Glow by Divya",
    city: "Madurai",
    price_range: "12000-50000",
    description: "Professional bridal makeup with hairstyling.",
    details: { cancellation_policy: "Partially Refundable", services_for: ["Female"], location_type: "Studio", home_service: true },
    pricing_packages: [
      { name: "HD Makeup", price: 12000, inclusions: "HD Makeup + Hair" },
      { name: "Airbrush Makeup", price: 25000, inclusions: "Airbrush + Draping + Touchup" },
    ],
  },
  {
    category: "Henna Artists",
    name: "Classic Mehndi Crew",
    city: "Salem",
    price_range: "3000-20000",
    description: "Bridal and family mehndi designs with organic products.",
    details: { cancellation_policy: "Fully Refundable", mehndi_type: "Organic/Natural", has_team: true },
    pricing_packages: [
      { name: "Bridal Only", price: 5000, inclusions: "Front & Back Full Hand" },
      { name: "Bridal + Family", price: 15000, inclusions: "Bridal + 15 Family Members" },
    ],
  },
  {
    category: "Bridal Wear",
    name: "Anaya Couture Rentals",
    city: "Chennai",
    price_range: "6000-50000",
    description: "Designer bridal lehenga and gown rentals.",
    details: { cancellation_policy: "Partially Refundable", material: "Silk", size: "M" },
    pricing_packages: [
      { name: "Standard Lehenga", price: 6000, inclusions: "Rental for 2 days" },
      { name: "Premium Lehenga", price: 18000, inclusions: "Rental for 3 days + Minor Alteration" },
    ],
  },
  {
    category: "Car Rental",
    name: "Elite Wedding Rides",
    city: "Coimbatore",
    price_range: "4000-25000",
    description: "Luxury wedding car rental with driver.",
    details: { cancellation_policy: "Non-refundable", seats: 5, transmission: "auto" },
    pricing_packages: [
      { name: "Sedan Package", price: 4000, inclusions: "4 hours + Driver" },
      { name: "Luxury Package", price: 12000, inclusions: "8 hours + Decor + Driver" },
    ],
  },
];

const cardTemplates = [
  {
    name: "Classic Floral Invite",
    type: "editable",
    city: "Chennai",
    price_per_card: 35,
    quantity_available: 1200,
    format: ["JPG", "PDF"],
    design_time: "2 days",
    description: "Elegant floral invitation card template.",
    front_image: imageByCategory["Wedding Cards"],
    status: "published",
  },
  {
    name: "Royal Gold Theme",
    type: "non-editable",
    city: "Madurai",
    price_per_card: 45,
    quantity_available: 800,
    format: ["PNG", "PDF"],
    design_time: "3 days",
    description: "Traditional royal gold wedding invitation.",
    front_image: imageByCategory["Wedding Cards"],
    status: "published",
  },
];

const commonAvailability = {
  working_hours: "10:00 AM - 10:00 PM",
  working_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};

async function upsertVendor(vendor) {
  const username = `user${vendor.phone.replace("+", "")}`;
  const hashedPassword = await bcrypt.hash("Vendor@123", 10);

  const user = await User.findOneAndUpdate(
    { phone: vendor.phone },
    {
      phone: vendor.phone,
      username,
      full_name: vendor.full_name,
      password: hashedPassword,
      role: "vendor",
      vendorDetails: {
        full_name: vendor.full_name,
        brand_name: vendor.brand_name,
        category: "Wedding Venues",
        whatsapp_number: vendor.phone,
        booking_email: `${vendor.brand_name.toLowerCase().replace(/\s+/g, "")}@example.com`,
        terms_accepted: true,
      },
      vendorRequest: {
        status: "approved",
        full_name: vendor.full_name,
        category: "Wedding Venues",
        whatsapp_number: vendor.phone,
        terms_accepted: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return user;
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding.");

  const vendors = [];
  for (const vendor of sampleVendors) {
    vendors.push(await upsertVendor(vendor));
  }

  for (let i = 0; i < serviceTemplates.length; i += 1) {
    const template = serviceTemplates[i];
    const vendor = vendors[i % vendors.length];
    await Service.findOneAndUpdate(
      { name: template.name, vendor_id: vendor._id },
      {
        vendor_id: vendor._id,
        category: template.category,
        status: "published",
        name: template.name,
        city: template.city,
        photos: [imageByCategory[template.category]],
        description: template.description,
        additional_info: "Sample seeded data for testing bookings.",
        pricing_packages: template.pricing_packages,
        location_map: "https://maps.google.com",
        address: `${template.city}, Tamil Nadu`,
        discount: 10,
        discount_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        availability: commonAvailability,
        price_range: template.price_range,
        details: template.details,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (let i = 0; i < cardTemplates.length; i += 1) {
    const card = cardTemplates[i];
    const vendor = vendors[i % vendors.length];
    await CardTemplate.findOneAndUpdate(
      { name: card.name, vendor_id: vendor._id },
      { ...card, vendor_id: vendor._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log("Sample data added/updated successfully.");
  console.log("Seeded categories: Wedding Venues, Photographers, Bridal Makeup, Henna Artists, Bridal Wear, Car Rental, Wedding Invitations.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seeding failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

// Edit this file to change content site-wide. Everything marked PLACEHOLDER should be replaced.
window.SITE = {
  name: "Your Swim Program",            // PLACEHOLDER
  tagline: "Confidence in the water, for every age.",
  location: "Pool name, City",          // PLACEHOLDER
  phone: "+233 00 000 0000",            // PLACEHOLDER
  email: "info@example.com",            // PLACEHOLDER
  whatsapp: "233000000000",             // PLACEHOLDER: international format, digits only

  // How registrations reach you:
  //  "whatsapp" -> opens WhatsApp with a prefilled message
  //  "email"    -> opens the visitor's email app with a prefilled message
  // Either way, the registration is also saved to data/registrations.csv by register.php.
  registration: { mode: "whatsapp", save: "register.php" },  // save: set to null to skip saving to the server

  // Payment is OFF for now. To add Paystack later, set enabled: true and fill in the key.
  payment: { enabled: false, provider: "paystack", publicKey: "", currency: "GHS" },

  currency: "GHS",
  programs: [                            // PLACEHOLDERS
    { id: "learn", name: "Learn to Swim", ages: "4-8 yrs", level: "Beginner",
      desc: "Water safety, breathing and floating in small, friendly groups.",
      schedule: "Sat 9:00-10:00", price: 300, spots: 8 },
    { id: "strokes", name: "Stroke Development", ages: "8-14 yrs", level: "Intermediate",
      desc: "Freestyle, backstroke, breaststroke and butterfly technique.",
      schedule: "Sat 10:00-11:00", price: 350, spots: 10 },
    { id: "team", name: "Swim Team", ages: "10-17 yrs", level: "Advanced",
      desc: "Training for meets: endurance, starts, turns and race strategy.",
      schedule: "Tue & Thu 17:00-18:30", price: 500, spots: 12 },
    { id: "adult", name: "Adult Lessons", ages: "18+", level: "All levels",
      desc: "Never too late. Private-feel lessons at your own pace.",
      schedule: "Wed 18:00-19:00", price: 350, spots: 6 }
  ]
};

// Edit this file to change content site-wide. Everything marked PLACEHOLDER should be replaced.
window.SITE = {
  name: "PrinceSwim",
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
  programs: [                            // PLACEHOLDERS: edit descriptions, times and prices
    { id: "beginner", img: "assets/img/learn.jpg", name: "Beginner",
      desc: "Water confidence, breathing, floating and first strokes in a friendly, safe setting.",
      schedule: "Sat 9:00-10:00", price: 300 },
    { id: "intermediate", img: "assets/img/strokes.jpg", name: "Intermediate",
      desc: "Build technique across freestyle, backstroke, breaststroke and butterfly.",
      schedule: "Sat 10:00-11:00", price: 350 },
    { id: "advanced", img: "assets/img/team.jpg", name: "Advanced",
      desc: "Endurance, starts, turns and race strategy for confident, competitive swimmers.",
      schedule: "Tue & Thu 17:00-18:30", price: 500 }
  ]
};

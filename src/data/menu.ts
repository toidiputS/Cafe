export interface MenuItem {
  id: string;
  name: string;
  price: number | number[]; // Support arrays for multiple sizes
  description?: string;
  category: string;
  subcategory?: string;
  options?: string[];
  isSpecial?: boolean;
  highlightColor?: string;
  sortOrder?: number;
  isActive?: boolean;
  stockQuantity?: number;
  discountedPrice?: number;
  discountLabel?: string;
}

export const BUSINESS_INFO = {
  name: "The Bridge Café",
  address: "1117 Elm Street, Manchester, NH 03101",
  locationDetails: "Downtown Manchester, Next to Anthem",
  phone: "603.647.9991",
  email: "bob@thebridgecafe.net",
  hours: {
    mon_fri: "6am to 5pm",
    sat_sun: "6am to 4pm",
    all_day_breakfast: true,
    delivery: "7 am-5 pm every day"
  },
  delivery: {
    charge: 2.00,
    areas: ["Manchester", "Bedford"],
    manchester_minimum: 10.00,
    gratuity_threshold: 100.00,
    gratuity_rate: 0.15
  }
};

export const CATEGORY_METADATA: Record<string, { 
  description?: string, 
  subHeader?: string, 
  isMainFood?: boolean,
  showAllDay?: boolean,
  groupLabel?: string,
  navLabel?: string,
  hideHeader?: boolean,
  bannerBlocks?: string[]
}> = {
  "Weekly Soups and Specials": {
    navLabel: "Specials",
    isMainFood: true,
    description: "New specials every Monday!"
  },
  "Breakfast": {
    groupLabel: "Food",
    isMainFood: true,
    showAllDay: true,
    subHeader: "Breakfast All Day",
    description: "Our items change periodically, so keep checking in with us! Craving something not on the menu? Call us – we make every item to order! Breakfast is served all day!"
  },
  "Lunch": {
    groupLabel: "Food",
    isMainFood: true,
    showAllDay: false,
    hideHeader: true
  },
  "Desserts": {
    groupLabel: "Food",
    isMainFood: true,
    showAllDay: false,
    description: "Choose from freshly baked desserts, made FRESH every morning! Muffins, scones, brownies, cookies, and more!"
  },
  "Drinks": {
    groupLabel: "Drinks",
    isMainFood: false,
    description: "Espresso • Tea • Coffee • Juice • Smoothie"
  },
  "Catering": {
    groupLabel: "Catering",
    isMainFood: true,
    description: "At The Bridge Café on Elm, we prepare everything in-house with only the freshest ingredients, herbs, and spices. We will deliver to your needs professionally, on time, and with a presentation that will knock your socks off. Call us for your:\n\n• **Breakfast Meetings**\n• **Last Minute Lunches**\n• **Big Presentation Dinner**\n\nWe will give you the best catering experience you’ve ever had! Last Minute Orders? No Problem! We know that last minute meetings pop up out of nowhere. And when they do, the Bridge Café will be there for you – on time and in person!\n\n**WE TAKE ALL MAJOR CREDIT CARDS.......**"
  }
};

// Define explicit subcategory order to ensure they appear exactly as requested
export const SUBCATEGORY_ORDER: Record<string, string[]> = {
  "Weekly Soups and Specials": ["Soups", "Specials"],
  "Breakfast": [
    "Eggs Any Style",
    "Omelettes",
    "Breakfast Sandwiches",
    "Breakfast Burritos",
    "Bagels and Spreads",
    "Pancakes n' Things"
  ],
  "Lunch": [
    "Signature Paninis and Sandwiches",
    "Freshly Tossed Salads",
    "Signature Quesadillas & More"
  ],
  "Drinks": [
    "Espresso Drinks",
    "Republic of Tea",
    "Coffee",
    "Juice Bar",
    "Signature Creations",
    "Smoothie Shack"
  ],
  "Catering": [
    "Bridge Starters",
    "Bridge Breakfast",
    "Bridge Lunch",
    "Garden Fresh Salads",
    "Soups and Stews",
    "Freshly Made Sides",
    "Bridge Sweets",
    "Beverages"
  ]
};

export const SUBCATEGORY_METADATA: Record<string, { subHeader?: string, description?: string, bannerBlocks?: string[] }> = {
  "Soups": {
    description: "Always made fresh, our soups are a great light lunch or a hearty addition to a sandwich. Served with crackers. Small $4.00 or Large $5.00."
  },
  "Bagels and Spreads": {
    bannerBlocks: ["Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion"]
  },
  "Omelettes": {
    subHeader: "Served w/ Home Fries & Toast!",
    description: "Egg Whites Available for $1.50 extra"
  },
  "Eggs Any Style": {
    subHeader: "Served w/ Home Fries & Toast!"
  },
  "Pancakes n' Things": {
    subHeader: "Breakfast Variety:"
  },
  "Signature Paninis and Sandwiches": {},
  "Freshly Tossed Salads": {
    description: "All Salads are made fresh to order & served with a side of bread. Make any salad a wrap! Add Chicken for $3.50, or steak for $5.00"
  },
  "Espresso Drinks": {
    description: "Choose from whole, low-fat or skim milk, or substitute soy milk for $0.50! All espresso drinks are available in decaf, as well as hot, iced or frozen!\n\nCoffees come in small, medium, and large sizes."
  },
  "Republic of Tea": {
    description: "Tea Flavors: British Breakfast • Earl Greyer • Pumpkin Spice • Emperors White • Orange Blossom White Tea • Mango Ceylon • Pomegranate Green • Chamomile Lemon • Peoples Green\nDecaf Flavors: Gingseng Peppermint • British Breakfast Decaf • Good Hope Vanilla\n\nAsk about our iced tea flavors!"
  },
  "Coffee": {
    description: "Kick it up a notch! Add a shot of espresso for $2.50 or a flavored syrup for $0.50!"
  },
  "Juice Bar": {
    description: "Straight Up Juices: Apple • Carrot • Beet • Celery"
  },
  "Smoothie Shack": {
    description: "We use all fresh fruits & veggies! Small - $5.00, Medium - $6.50, Large - $8.00\n\nAll smoothies can be made dairy free with soy or almond milk for an extra $1.00"
  },
  "Bridge Breakfast": {},
  "Bridge Lunch": {},
  "Garden Fresh Salads": {},
  "Soups and Stews": {},
  "Freshly Made Sides": {},
  "Bridge Sweets": {},
  "Beverages": {}
};

export const MENU: MenuItem[] = [
  // --- WEEKLY SOUPS AND SPECIALS ---
  { id: "s-chicken-rice", name: "Chicken and Rice--Gluten Free", price: [4.00, 5.00], options: ["Small", "Large"], category: "Weekly Soups and Specials", subcategory: "Soups" },
  { id: "s-broccoli-cheddar", name: "Broccoli Cheddar--Gluten Free, vegetarian", price: [4.00, 5.00], options: ["Small", "Large"], category: "Weekly Soups and Specials", subcategory: "Soups" },
  { id: "s-chicken-chili", name: "Chicken Chili--Gluten Free", price: [4.00, 5.00], options: ["Small", "Large"], category: "Weekly Soups and Specials", subcategory: "Soups" },

  {
    id: "sp-bbq-ques",
    name: "BBQ Chicken Quesadilla",
    price: 17.00,
    description: "Chicken tossed in BBQ sauce with grilled onions and peppers, tomatoes, pickled jalapenos, bacon, cheddar cheese, and cilantro chimichurri!",
    category: "Weekly Soups and Specials",
    subcategory: "Specials",
    isSpecial: true
  },
  {
    id: "sp-tuna-roll",
    name: "Tuna Roll",
    price: 16.00,
    description: "Tuna salad, mango, cucumbers, red onion, avocado, boursin cheese, tomato, sriracha mayo, and a wasabi mayo all wrapped up!",
    category: "Weekly Soups and Specials",
    subcategory: "Specials",
    isSpecial: true
  },
  {
    id: "sp-quinoa-salad",
    name: "Quinoa Apple Pecan Salad",
    price: 16.00,
    description: "Quinoa, arugula, cucumbers, tomatoes, apples, tomatoes, red onion, candied pecans, oranges, and goat cheese, served with a white balsalmic dressing!",
    category: "Weekly Soups and Specials",
    subcategory: "Specials",
    isSpecial: true
  },

  // --- BREAKFAST ---
  {
    id: "b-sw-ec",
    name: "Egg & Cheese",
    price: 3.25,
    description: "Served on your choice of Bread, Bagel, English Muffin or Croissant",
    category: "Breakfast",
    subcategory: "Breakfast Sandwiches",
    sortOrder: 1
  },
  {
    id: "b-sw-ec-meat",
    name: "Egg & Cheese",
    price: 4.75,
    options: ["Ham", "Bacon", "Sausage"],
    description: "Served on your choice of Bread, Bagel, English Muffin or Croissant",
    category: "Breakfast",
    subcategory: "Breakfast Sandwiches",
    sortOrder: 2
  },
  {
    id: "b-sw-ec-prem",
    name: "Egg & Cheese",
    price: 7.00,
    options: ["Prosciutto", "Smoked Salmon"],
    description: "Served on your choice of Bread, Bagel, English Muffin or Croissant",
    category: "Breakfast",
    subcategory: "Breakfast Sandwiches",
    sortOrder: 3
  },
  {
    id: "b-bur-ecp",
    name: "Egg, Cheese & Potato Burrito",
    price: 5.00,
    description: "Served w/ salsa on your choice of wrap: White, Wheat or Sun-Dried Tomato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    sortOrder: 1
  },
  {
    id: "b-bur-ecmp",
    name: "Egg, Cheese, Meat and Potato Burrito",
    price: 6.50,
    options: ["Ham", "Bacon", "Sausage"],
    description: "Served w/ salsa on your choice of wrap: White, Wheat or Sun-Dried Tomato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    sortOrder: 2
  },
  {
    id: "b-bur-supremo",
    name: "“The Supremo” Burrito",
    price: 7.00,
    options: ["Ham", "Bacon", "Sausage", "Veggies"],
    description: "Egg, Cheese, Meat, Potato & Veggies! Add sour cream or guacamole for $0.75! Served w/ salsa on your choice of wrap: White, Wheat or Sun-Dried Tomato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    sortOrder: 3
  },
  {
    id: "b-bur-chorizo",
    name: "Chorizo",
    price: 7.00,
    description: "Chorizo, black bean spread, cheddar cheese, potato, peppers and onions",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    sortOrder: 4
  },
  {
    id: "b-bur-hash",
    name: "Hash Burrito",
    price: 9.00,
    description: "Homemade corned beef hash, egg, and cheese",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    sortOrder: 5
  },
  {
    id: "b-bur-steak",
    name: "Steak Burrito",
    price: 9.50,
    description: "Egg, cheese, onion, peppers, potato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    sortOrder: 6
  },
  {
    id: "b-bag-toast",
    name: "Toasted Bagel",
    price: 2.50,
    description: "Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion",
    category: "Breakfast",
    subcategory: "Bagels and Spreads",
    sortOrder: 1
  },
  { id: "b-bag-butter", name: "Bagel w/ Butter", price: 2.50, description: "Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion", category: "Breakfast", subcategory: "Bagels and Spreads", sortOrder: 2 },
  { id: "b-bag-pb", name: "Bagel w/ Peanut Butter", price: 3.00, description: "Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion", category: "Breakfast", subcategory: "Bagels and Spreads", sortOrder: 3 },
  { id: "b-bag-jelly", name: "Bagel w/ Jelly", price: 2.75, description: "Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion. Jelly Choice: Grape or Strawberry", category: "Breakfast", subcategory: "Bagels and Spreads", sortOrder: 4 },
  { id: "b-bag-pbj", name: "Bagel w/ PB & Jelly", price: 3.25, description: "Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion. Jelly Choice: Grape or Strawberry", category: "Breakfast", subcategory: "Bagels and Spreads", sortOrder: 5 },
  {
    id: "b-bag-cc",
    name: "Bagel w/ Cream Cheese",
    price: 3.75,
    description: "Freshly Whipped Cream Cheese Flavors: Plain • Vegetable • Pesto • Honey Walnut • Chive • Strawberry • Jalapeno. Add Smoked Salmon for $5.00",
    category: "Breakfast",
    subcategory: "Bagels and Spreads",
    sortOrder: 4
  },
  {
    id: "b-bag-salmon-plate",
    name: "Salmon plate",
    price: 12.00,
    description: "Toasted Bagel with smoked salmon, capers, red onion, chive cream cheese, cucumbers and tomato, served with homefries or fruit",
    category: "Breakfast",
    subcategory: "Bagels and Spreads",
    sortOrder: 5
  },
  {
    id: "b-om-american",
    name: "American",
    price: 11.00,
    description: "Ham, onion, pepper, American cheese. Served with Homefries and toast",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  {
    id: "b-om-french",
    name: "French",
    price: 12.00,
    description: "Brie, ham, spinach. Served with Homefries and toast",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  {
    id: "b-om-meat",
    name: "Meat Lovers",
    price: 12.00,
    description: "Ham, bacon, sausage, American cheese. Served with Homefries and toast.",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  {
    id: "b-om-veggie",
    name: "Veggie",
    price: 11.00,
    description: "Pepper, onion, tomato, mushroom, spinach, cheddar. Served with Homefries and toast.",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  {
    id: "b-om-greek",
    name: "Greek",
    price: 11.00,
    description: "Feta, spinach & tomato. Served with Homefries and toast.",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  {
    id: "b-om-salmon",
    name: "Smoked Salmon",
    price: 13.00,
    description: "Tomato, onions, capers, boursin, dill havarti. Served with Homefries and toast.",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  {
    id: "b-om-spanish",
    name: "Spanish",
    price: 11.50,
    description: "Onion, pepper, black bean spread, salsa, cheddar. Served with Homefries and toast.",
    category: "Breakfast",
    subcategory: "Omelettes"
  },
  { id: "b-egg-2", name: "Two Eggs", price: 6.50, category: "Breakfast", subcategory: "Eggs Any Style" },
  { id: "b-egg-2-meat", name: "Two Eggs w/ Meat Choice", price: 9.50, options: ["Ham", "Bacon", "Sausage"], category: "Breakfast", subcategory: "Eggs Any Style" },
  { id: "b-egg-2-prosc", name: "Two Eggs w/ Proscuitto", price: 9.50, category: "Breakfast", subcategory: "Eggs Any Style" },
  { id: "b-egg-2-salmon", name: "Two Eggs w/ Salmon", price: 12.00, category: "Breakfast", subcategory: "Eggs Any Style" },
  {
    id: "b-egg-hungry",
    name: "\"Hungry Man\"",
    price: 13.50,
    options: ["Ham", "Bacon", "Sausage"],
    description: "Two eggs, choice of meat, home fries, toast, pancakes or french toast",
    category: "Breakfast",
    subcategory: "Eggs Any Style"
  },
  { id: "b-ft", name: "French Toast", price: 7.50, category: "Breakfast", subcategory: "Pancakes n' Things" },
  { id: "b-ft-berries", name: "French Toast w/ Blueberries or Strawberries", price: 9.00, options: ["Blueberries", "Strawberries"], category: "Breakfast", subcategory: "Pancakes n' Things" },
  { id: "b-pancakes", name: "Stack of Pancakes", price: 6.00, category: "Breakfast", subcategory: "Pancakes n' Things" },
  { id: "b-pancakes-chips", name: "Stack of Pancakes w/ Blueberries or Choc. Chips", price: 7.50, options: ["Blueberries", "Chocolate Chips"], category: "Breakfast", subcategory: "Pancakes n' Things" },
  {
    id: "b-muffins",
    name: "Award Winning Muffins, Scones, and more!",
    price: 3.00,
    description: "Call for flavors of the day!",
    category: "Breakfast",
    subcategory: "Pancakes n' Things"
  },
  { id: "b-yogurt", name: "Fruit & Yogurt Cup", price: 4.00, category: "Breakfast", subcategory: "Pancakes n' Things" },
  { id: "b-oatmeal", name: "Hot Oatmeal w/ apples, raisins, and strawberries", price: 4.00, category: "Breakfast", subcategory: "Pancakes n' Things" },
  { id: "b-hash-side", name: "Corned Beef Hash", price: 5.50, category: "Breakfast", subcategory: "Pancakes n' Things" },

  // --- LUNCH ---
  {
    id: "l-sw-lulu",
    name: "The Lu Lu",
    price: 10.50,
    description: "Albacore tuna, tomato & cheddar cheese",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-cali-blt",
    name: "California BLT",
    price: 11.50,
    description: "Turkey, crisp bacon, Monterey Jack cheese, lettuce, tomato, avocado spread, ranch dressing, served on focaccia",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-bella-rose",
    name: "Bella Rose",
    price: 11.50,
    description: "Prosciutto, tomato, fresh mozzarella, pesto, balsamic mayo, served on focaccia",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-miranda",
    name: "Miranda the Rescue Cat",
    price: 11.50,
    description: "Lime chicken, avocado, homemade hot sauce, black bean spread, sour cream, lettuce, tomato",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-cilantro-lime",
    name: "Cilantro-Lime Chicken",
    price: 10.50,
    description: "Cilantro-marinated grilled chicken, Monterey Jack cheese, salsa & avocado",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-chipotle-turkey",
    name: "Chipotle Turkey",
    price: 11.50,
    description: "Bacon, tomato, oven roasted turkey, Monterey Jack cheese & chipotle mayo",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-bridge",
    name: "\"The Bridge\"",
    price: 11.50,
    description: "Grilled chicken, fresh mozzarella, pesto, balsamic reduction, served on focaccia",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-wrap-bbq",
    name: "Spicy Chicken BBQ Wrap",
    price: 11.50,
    description: "Grilled chicken, bacon, blue cheese crumbles, cheddar, american, avocado, honey chipotle BBQ sauce, lettuce, tomato, onion",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-real-deal",
    name: "The Real Deal",
    price: 11.50,
    description: "Ham, turkey, bacon, cheddar cheese & dijon mustard. A best seller!",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-3-cheese",
    name: "3 Cheese",
    price: 7.00,
    description: "Cheddar, American (add tomato for $0.50!)",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-portabella",
    name: "Balsamic Roasted Portabella",
    price: 11.50,
    description: "Gorgonzola, roasted red peppers, caramelized onions, Boursin, served on focaccia",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-wrap-cobb",
    name: "California Cobb Wrap",
    price: 11.50,
    description: "Roasted turkey, smoked bacon, gorgonzola crumbles, avocado spread, field greens, tomato & hard boiled egg",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-medusa",
    name: "The Medusa",
    price: 11.50,
    description: "Crispy eggplant, spicy feta, avocado, lettuce, tomato, black olives",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-wrap-greek",
    name: "Greek Chicken Wrap",
    price: 11.50,
    description: "Grilled chicken, chunks of feta, black olives, tomato, cukes, red onions, red peppers, mixed greens, fresh lemon olive-oil oregano dressing",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-reuben",
    name: "Classic Reuben",
    price: 13.00,
    description: "Corned Beef, Swiss, Russian dressing, sauerkraut, served on rye. (or make it a Turkey Reuben!)",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-wrap-steak",
    name: "Chunk Style Steak & Cheese Wrap",
    price: 13.00,
    description: "Marinated steak, american cheese, grilled mushrooms, onions, peppers, mayo",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-wellington",
    name: "The Wellington",
    price: 13.00,
    description: "Hot roast beef, caramelized onion, roasted mushrooms, boursin, gorgonzola, Swiss, steak sauce",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-tuna-sal",
    name: "Albacore Tuna Salad",
    price: 9.00,
    description: "Romaine lettuce & tomato",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-chicken-sal",
    name: "Chicken Salad",
    price: 9.00,
    description: "Romaine lettuce & tomato",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-turkey",
    name: "Oven Roasted Turkey",
    price: 10.50,
    description: "Dill havarti, avocado, romaine, sun-dried tomato mayo",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-blt-lunch",
    name: "BLT",
    price: 10.50,
    description: "Traditional style with mayo on toasted bread",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-wrap-veggie",
    name: "Veggie Wrap",
    price: 10.50,
    description: "Carrots, onions, cukes, apples, red peppers, avocado, tomato, field greens, hummus. Make it a SUPER VEGGIE: add black bean spread and hard boiled egg (+ $1.00)",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-ham",
    name: "Honey Ham",
    price: 9.00,
    description: "Lettuce, tomato, Swiss cheese & honey Dijon mustard",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-egg-sal",
    name: "Egg Salad BLT",
    price: 11.50,
    description: "Fresh egg salad, bacon, crisp lettuce & tomato, served on multi-grain",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sw-salmon",
    name: "Smoked Salmon",
    price: 13.00,
    description: "Dill Havarti & Boursin cheese, tomato, cukes, red onion & capers",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-wrap-caesar",
    name: "Chicken Caesar Club Wrap",
    price: 11.50,
    description: "Romaine, tomato, bacon, grilled chicken & homemade caesar dressing",
    category: "Lunch",
    subcategory: "Signature Paninis and Sandwiches"
  },
  {
    id: "l-sal-caprese",
    name: "The Caprese",
    price: 10.00,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Vine ripe tomatoes, fresh mozzarella, fresh basil leaves, field greens, fresh pesto, homemade balsamic vinaigrette",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-caesar",
    name: "Classic Caesar",
    price: 7.50,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Crisp romaine, croutons, red onion, shaved Parmesan & our very own Caesar dressing",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-mixed",
    name: "Mixed Greens",
    price: 8.50,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Carrots, cukes, tomatoes, onion, roasted red red peppers, romaine, field greens, parmesan cheese, iceberg and homemade balsamic vinaigrette",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-titanic",
    name: "Titanic",
    price: 12.50,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Romaine, turkey, ham, bacon, egg, tomato, onion, cukes, croutons, Swiss cheese, carrots and Ranch dressing",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-strawberry",
    name: "Strawberry Fields",
    price: 11.00,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Gorgonzola cheese, apple slices, walnuts, field greens, homemade strawberry vinaigrette & raisins",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-miri",
    name: "Mandarin Miri",
    price: 11.00,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Grilled chicken, cukes, carrots, mandarin orange slices, red bell peppers, romaine, field greens, crunchy lo mien noodles, crushed peanuts & homemade sesame ginger vinaigrette",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-greek",
    name: "Traditional Greek",
    price: 10.00,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Chunks of feta cheese, black olives, tomato, cukes, red onions, red peppers, mixed greens & fresh lemon-olive oil oregano dressing",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-sal-goat",
    name: "Goat Cheese Salad",
    price: 12.00,
    options: ["Bread - White", "Bread - Wheat", "Bread - Rye", "Bread - Focaccia", "Make it a Wrap"],
    description: "Field greens. pecans, walnuts, crumbled bacon, apples, strawberries, goat cheese ,raisins, maple vinaigrette",
    category: "Lunch",
    subcategory: "Freshly Tossed Salads"
  },
  {
    id: "l-q-chicken",
    name: "Black Bean Chicken",
    price: 12.00,
    description: "Roasted peppers, onions, grilled chicken, Monterey jack, cheddar & black bean spread. Salsa and sour cream on the side",
    category: "Lunch",
    subcategory: "Signature Quesadillas & More"
  },
  {
    id: "l-q-3cheese",
    name: "3 Cheese",
    price: 9.25,
    description: "Monterey Jack, cheddar, American, with salsa and sour cream on the side",
    category: "Lunch",
    subcategory: "Signature Quesadillas & More"
  },
  {
    id: "l-q-veggie",
    name: "Veggie",
    price: 11.50,
    description: "Roasted peppers, onions, black beans, portabella mushroom, guacamole & cheese. Salsa and sour cream on the side",
    category: "Lunch",
    subcategory: "Signature Quesadillas & More"
  },
  {
    id: "l-q-steak",
    name: "Steak Bomb",
    price: 13.50,
    description: "Onions, peppers, mushrooms, marinated grilled steak, salsa, sour cream, black bean, cheese",
    category: "Lunch",
    subcategory: "Signature Quesadillas & More"
  },

  // --- DESSERTS ---
  {
    id: "d-fresh",
    name: "Freshly Baked Desserts",
    price: 3.00,
    description: "Choose from freshly baked desserts, made FRESH every morning! Muffins, scones, brownies, cookies, and more!",
    category: "Desserts"
  },

  // --- DRINKS ---
  { id: "dr-esp", name: "Espresso", price: [2.50, 3.50, 4.00], description: "A shot of espresso", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-cap", name: "Cappuccino", price: [4.00, 4.50, 5.00], description: "Espresso, topped foamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-latte", name: "Latte", price: [4.00, 4.50, 5.00], description: "Espresso, topped with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-mocha", name: "Mocha Latte", price: [4.50, 5.00, 5.50], description: "Espresso + chocolate, topped with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-vanilla", name: "Vanilla Latte", price: [4.50, 5.00, 5.50], description: "Espresso + vanilla, topped with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-caramel", name: "Caramel Macchiato", price: [4.50, 5.00, 5.50], description: "Espresso + caramel + vanilla, topped with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-turtle", name: "Turtle", price: [4.50, 5.00, 5.50], description: "Espresso + chocolate + caramel, topped with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-patty", name: "Peppermint Patty", price: [4.50, 5.00, 5.50], description: "Espresso + chocolate + peppermint, topped with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-chai", name: "Chai Latte", price: [4.50, 5.00, 5.50], description: "Chai tea infused with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  { id: "dr-hotchoc", name: "Hot Chocolate", price: [3.00, 3.50, 4.00], description: "Rich chocolate infused with steamed milk", category: "Drinks", subcategory: "Espresso Drinks" },
  
  { 
    id: "dr-tea", 
    name: "Republic of Tea", 
    price: 2.50, 
    options: ["British Breakfast", "Earl Greyer", "Pumpkin Spice", "Emperors White", "Orange Blossom White", "Mango Ceylon", "Pomegranate Green", "Chamomile Lemon", "Peoples Green", "Ginseng Peppermint", "British Breakfast Decaf", "Good Hope Vanilla"],
    category: "Drinks", 
    subcategory: "Republic of Tea" 
  },
  
  { id: "dr-coffee-hot", name: "Signature Hot Coffee", price: [2.00, 2.50, 3.00], description: "Our coffees are freshly ground before brewing! Our House Blend, French Roast, French Vanilla, Hazelnut, Decaf", category: "Drinks", subcategory: "Coffee" },
  { id: "dr-coffee-iced", name: "Iced Coffee", price: [2.75, 3.25, 3.75], description: "We can make you any coffee beverage you like; hot, iced, you name it!", category: "Drinks", subcategory: "Coffee" },
  
  { id: "dr-lemonade", name: "Fresh Squeezed Lemonade", price: [3.50, 4.00, 4.50], category: "Drinks", subcategory: "Juice Bar" },
  { id: "dr-straight-juice", name: "Straight Up Juices", price: [5.00, 6.50, 8.00], description: "Apple • Carrot • Beet • Celery", category: "Drinks", subcategory: "Juice Bar" },
  
  { id: "dr-beet-it", name: "Beet It", price: 5.00, description: "Apple, beet, ginger", category: "Drinks", subcategory: "Signature Creations" },
  { id: "dr-detox", name: "The Detox", price: 5.00, description: "Apple, beet, cucumber, celery, lemon and ginger", category: "Drinks", subcategory: "Signature Creations" },
  { id: "dr-fire", name: "Fire Me Up", price: 5.00, description: "Carrot, beet, orange, lemon, tomato, jalapeno & garlic", category: "Drinks", subcategory: "Signature Creations" },
  { id: "dr-oxy", name: "The Oxygnenator", price: 5.00, description: "Apple, beet, carrot, ginger, lemon", category: "Drinks", subcategory: "Signature Creations" },
  { id: "dr-wakeup", name: "Wake Up", price: 5.00, description: "Apple & ginger", category: "Drinks", subcategory: "Signature Creations" },
  { id: "dr-ccake", name: "Carrot Cake", price: 5.00, description: "Apple, carrot, ginger, dash of cinnamon", category: "Drinks", subcategory: "Signature Creations" },
  { id: "dr-vampire", name: "Vegan Vampire", price: 5.00, description: "Beet, carrot, apple, cucumber", category: "Drinks", subcategory: "Signature Creations" },
  
  { id: "dr-sm-sb", name: "Strawberry Banana", price: [5.00, 6.50, 8.00], description: "Fresh strawberries, banana, non-fat vanilla yogurt, OJ", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-be", name: "Berry Explosion", price: [5.00, 6.50, 8.00], description: "Fresh strawberries, blueberries, non-fat vanilla yogurt, OJ", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-ti", name: "Tropical Island", price: [5.00, 6.50, 8.00], description: "Fresh strawberries, banana, coconut, mango, non-fat vanilla yogurt, OJ", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-gm", name: "The Green Monster", price: [5.00, 6.50, 8.00], description: "Almond milk, banana, almond butter, fresh kale, forti flax booster", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-sc", name: "Strawberry Colada", price: [5.00, 6.50, 8.00], description: "Fresh strawberries, coconut, non-fat vanilla yogurt, OJ", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-pb", name: "Peanut Butter Power", price: [5.00, 6.50, 8.00], description: "Peanut butter, almond milk, cocoa, shot of espresso", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-br", name: "Banana Rama", price: [5.00, 6.50, 8.00], description: "Banana, non-fat vanilla yogurt, OJ", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-sh", name: "Strawberry Honeydew", price: [5.00, 6.50, 8.00], description: "Fresh strawberries, honeydew, non-fat vanilla yogurt, OJ", category: "Drinks", subcategory: "Smoothie Shack" },
  { id: "dr-sm-ssr", name: "Strawberry Surf Rider", price: [5.00, 6.50, 8.00], description: "Fresh strawberries, lemonade, ice", category: "Drinks", subcategory: "Smoothie Shack" },

  // --- CATERING ---
  // Bridge Starters
  { id: "cat-vc", name: "Vegetable Crudités", price: 0, description: "A selection of fresh seasonal vegetables served with hummus and dip.", category: "Catering", subcategory: "Bridge Starters" },
  { id: "cat-gcb", name: "Gourmet Cheese Board", price: 0, description: "A selection of gourmet cheeses accompanied by crackers and fresh rosemary focaccia.", category: "Catering", subcategory: "Bridge Starters" },
  { id: "cat-ffc", name: "Fresh Fruit and Cheese Platter", price: 0, description: "Seasonal sliced fruits and berries and assortment of gourmet cheeses accompanied by crackers and fresh rosemary focaccia.", category: "Catering", subcategory: "Bridge Starters" },
  
  // Bridge Breakfast
  { 
    id: "cat-md", 
    name: "Morning Deluxe", 
    price: 0, 
    description: "Hearty breakfast burritos served on assorted wraps and grilled in a panini press. Served with sour cream, salsa & guacamole. Accompanied by a tote of our fresh ground coffee. Assortment of:\n\nEgg, Cheese & Potato\nEgg, Cheese, Meat and Potato (includes bacon, ham or sausage)\n“The Supremo” (egg, cheese, meat, potato and veggies!)", 
    category: "Catering", 
    subcategory: "Bridge Breakfast" 
  },
  { id: "cat-ss", name: "Sunrise Special", price: 0, description: "An assortment of freshly baked bagels, muffins & croissants, served with cream cheese, butter & preserves, 100% orange juice and fresh ground coffee.", category: "Catering", subcategory: "Bridge Breakfast" },
  { 
    id: "cat-cd", 
    name: "Continental Deluxe", 
    price: 0, 
    description: "An assortment of hearty egg sandwiches. Accompanied by a tote of our fresh ground coffee, 100% orange juice, and fresh cut fruit platter. Assortment of:\n\nEgg, Cheese\nEgg, Cheese & Ham\nEgg, Cheese & Sausage\nEgg, Cheese & Bacon", 
    category: "Catering", 
    subcategory: "Bridge Breakfast" 
  },
  { id: "cat-sss", name: "Sliced Smoked Salmon", price: 0, description: "A tray of smoked salmon garnished with chopped egg whites and yolks, onions, sliced cucumbers, tomatoes, and cream cheese accompanied by a selection of freshly baked bagels.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-ffp", name: "Fresh Fruit Platter", price: 0, description: "A selection of sliced seasonal fruits.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-yc", name: "Yogurt Cup", price: 0, description: "Vanilla Yogurt with fresh bananas, strawberries, and granola.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-ctt", name: "Coffee or Tea Tote", price: 0, description: "A tote of our freshly ground and brewed coffee or Republic of Tea (20 flavors to choose from) served with appropriate condiments.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-mp", name: "Muffin Platter", price: 0, description: "Assorted freshly baked muffins. Select from flavors below.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-bp", name: "Bagel Platter", price: 0, description: "Your choice of bagels with sides of freshly whipped cream cheese. Select from flavors below.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-bm", name: "Bagels & Muffins", price: 0, description: "An assortment of bagels, pastries and muffins served with cream cheese, butter & preserves.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-bc", name: "Bagel Choices", price: 0, description: "Plain • Sesame • Everything • Cinnamon Raisin • Wheat • Onion • Asiago", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-fcc", name: "Freshly Whipped Cream Cheese Flavors", price: 0, description: "Plain • Vegetable • Smoked Salmon • Pesto • Sun-Dried Tomato • Honey Walnut Lowfat Plain • Chive • Strawberry • Jalapeno", category: "Catering", subcategory: "Bridge Breakfast" },

  // Bridge Lunch
  { 
    id: "cat-la", 
    name: "Lunch Assortments", 
    price: 0, 
    description: "Sandwich platters are typically designed with an assortment of our best selling sandwiches. Or, if you prefer, please click on \"Food Menu\" (on top navigation) for sandwich choices.\n\nAll sandwiches served with your choice of; Potato Salad, Pasta Salad, Classic Café Salad or Chips. Served with appropriate condiments and utensils.\n\nAll prices are determined by the number in your party. Sandwich platters including your choice of side or chips are $12.00 per person.", 
    category: "Catering", 
    subcategory: "Bridge Lunch" 
  },
  { id: "cat-breads", name: "Your Choice of Breads", price: 0, description: "White, Wheat, Rye, Multi-Grain, or Rosemary Focaccia", category: "Catering", subcategory: "Bridge Lunch" },
  { id: "cat-wraps", name: "Your Choice of Wraps", price: 0, description: "White, Wheat, Sun-Dried Tomato", category: "Catering", subcategory: "Bridge Lunch" },
  { 
    id: "cat-byo", 
    name: "Build Your Own", 
    price: 0, 
    description: "An elegant spread that includes sliced meats and cheeses, appropriate breads, lettuce, tomato, spreads, and chips. Minimum 10.\n\nMeats: Turkey, Roast Beef, Honey Ham, Chicken Salad, Tuna Salad, Salami, Prosciutto\nCheeses: Cheddar, American, Monterey Jack, Provolone, Swiss, Dill Havarti\nBreads: White, Wheat, Multi-Grain, Focaccia, Rye", 
    category: "Catering", 
    subcategory: "Bridge Lunch" 
  },

  // Garden Fresh Salads
  { 
    id: "cat-gfs-item", 
    name: "Garden Fresh Salads", 
    price: 0, 
    description: "Please see \"Food Menu\" (on left navigation) for salad choices. All salads and dressings are made fresh using only the finest vegetables, herbs and spices. Served with appropriate condiments and utensils. Serves 10-12.", 
    category: "Catering", 
    subcategory: "Garden Fresh Salads" 
  },

  // Soups and Stews
  { 
    id: "cat-sas", 
    name: "Soups and Stews", 
    price: 0, 
    description: "Always made fresh, our soups are a great light lunch or a hearty addition to any lunch assortment.", 
    category: "Catering", 
    subcategory: "Soups and Stews" 
  },

  // Freshly Made Sides
  { 
    id: "cat-fms", 
    name: "Freshly Made Sides", 
    price: 0, 
    description: "A great addition to any lunch assortment. We make our sides to order with fresh spices and herbs. Serves 10.\n\nPasta Salad\nPotato Salad\nAsian Pasta Salad (Sesame Thai peanut dressing)\nTomato Mozzarella (with house vinaigrette)\nMediterranean Pasta Salad (with feta cheese, black olives and assortment of vegetables)", 
    category: "Catering", 
    subcategory: "Freshly Made Sides" 
  },

  // Bridge Sweets
  { 
    id: "cat-bs", 
    name: "Freshly Baked Desserts", 
    price: 0, 
    description: "All desserts made from scratch! Assorted flavors baked fresh for your event.\n\nCookies\nScones\nBrownies", 
    category: "Catering", 
    subcategory: "Bridge Sweets" 
  },
  
  // Beverages
  { id: "cat-bev", name: "Beverages", price: 0, description: "Assortment of Coca-Cola products, Vitamin Waters, juices, iced teas and energy drinks.", category: "Catering", subcategory: "Beverages" }
];

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  subcategory?: string;
  options?: string[];
  isSpecial?: boolean;
  highlightColor?: string;
  sortOrder?: number;
}

export const BUSINESS_INFO = {
  name: "The Bridge Cafe",
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

export const CATEGORY_METADATA: Record<string, { description?: string, subHeader?: string }> = {
  "Soups": {
    subHeader: "Weekly Soups and Specials - Small $4.00 or Large $5.00",
    description: "Always made fresh, our soups are a great light lunch or a hearty addition to a sandwich. Served with crackers."
  },
  "Specials": {
    subHeader: "New specials every Monday!"
  },
  "Breakfast": {
    subHeader: "Breakfast All Day",
    description: "Our items change periodically, so keep checking in with us! Craving something not on the menu? Call us – we make every item to order! Breakfast is served all day!"
  },
  "Lunch": {
    subHeader: "Your Choice of Breads: White • Wheat • Rye • Rosemary Focaccia. Wraps: White • Wheat • Sun-Dried Tomato",
    description: "All sandwiches served with your choice of side: Pasta salad • Potato salad • Cafe salad • Fruit salad • Chips"
  },
  "Dessert": {
    description: "Choose from freshly baked desserts, made FRESH every morning! Muffins, scones, brownies, cookies, and more! Our muffins won awards from the Hippo Press! Made fresh EVERY morning - call for daily flavors!"
  },
  "Espresso": {
    subHeader: "Available in decaf, as well as hot, iced or frozen!",
    description: "Choose from whole, low-fat or skim milk, or substitute soy milk for $0.50!"
  },
  "Tea": {
    subHeader: "The Republic of Tea",
    description: "Ask about our iced tea flavors!"
  },
  "Coffee": {
    subHeader: "Freshly ground before brewing!",
    description: "Our coffees are freshly ground before brewing! Our House Blend, French Roast, French Vanilla, Hazelnut, Decaf. Add a shot of espresso for $2.50 or a flavored syrup for $0.50!"
  },
  "Juice": {
    subHeader: "Fresh Squeezed & Signature Creations",
    description: "Straight Up Juices: Apple • Carrot • Beet • Celery ($5.00, $6.50, $8.00 -- no ice $1.50)"
  },
  "Smoothie": {
    subHeader: "We use all fresh fruits & veggies!",
    description: "Small - $5.00, Medium - $6.50, Large - $8.00. Add a Booster for $0.75! Dairy free with soy or almond milk for extra $1.00"
  },
  "Catering": {
    description: "At The Bridge Café on Elm, we prepare everything in-house with only the freshest ingredients, herbs, and spices. We will deliver to your needs professionally, on time, and with a presentation that will knock your socks off."
  }
};

export const MENU: MenuItem[] = [
  // SOUPS
  { id: "s-chicken-rice", name: "Chicken and Rice", price: 4.00, description: "Gluten Free", category: "Soups" },
  { id: "s-tomato-bisque", name: "Tomato Bisque", price: 4.00, description: "Gluten Free, vegetarian", category: "Soups" },
  { id: "s-clam-chowder", name: "New England Clam Chowder", price: 4.00, description: "Gluten Free", category: "Soups" },

  // SPECIALS
  {
    id: "sp-antipasto-gc",
    name: "Antipasto Grilled Cheese",
    price: 15.00,
    description: "Provoloe, mozzarella, pepperoni, spinach, salami, tomatoes, pepperincinis, roasted red peppers, olive tapenade, red onions, and a lemon- oregano dressing served on your choice of bread!",
    category: "Specials",
    isSpecial: true,
    highlightColor: "orange"
  },
  {
    id: "sp-jalapeno-popper",
    name: "Jalapeno Popper",
    price: 14.00,
    description: "Grilled Chicken, tomatoes, jalapeno cream cheese, bacon, pickled jalapenos, jack cheese, and chipotle mayo served on foccacia!",
    category: "Specials",
    isSpecial: true,
    highlightColor: "green"
  },
  {
    id: "sp-sweet-beet",
    name: "Sweet Beet Salad",
    price: 16.00,
    description: "Roasted beets over lettuce, field greens, apples, cucumbers, red onions strawberries, oranges, goat cheese, and roasted pecans served with a raspberry-chili vinnaigrette!",
    category: "Specials",
    isSpecial: true
  },

  // BREAKFAST SANDWICHES
  {
    id: "b-sw-ec",
    name: "Egg & Cheese",
    price: 3.25,
    description: "Served on your choice of Bread, Bagel, English Muffin or Croissant",
    category: "Breakfast",
    subcategory: "Breakfast Sandwiches",
    options: ["Bread", "Bagel", "English Muffin", "Croissant"]
  },
  {
    id: "b-sw-ec-meat",
    name: "Egg & Cheese with Ham, Bacon or Sausage",
    price: 4.75,
    description: "Served on your choice of Bread, Bagel, English Muffin or Croissant",
    category: "Breakfast",
    subcategory: "Breakfast Sandwiches",
    options: ["Ham", "Bacon", "Sausage", "Bread", "Bagel", "English Muffin", "Croissant"]
  },
  {
    id: "b-sw-ec-premium",
    name: "Egg & Cheese with Prosciutto or Salmon",
    price: 7.00,
    description: "Served on your choice of Bread, Bagel, English Muffin or Croissant",
    category: "Breakfast",
    subcategory: "Breakfast Sandwiches",
    options: ["Prosciutto", "Salmon", "Bread", "Bagel", "English Muffin", "Croissant"]
  },

  // BREAKFAST BURRITOS
  {
    id: "b-bur-ecp",
    name: "Egg, Cheese & Potato",
    price: 5.00,
    description: "Served w/ salsa on your choice of wrap: White, Wheat or Sun-Dried Tomato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    options: ["White wrap", "Wheat wrap", "Sun-Dried Tomato wrap"]
  },
  {
    id: "b-bur-ecmp",
    name: "Egg, Cheese, Meat and Potato",
    price: 6.50,
    description: "Served w/ salsa on your choice of wrap: White, Wheat or Sun-Dried Tomato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    options: ["Ham", "Bacon", "Sausage", "White wrap", "Wheat wrap", "Sun-Dried Tomato wrap"]
  },
  {
    id: "b-bur-supremo",
    name: "“The Supremo”",
    price: 7.00,
    description: "Egg, Cheese, Meat, Potato & Veggies! Add sour cream or guacamole for $0.75! Served w/ salsa on your choice of wrap: White, Wheat or Sun-Dried Tomato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    options: ["White wrap", "Wheat wrap", "Sun-Dried Tomato wrap", "Add sour cream (+$0.75)", "Add guacamole (+$0.75)"]
  },
  {
    id: "b-bur-chorizo",
    name: "Chorizo",
    price: 7.00,
    description: "Chorizo, black bean spread, cheddar cheese, potato, peppers and onions",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    options: ["White wrap", "Wheat wrap", "Sun-Dried Tomato wrap"]
  },
  {
    id: "b-bur-hash",
    name: "Hash Burrito",
    price: 9.00,
    description: "Homemade corned beef hash, egg, and cheese",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    options: ["White wrap", "Wheat wrap", "Sun-Dried Tomato wrap"]
  },
  {
    id: "b-bur-steak",
    name: "Steak Burrito",
    price: 9.50,
    description: "Egg, cheese, onion, peppers, potato",
    category: "Breakfast",
    subcategory: "Breakfast Burritos",
    options: ["White wrap", "Wheat wrap", "Sun-Dried Tomato wrap"]
  },

  // BAGELS AND SPREADS
  { id: "b-bag-toast", name: "Toasted Bagel", price: 2.50, description: "Bagel Choices: Plain • Sesame • Everything • Cinnamon Raisin • Asiago • Wheat • Onion", category: "Breakfast", subcategory: "Bagels and Spreads", options: ["Plain", "Sesame", "Everything", "Cinnamon Raisin", "Asiago", "Wheat", "Onion"] },
  { id: "b-bag-butter", name: "Bagel w/ Butter", price: 2.50, category: "Breakfast", subcategory: "Bagels and Spreads", options: ["Plain", "Sesame", "Everything", "Cinnamon Raisin", "Asiago", "Wheat", "Onion"] },
  { id: "b-bag-pbj", name: "Bagel w/ PB & Jelly", price: 3.00, category: "Breakfast", subcategory: "Bagels and Spreads", options: ["Plain", "Sesame", "Everything", "Cinnamon Raisin", "Asiago", "Wheat", "Onion"] },
  { id: "b-bag-cc", name: "Bagel w/ Cream Cheese", price: 3.75, description: "Freshly Whipped Cream Cheese Flavors: Plain • Vegetable • Pesto • Honey Walnut • Chive • Strawberry • Jalapeno", category: "Breakfast", subcategory: "Bagels and Spreads", options: ["Plain Bagel", "Sesame Bagel", "Everything Bagel", "Cinnamon Raisin Bagel", "Asiago Bagel", "Wheat Bagel", "Onion Bagel", "Plain CC", "Vegetable CC", "Pesto CC", "Honey Walnut CC", "Chive CC", "Strawberry CC", "Jalapeno CC"] },
  { id: "b-bag-salmon-plate", name: "Salmon plate", price: 12.00, description: "Toasted Bagel with smoked salmon, capers, red onion, chive cream cheese, cucumbers and tomato, served with homefries or fruit", category: "Breakfast", subcategory: "Bagels and Spreads" },

  // OMELETTES
  { id: "b-om-american", name: "American", price: 11.00, description: "Ham, onion, pepper, American cheese. Served with Homefries and toast", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },
  { id: "b-om-french", name: "French", price: 12.00, description: "Brie, ham, spinach. Served with Homefries and toast", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },
  { id: "b-om-meat", name: "Meat Lovers", price: 12.00, description: "Ham, bacon, sausage, American cheese. Served with Homefries and toast.", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },
  { id: "b-om-veggie", name: "Veggie", price: 11.00, description: "Pepper, onion, tomato, mushroom, spinach, cheddar. Served with Homefries and toast.", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },
  { id: "b-om-greek", name: "Greek", price: 11.00, description: "Feta, spinach & tomato. Served with Homefries and toast.", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },
  { id: "b-om-salmon", name: "Smoked Salmon", price: 13.00, description: "Tomato, onions, capers, boursin, dill havarti. Served with Homefries and toast.", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },
  { id: "b-om-spanish", name: "Spanish", price: 11.50, description: "Onion, pepper, black bean spread, salsa, cheddar. Served with Homefries and toast.", category: "Breakfast", subcategory: "Omelettes - Served w/ Home Fries & Toast!" },

  // EGGS ANY STYLE
  { id: "b-egg-2", name: "Two Eggs", price: 6.50, category: "Breakfast", subcategory: "Eggs Any Style - Served w/ Home Fries & Toast!" },
  { id: "b-egg-2-meat", name: "Two Eggs w/ Ham, Bacon or Sausage", price: 9.50, category: "Breakfast", subcategory: "Eggs Any Style - Served w/ Home Fries & Toast!" },
  { id: "b-egg-2-prosc", name: "Two Eggs w/ Proscuitto", price: 9.50, category: "Breakfast", subcategory: "Eggs Any Style - Served w/ Home Fries & Toast!" },
  { id: "b-egg-2-salm", name: "Two Eggs w/ Salmon", price: 12.00, category: "Breakfast", subcategory: "Eggs Any Style - Served w/ Home Fries & Toast!" },
  { id: "b-egg-hungry", name: "\"Hungry Man\"", price: 13.50, description: "Two eggs, ham, bacon or sausage, home fries, toast, pancakes or french toast", category: "Breakfast", subcategory: "Eggs Any Style - Served w/ Home Fries & Toast!" },

  // BREAKFAST VARIETY
  { id: "b-var-pancakes", name: "Stack of Pancakes", price: 6.00, category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-pancakes-blue", name: "Stack of Pancakes with Blueberries or Chocolate Chips", price: 7.50, category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-ft", name: "French Toast", price: 7.50, category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-ft-fruit", name: "French Toast with Blueberries or Strawberries", price: 9.00, category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-muffins", name: "Award Winning Muffins, Scones, and more!", price: 3.00, description: "Call for flavors of the day!", category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-yogurt", name: "Fruit & Yogurt Cup", price: 4.00, description: "Vanilla Yogurt with fresh bananas, strawberries, and granola.", category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-oatmeal", name: "Hot Oatmeal w/ apples, raisins, and strawberries", price: 4.00, category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },
  { id: "b-var-hash", name: "Corned Beef Hash", price: 5.50, category: "Breakfast", subcategory: "Breakfast Variety: Pancakes n' Things:" },

  // LUNCH
  { id: "l-sw-lulu", name: "The Lu Lu", price: 10.50, description: "Albacore tuna, tomato & cheddar cheese", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-cali-blt", name: "California BLT", price: 11.50, description: "Turkey, crisp bacon, Monterey Jack cheese, lettuce, tomato, avocado spread, ranch dressing, served on focaccia", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["Rosemary Focaccia", "White Bread", "Wheat Bread", "Rye Bread", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-bellarose", name: "Bella Rose", price: 11.50, description: "Prosciutto, tomato, fresh mozzarella, pesto, balsamic mayo, served on focaccia", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["Rosemary Focaccia", "White Bread", "Wheat Bread", "Rye Bread", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-miranda", name: "Miranda the Rescue Cat", price: 11.50, description: "Lime chicken, avocado, homemade hot sauce, black bean spread, sour cream, lettuce, tomato", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-cilantro-lime", name: "Cilantro-Lime Chicken", price: 10.50, description: "Cilantro-marinated grilled chicken, Monterey Jack cheese, salsa & avocado", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-chipotle-turkey", name: "Chipotle Turkey", price: 11.50, description: "Bacon, tomato, oven roasted turkey, Monterey Jack cheese & chipotle mayo", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-bridge", name: "\"The Bridge\"", price: 11.50, description: "Grilled chicken, fresh mozzarella, pesto, balsamic reduction, served on focaccia", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["Rosemary Focaccia", "White Bread", "Wheat Bread", "Rye Bread", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-bbq-wrap", name: "Spicy Chicken BBQ Wrap", price: 11.50, description: "Grilled chicken, bacon, blue cheese crumbles, cheddar, american, avocado, honey chipotle BBQ sauce, lettuce, tomato, onion", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-real-deal", name: "The Real Deal", price: 11.50, description: "Ham, turkey, bacon, cheddar cheese & dijon mustard. A best seller!", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-3cheese", name: "3 Cheese", price: 7.00, description: "Cheddar, American (add tomato for $0.50!)", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap", "Add Tomato (+$0.50)"] },
  { id: "l-sw-port-panini", name: "Balsamic Roasted Portabella", price: 11.50, description: "Gorgonzola, roasted red peppers, caramelized onions, Boursin, served on focaccia", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["Rosemary Focaccia", "White Bread", "Wheat Bread", "Rye Bread", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-cobb-wrap", name: "California Cobb Wrap", price: 11.50, description: "Roasted turkey, smoked bacon, gorgonzola crumbles, avocado spread, field greens, tomato & hard boiled egg", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-medusa", name: "The Medusa", price: 11.50, description: "Crispy eggplant, spicy feta, avocado, lettuce, tomato, black olives", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-greek-wrap", name: "Greek Chicken Wrap", price: 11.50, description: "Grilled chicken, chunks of feta, black olives, tomato, cukes, red onions, red peppers, mixed greens, fresh lemon olive-oil oregano dressing", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-reuben", name: "Classic Reuben", price: 13.00, description: "Corned Beef, Swiss, Russian dressing, sauerkraut, served on rye. (or make it a Turkey Reuben!)", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["Rye Bread", "Corned Beef", "Turkey"] },
  { id: "l-sw-steak-wrap", name: "Chunk Style Steak & Cheese Wrap", price: 13.00, description: "Marinated steak, american cheese, grilled mushrooms, onions, peppers, mayo", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-wellington", name: "The Wellington", price: 13.00, description: "Hot roast beef, caramelized onion, roasted mushrooms, boursin, gorgonzola, Swiss, steak sauce", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-tuna-sal", name: "Albacore Tuna Salad", price: 9.00, description: "Romaine lettuce & tomato", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-chicken-sal", name: "Chicken Salad", price: 9.00, description: "Romaine lettuce & tomato", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-turkey", name: "Oven Roasted Turkey", price: 10.50, description: "Dill havarti, avocado, romaine, sun-dried tomato mayo", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-blt", name: "BLT", price: 10.50, description: "Traditional style with mayo on toasted bread", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-veggie-wrap", name: "Veggie Wrap", price: 10.50, description: "Carrots, onions, cukes, apples, red peppers, avocado, tomato, field greens, hummus. Make it a SUPER VEGGIE: add black bean spread and hard boiled egg (+ $1.00)", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap", "Normal", "Super Veggie (+$1.00)"] },
  { id: "l-sw-honey-ham", name: "Honey Ham", price: 9.00, description: "Lettuce, tomato, Swiss cheese & honey Dijon mustard", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-egg-blt", name: "Egg Salad BLT", price: 11.50, description: "Fresh egg salad, bacon, crisp lettuce & tomato, served on multi-grain", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["Multi-Grain Bread", "White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-salmon", name: "Smoked Salmon", price: 13.00, description: "Dill Havarti & Boursin cheese, tomato, cukes, red onion & capers", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Bread", "Wheat Bread", "Rye Bread", "Rosemary Focaccia", "White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },
  { id: "l-sw-caesar-wrap", name: "Chicken Caesar Club Wrap", price: 11.50, description: "Romaine, tomato, bacon, grilled chicken & homemade caesar dressing", category: "Lunch", subcategory: "Signature Paninis and Sandwiches", options: ["White Wrap", "Wheat Wrap", "Sun-Dried Tomato Wrap"] },

  // SALADS
  { id: "l-sal-caprese", name: "The Caprese", price: 10.00, description: "Vine ripe tomatoes, fresh mozzarella, fresh basil leaves, field greens, fresh pesto, homemade balsamic vinaigrette", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-caesar", name: "Classic Caesar", price: 7.50, description: "Crisp romaine, croutons, red onion, shaved Parmesan & our very own Caesar dressing", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-mixed", name: "Mixed Greens", price: 8.50, description: "Carrots, cukes, tomatoes, onion, roasted red red peppers, romaine, field greens, parmesan cheese, iceberg and homemade balsamic vinaigrette", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-titanic", name: "Titanic", price: 12.50, description: "Romaine, turkey, ham, bacon, egg, tomato, onion, cukes, croutons, Swiss cheese, carrots and Ranch dressing", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-strawberry", name: "Strawberry Fields", price: 11.00, description: "Gorgonzola cheese, apple slices, walnuts, field greens, homemade strawberry vinaigrette & raisins", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-miri", name: "Mandarin Miri", price: 11.00, description: "Grilled chicken, cukes, carrots, mandarin orange slices, red bell peppers, romaine, field greens, crunchy lo mien noodles, crushed peanuts & homemade sesame ginger vinaigrette", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-greek", name: "Traditional Greek", price: 10.00, description: "Chunks of feta cheese, black olives, tomato, cukes, red onions, red peppers, mixed greens & fresh lemon-olive oil oregano dressing", category: "Lunch", subcategory: "Freshly Tossed Salads" },
  { id: "l-sal-goat", name: "Goat Cheese Salad", price: 12.00, description: "Field greens. pecans, walnuts, crumbled bacon, apples, strawberries, goat cheese ,raisins, maple vinaigrette", category: "Lunch", subcategory: "Freshly Tossed Salads" },

  // QUESADILLAS
  { id: "l-q-chicken", name: "Black Bean Chicken", price: 12.00, description: "Roasted peppers, onions, grilled chicken, Monterey jack, cheddar & black bean spread. Salsa and sour cream on the side", category: "Lunch", subcategory: "Signature Quesadillas & More" },
  { id: "l-q-3cheese", name: "3 Cheese", price: 9.25, description: "Monterey Jack, cheddar, American, with salsa and sour cream on the side", category: "Lunch", subcategory: "Signature Quesadillas & More" },
  { id: "l-q-veggie", name: "Veggie", price: 11.50, description: "Roasted peppers, onions, black beans, portabella mushroom, guacamole & cheese. Salsa and sour cream on the side", category: "Lunch", subcategory: "Signature Quesadillas & More" },
  { id: "l-q-steak", name: "Steak Bomb", price: 13.50, description: "Onions, peppers, mushrooms, marinated grilled steak, salsa, sour cream, black bean, cheese", category: "Lunch", subcategory: "Signature Quesadillas & More" },

  // DESSERT
  { id: "d-muffins", name: "Award Winning Muffins", price: 3.00, category: "Dessert" },
  { id: "d-scones", name: "Freshly Baked Scones", price: 3.00, category: "Dessert" },
  { id: "d-brownies", name: "Scratch Made Brownies", price: 3.50, category: "Dessert" },
  { id: "d-cookies", name: "Freshly Baked Cookies", price: 2.50, category: "Dessert" },

  // DRINKS - ESPRESSO
  { id: "dr-esp-shot", name: "Espresso", price: 2.50, description: "A shot of espresso", category: "Espresso" },
  { id: "dr-capp", name: "Cappuccino", price: 4.00, description: "Espresso, topped foamed milk", category: "Espresso" },
  { id: "dr-latte", name: "Latte", price: 4.00, description: "Espresso, topped with steamed milk", category: "Espresso" },
  { id: "dr-mocha", name: "Mocha Latte", price: 4.50, description: "Espresso + chocolate, topped with steamed milk", category: "Espresso" },
  { id: "dr-vanilla", name: "Vanilla Latte", price: 4.50, description: "Espresso + vanilla, topped with steamed milk", category: "Espresso" },
  { id: "dr-caramel", name: "Caramel Macchiato", price: 4.50, description: "Espresso + caramel + vanilla, topped with steamed milk", category: "Espresso" },
  { id: "dr-turtle", name: "Turtle", price: 4.50, description: "Espresso + chocolate + caramel, topped with steamed milk", category: "Espresso" },
  { id: "dr-peppermint", name: "Peppermint Patty", price: 4.50, description: "Espresso + chocolate + peppermint, topped with steamed milk", category: "Espresso" },
  { id: "dr-chai", name: "Chai Latte", price: 4.50, description: "Chai tea infused with steamed milk", category: "Espresso" },
  { id: "dr-hot-choc", name: "Hot Chocolate", price: 3.00, description: "Rich chocolate infused with steamed milk", category: "Espresso" },

  // TEA
  { id: "t-tea-flavors", name: "Republic of Tea", price: 2.50, description: "British Breakfast • Earl Greyer • Pumpkin Spice • Emperors White • Orange Blossom White Tea • Mango Ceylon • Pomegranate Green • Chamomile Lemon • Peoples Green", category: "Tea" },
  { id: "t-decaf-flavors", name: "Decaf Tea Flavors", price: 2.50, description: "Gingseng Peppermint • British Breakfast Decaf • Good Hope Vanilla", category: "Tea" },

  // COFFEE
  { id: "c-hot-coffee", name: "Signature Hot Coffee", price: 2.00, description: "House Blend, French Roast, French Vanilla, Hazelnut, Decaf", category: "Coffee" },
  { id: "c-iced-coffee", name: "Iced Coffee", price: 2.75, description: "We can make you any coffee beverage you like; hot, iced, you name it!", category: "Coffee" },

  // JUICE
  { id: "j-lemonade", name: "Fresh Squeezed Lemonade", price: 3.50, category: "Juice" },
  { id: "j-straight", name: "Straight Up Juices", price: 5.00, description: "Apple • Carrot • Beet • Celery", category: "Juice" },
  { id: "j-beet-it", name: "Beet It", price: 6.00, description: "Apple, beet, ginger", category: "Juice", subcategory: "Signature Creations" },
  { id: "j-detox", name: "The Detox", price: 6.00, description: "Apple, beet, cucumber, celery, lemon and ginger", category: "Juice", subcategory: "Signature Creations" },
  { id: "j-fire", name: "Fire Me Up", price: 6.50, description: "Carrot, beet, orange, lemon, tomato, jalapeno & garlic", category: "Juice", subcategory: "Signature Creations" },
  { id: "j-ox", name: "The Oxygnenator", price: 6.50, description: "Apple, beet, carrot, ginger, lemon", category: "Juice", subcategory: "Signature Creations" },
  { id: "j-wv", name: "Wake Up", price: 5.50, description: "Apple & ginger", category: "Juice", subcategory: "Signature Creations" },
  { id: "j-carrot-cake", name: "Carrot Cake", price: 6.00, description: "Apple, carrot, ginger, dash of cinnamon", category: "Juice", subcategory: "Signature Creations" },
  { id: "j-vegan-vamp", name: "Vegan Vampire", price: 6.50, description: "Beet, carrot, apple, cucumber", category: "Juice", subcategory: "Signature Creations" },

  // SMOOTHIES
  { id: "sm-sb", name: "Strawberry Banana", price: 5.00, description: "Fresh strawberries, banana, non-fat vanilla yogurt, OJ", category: "Smoothie" },
  { id: "sm-be", name: "Berry Explosion", price: 5.00, description: "Fresh strawberries, blueberries, non-fat vanilla yogurt, OJ", category: "Smoothie" },
  { id: "sm-ti", name: "Tropical Island", price: 5.00, description: "Fresh strawberries, banana, coconut, mango, non-fat vanilla yogurt, OJ", category: "Smoothie" },
  { id: "sm-gm", name: "The Green Monster", price: 6.50, description: "Almond milk, banana, almond butter, fresh kale, forti flax booster", category: "Smoothie" },
  { id: "sm-sc", name: "Strawberry Colada", price: 5.00, description: "Fresh strawberries, coconut, non-fat vanilla yogurt, OJ", category: "Smoothie" },
  { id: "sm-pb", name: "Peanut Butter Power", price: 6.50, description: "Peanut butter, almond milk, cocoa, shot of espresso", category: "Smoothie" },
  { id: "sm-br", name: "Banana Rama", price: 5.00, description: "Banana, non-fat vanilla yogurt, OJ", category: "Smoothie" },
  { id: "sm-sh", name: "Strawberry Honeydew", price: 5.50, description: "Fresh strawberries, honeydew, non-fat vanilla yogurt, OJ", category: "Smoothie" },
  { id: "sm-surf", name: "Strawberry Surf Rider", price: 5.00, description: "Fresh strawberries, lemonade, ice", category: "Smoothie" },

  // CATERING
  { id: "cat-crudites", name: "Vegetable Crudités", price: 0, description: "A selection of fresh seasonal vegetables served with hummus and dip. Call for pricing.", category: "Catering", subcategory: "Bridge Starters" },
  { id: "cat-cheese", name: "Gourmet Cheese Board", price: 0, description: "A selection of gourmet cheeses accompanied by crackers and fresh rosemary focaccia.", category: "Catering", subcategory: "Bridge Starters" },
  { id: "cat-fruit-cheese", name: "Fresh Fruit and Cheese Platter", price: 0, description: "Seasonal sliced fruits and berries and assortment of gourmet cheeses accompanied by crackers and fresh rosemary focaccia.", category: "Catering", subcategory: "Bridge Starters" },
  { id: "cat-morning-deluxe", name: "Morning Deluxe", price: 0, description: "Hearty breakfast burritos served on assorted wraps and grilled in a panini press. Served with sour cream, salsa & guacamole. Accompanied by a tote of our fresh ground coffee.", category: "Catering", subcategory: "Bridge Breakfast" },
  { id: "cat-sunrise", name: "Sunrise Special", price: 0, description: "An assortment of freshly baked bagels, muffins & croissants, served with cream cheese, butter & preserves, 100% orange juice and fresh ground coffee.", category: "Catering", subcategory: "Sunrise Special" },
  { id: "cat-cont-deluxe", name: "Continental Deluxe", price: 0, description: "An assortment of hearty egg sandwiches. Accompanied by a tote of our fresh ground coffee, 100% orange juice, and fresh cut fruit platter.", category: "Catering", subcategory: "Continental Deluxe" },
  { id: "cat-salmon", name: "Sliced Smoked Salmon Tray", price: 0, description: "A tray of smoked salmon garnished with chopped egg whites and yolks, onions, sliced cucumbers, tomatoes, and cream cheese accompanied by a selection of freshly baked bagels.", category: "Catering", subcategory: "Sliced Smoked Salmon" },
  { id: "cat-fruit-platter", name: "Fresh Fruit Platter", price: 0, description: "A selection of sliced seasonal fruits.", category: "Catering", subcategory: "Fresh Fruit Platter" },
  { id: "cat-yogurt-cup", name: "Yogurt Cup", price: 4.00, description: "Vanilla Yogurt with fresh bananas, strawberries, and granola.", category: "Catering", subcategory: "Yogurt Cup" },
  { id: "cat-tote", name: "Coffee or Tea Tote", price: 25.00, description: "A tote of our freshly ground and brewed coffee or Republic of Tea served with appropriate condiments.", category: "Catering", subcategory: "Coffee or Tea Tote" },
  { id: "cat-muffin-plat", name: "Muffin Platter", price: 0, description: "Assorted freshly baked muffins.", category: "Catering", subcategory: "Muffin Platter" },
  { id: "cat-bagel-plat", name: "Bagel Platter", price: 0, description: "Your choice of bagels with sides of freshly whipped cream cheese.", category: "Catering", subcategory: "Bagel Platter" },
  { id: "cat-lunch-plat", name: "Lunch Assortment Platter", price: 12.00, description: "Sandwich platters typically designed with an assortment of our best selling sandwiches. Includes choice of side.", category: "Catering", subcategory: "Bridge Lunch" },
  { id: "cat-byo", name: "Build Your Own Lunch", price: 15.00, description: "Sliced meats and cheeses, appropriate breads, lettuce, tomato, spreads, and chips. Minimum 10.", category: "Catering", subcategory: "Bridge Lunch" },
  { id: "cat-pasta", name: "Pasta Salad", price: 0, category: "Catering", subcategory: "Freshly Made Sides" },
  { id: "cat-potato", name: "Potato Salad", price: 0, category: "Catering", subcategory: "Freshly Made Sides" },
  { id: "cat-sweets", name: "Bridge Sweets Assortment", price: 0, description: "All desserts made from scratch! Cookies, Scones, Brownies.", category: "Catering", subcategory: "Bridge Sweets" }
];

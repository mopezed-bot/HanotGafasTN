-- Tunisia-Specific Categories for Gafsa Marketplace

-- Insert main categories for Tunisia market
INSERT INTO categories (name, slug, description, icon, sort_order, is_active) VALUES
-- Electronics & Phones (Electronique & Téléphones)
('Electronics & Phones', 'electronics-phones', 'Phones, computers, tablets, and accessories', 'laptop', 1, true),

-- Vehicles (Véhicules)
('Vehicles', 'vehicles', 'Cars, motorcycles, spare parts', 'car', 2, true),

-- Real Estate (Immobilier)
('Real Estate', 'real-estate', 'Apartments, houses, land for sale and rent', 'home', 3, true),

-- Home & Furniture (Maison & Meubles)
('Home & Furniture', 'home-furniture', 'Furniture, appliances, home decor', 'sofa', 4, true),

-- Fashion & Clothing (Mode & Vêtements)
('Fashion & Clothing', 'fashion-clothing', 'Clothing, shoes, accessories', 'shirt', 5, true),

-- Sports & Leisure (Sports & Loisir)
('Sports & Leisure', 'sports-leisure', 'Sports equipment, bikes, gym', 'dumbbell', 6, true),

-- Jobs (Emploi)
('Jobs', 'jobs', 'Job offers and job seeking', 'briefcase', 7, true),

-- Services (Services)
('Services', 'services', 'Professional and personal services', 'tool', 8, true),

-- Baby & Kids (Bébé & Enfant)
('Baby & Kids', 'baby-kids', 'Baby clothes, toys, strollers', 'baby', 9, true),

-- Other (Autre)
('Other', 'other', 'Other items', 'box', 10, true)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = true;

-- Sub-categories
INSERT INTO categories (name, slug, description, parent_id, sort_order, is_active) VALUES
-- Electronics sub-categories
('Mobile Phones', 'mobile-phones', 'Smartphones and mobile phones', (SELECT id FROM categories WHERE slug = 'electronics-phones'), 1, true),
('Computers & Laptops', 'computers-laptops', 'Desktop and laptop computers', (SELECT id FROM categories WHERE slug = 'electronics-phones'), 2, true),
('Tablets & iPads', 'tablets-ipads', 'Tablets and iPads', (SELECT id FROM categories WHERE slug = 'electronics-phones'), 3, true),
('Accessories', 'electronics-accessories', 'Phone and computer accessories', (SELECT id FROM categories WHERE slug = 'electronics-phones'), 4, true),
('Gaming', 'gaming', 'Consoles, games, gaming PC', (SELECT id FROM categories WHERE slug = 'electronics-phones'), 5, true),

-- Vehicles sub-categories
('Cars', 'cars', 'Cars for sale', (SELECT id FROM categories WHERE slug = 'vehicles'), 1, true),
('Motorcycles', 'motorcycles', 'Motorcycles and scooters', (SELECT id FROM categories WHERE slug = 'vehicles'), 2, true),
('Spare Parts', 'spare-parts', 'Vehicle spare parts', (SELECT id FROM categories WHERE slug = 'vehicles'), 3, true),
('Tires & Wheels', 'tires-wheels', 'Tires and wheels', (SELECT id FROM categories WHERE slug = 'vehicles'), 4, true),

-- Real Estate sub-categories
('Apartments', 'apartments', 'Apartments for sale', (SELECT id FROM categories WHERE slug = 'real-estate'), 1, true),
('Houses', 'houses', 'Houses and villas', (SELECT id FROM categories WHERE slug = 'real-estate'), 2, true),
('Land', 'land', 'Land and plots', (SELECT id FROM categories WHERE slug = 'real-estate'), 3, true),
('Rent', 'rent', 'Properties for rent', (SELECT id FROM categories WHERE slug = 'real-estate'), 4, true),

-- Fashion sub-categories
('Clothing', 'clothing', 'Men and women clothing', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 1, true),
('Shoes', 'shoes', 'Men and women shoes', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 2, true),
('Watches & Jewelry', 'watches-jewelry', 'Watches and jewelry', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 3, true),
('Bags', 'bags', 'Handbags and backpacks', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 4, true),
('Sunglasses', 'sunglasses', 'Sunglasses and eyeglasses', (SELECT id FROM categories WHERE slug = 'fashion-clothing'), 5, true),

-- Home sub-categories
('Furniture', 'furniture', 'Sofas, beds, tables', (SELECT id FROM categories WHERE slug = 'home-furniture'), 1, true),
('Appliances', 'appliances', 'Refrigerators, washing machines', (SELECT id FROM categories WHERE slug = 'home-furniture'), 2, true),
('Decor', 'decor', 'Home decor and curtains', (SELECT id FROM categories WHERE slug = 'home-furniture'), 3, true),
('Kitchen', 'kitchen', 'Kitchenware and utensils', (SELECT id FROM categories WHERE slug = 'home-furniture'), 4, true),

-- Jobs sub-categories
('Full-time Jobs', 'full-time-jobs', 'Full-time employment', (SELECT id FROM categories WHERE slug = 'jobs'), 1, true),
('Part-time Jobs', 'part-time-jobs', 'Part-time work', (SELECT id FROM categories WHERE slug = 'jobs'), 2, true),
('Internships', 'internships', 'Internship opportunities', (SELECT id FROM categories WHERE slug = 'jobs'), 3, true),
('Freelance', 'freelance', 'Freelance work', (SELECT id FROM categories WHERE slug = 'jobs'), 4, true)
ON CONFLICT (slug) DO NOTHING;

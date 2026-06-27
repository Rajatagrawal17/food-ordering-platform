# Seeding with Kaggle Data

The project supports two seeding modes:

| Command | Description |
|---|---|
| `npm run seed --workspace server` | Procedural seed — generates 8 fictional restaurants & 48 dishes. No CSV files required. Use this for a fast local reset. |
| `npm run seed:kaggle --workspace server` | Kaggle CSV import — imports real restaurant + dish data from two CSV files. Requires files to be placed first (see below). |

---

## Required CSV Files

Place the following files in `server/data/` **before** running `seed:kaggle`:

```
server/data/restaurants.csv
server/data/dishes.csv
```

> [!IMPORTANT]
> These files are excluded from git (`server/data/*.csv` in `.gitignore`) because they are large and licensed for personal/research use under Kaggle's terms of service.

### Recommended Kaggle Datasets

**restaurants.csv** — use any Zomato or Swiggy restaurant dataset:
- [Zomato Bangalore Restaurants](https://www.kaggle.com/datasets/himanshupoddar/zomato-bangalore-restaurants)
- [Swiggy Restaurants Dataset](https://www.kaggle.com/datasets/abhijitdahatonde/swiggy-restuarant-dataset)

**dishes.csv** — use a Swiggy menu items dataset:
- [Swiggy Food Menu Dataset](https://www.kaggle.com/datasets/rrkcoder/swiggy-food-menu-dataset)
- Any Kaggle dataset with restaurant name + dish name + price columns

### Column Detection

The import script (`server/scripts/importKaggleData.js`) **automatically detects column names** by inspecting the actual CSV header row. It does not assume specific column names. When you run `seed:kaggle` it will print:

```
[restaurants.csv] Headers detected: name, city, area, cuisine, rating, ...
[restaurants.csv] Column mapping: { name: 'name', city: 'city', ... }
```

Review this output to confirm mapping is correct before importing into production.

---

## What the Import Does

1. Parses `restaurants.csv`, deduplicates by `name + city`, caps at **40 restaurants**.
2. Assigns Unsplash banner images (cycles through 15 curated food images).
3. Parses `dishes.csv`, joins to imported restaurants by name (case-insensitive).
4. Caps dishes at **8 per restaurant**.
5. Maps dish categories into the fixed list: `Biryani, Pizza, Burger, Dessert, Beverage, Salad, Wrap, Breakfast, Noodles, Bowls`.
6. Normalises prices to INR (handles foreign currencies by clamping to ₹50–₹1200).
7. Seeds users (1 admin + 12 customers), reviews, sample carts, and orders.
8. Warms Redis cache for all restaurant and food endpoints.

---

## Verification Steps

After running `seed:kaggle`, verify:

```bash
# 1. Check restaurant list
curl https://your-api.onrender.com/api/v1/restaurants

# 2. Check food category filter still works
curl "https://your-api.onrender.com/api/v1/foods?category=Pizza"

# 3. Check restaurant detail (use an _id from step 1)
curl https://your-api.onrender.com/api/v1/restaurants/<id>
```

Expected: real restaurant names, plausible INR prices (₹80–₹1200), recognisable categories.

# Recipe Import System - User Guide

## Overview
The recipe import system allows you to paste recipe data directly from Excel and import it into your recipe collection with an editable preview before saving.

## How to Use

### Step 1: Navigate to Import Page
1. Go to the Admin Panel → Recipe Manager
2. Click the **"Import Recipe"** button (next to "Add New Recipe")
3. You'll be taken to `/admin/recipes/import`

### Step 2: Prepare Your Excel Data
1. Open your Excel recipe file (e.g., "Pizza Veggie Supreme" or "Mac and Cheese")
2. **Select ALL cells** containing the recipe data:
   - Start from the title row (e.g., "CENTRAL KITCHEN — RECIPE")
   - Include all sections through "Packing & Labeling"
3. **Copy the data** (Ctrl+C or Cmd+C)

### Step 3: Paste and Parse
1. Click in the large textarea on the import page
2. **Paste the data** (Ctrl+V or Cmd+V)
3. Click the **"Parse Recipe Data"** button
4. The system will automatically extract:
   - Recipe name, station, code, yield
   - All ingredients (main + sub-recipes)
   - Machines & tools
   - Preparation steps
   - Quality specifications
   - Packing & labeling details

### Step 4: Review & Edit
The system displays an **editable preview** with collapsible sections:

#### ✅ Basic Information (REQUIRED)
- **Recipe Name** - Edit if needed
- **Station** - Hot Section, Cold Section, etc.
- **Category** - Select from dropdown (Main Course, Appetizer, etc.)
- **Days Available** - ⚠️ **MUST SELECT AT LEAST ONE DAY**
- **Prep Time / Cook Time** - Edit if needed
- **Allergens** - Comma-separated list

#### ✅ Main Ingredients
- Review parsed ingredients
- Edit name, quantity, unit for each
- Delete ingredients using the trash icon
- Add new ingredients with "+ Add Ingredient"

#### ✅ Sub-Recipes (if detected)
- View any sub-recipes that were parsed
- Shows ingredient count for each

#### ✅ Preparation Steps
- Edit step instructions
- Modify time estimates
- Add hints/notes
- Delete or reorder steps
- Add new steps with "+ Add Step"

#### ✅ Machines & Tools
- Review equipment list
- View purpose and settings

#### ✅ Quality Specifications
- Review quality checks

#### ✅ Packing & Labeling
- View storage and shelf life info

### Step 5: Save Recipe
1. Ensure **Days Available** is selected (required!)
2. Click **"✓ Save Recipe"**
3. The recipe will be saved to your collection
4. You'll be automatically redirected to the recipe detail page

## Supported Excel Formats

The parser is **flexible** and supports multiple formats:

### Format 1: Sectioned Ingredients (Pizza Veggie Supreme style)
```
1. Recipe Information
Recipe Name    |    | Pizza Veggie Supreme

2A. Ingredients - Pizza Veggie Supreme - Hot Section
Ingredient Name | Quantity | Unit | Specifications
Dough Pizza     | 1.00     | unit |

2B. Ingredients - Sauce Tomato 1 KG (Sub-Recipe)
Ingredient Name | Quantity | Unit | Specifications
Garlic Fresh    | 1.2      | GM   |
```

### Format 2: Single Ingredients Table (Mac and Cheese style)
```
1. Recipe Information
Recipe Name    |    | Hm Maccaroni & Cheese

2. Ingredients Table - Mac & Cheese 1 KG - Hot Section
Ingredient Name         | Quantity | Unit | Specifications
White Sauce 1 KG        | 800      | GM   |
Cheese Cheddar Block    | 100      | GM   | 0
```

Both formats are automatically detected and parsed correctly!

## Tips for Best Results

### ✓ DO:
- Copy the **entire recipe** from Excel (all sections)
- Include header rows (Recipe Name, Ingredient Name, etc.)
- Use standard Excel copy (Ctrl+C) - maintains tab structure
- Review the parsed data before saving
- Select at least one day for the recipe

### ✗ DON'T:
- Copy just a partial section
- Manually type the data (always copy from Excel)
- Skip the Days Available selection
- Save without reviewing the preview

## Troubleshooting

### "Please paste complete recipe data from Excel"
- You need at least 5-10 rows of data
- Make sure you copied the entire recipe including headers

### "Recipe name is required"
- The parser couldn't find the Recipe Name field
- Check that row 5 or nearby has "Recipe Name" in column A

### "Please select at least one day"
- You must check at least one day checkbox before saving
- This is a required field

### Ingredients not parsing correctly
- Ensure the "Ingredient Name" header row is included
- Check that quantities are in the expected columns (B and C)

### Preparation steps missing
- Look for "4. Step-by-Step Cooking Process" section
- Make sure step descriptions are in column B or merged into column A

## Advanced Features

### Editing Parsed Data
- All sections are fully editable before saving
- You can add, remove, or modify any content
- Changes are saved when you click "✓ Save Recipe"

### Sub-Recipe Detection
The parser automatically detects sub-recipes when:
- Multiple ingredient sections exist (2A, 2B, 2C, etc.)
- Section headers contain "Sub-Recipe" or reference "1 KG" yields

### Validation
The system validates:
- Recipe name is present
- At least one day is selected
- Recipe ID doesn't already exist (prevents duplicates)

## What Gets Auto-Generated

Some fields are automatically filled if not in the Excel:
- **Recipe ID** - Generated from recipe name (lowercase, hyphenated)
- **Placeholder Photos** - Generic photo URLs (can be changed later)
- **Prep/Cook Time** - Defaults to "30 minutes" if not specified
- **Category** - Defaults to "Main Course" (can be changed)

## After Import

Once saved, you can:
- View the recipe on its detail page
- Edit it further using the recipe manager
- Share it with branch staff
- Include it in dispatch planning

## Need Help?

If you encounter issues:
1. Check that your Excel format matches the examples
2. Verify all required sections are included
3. Try copying a smaller test recipe first
4. Check the browser console for detailed error messages

---

**Ready to import your 60 recipes?** Just follow the steps above for each one! 🚀


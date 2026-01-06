/**
 * Unit mappings for dispatch items
 * 
 * These items have specific unit of measure requirements instead of defaulting to "KG".
 * The mapping is case-insensitive and uses partial matching for flexibility.
 */

// Exact match mappings (case-insensitive)
export const ITEM_UNIT_MAPPINGS: Record<string, string> = {
  // Items with "unit" as UOM
  'dough manakish 120 gr': 'unit',
  'dough pizza 23cm': 'unit',
  'loaf english banana cake': 'unit',
  'loaf english cake white': 'unit',
  'waffle': 'unit',
  'yorkshire pudding': 'unit',
  'bev, laban up': 'unit',
  'bread samoun 60g': 'unit',
  'bread, brioche, burger bun, 30g': 'unit',
  'bread, burger bun': 'unit',
  'bread, ciabatta 25x120 gram': 'unit',
  'bread, ciabatta 30x100 gram': 'unit',
  'bread, club sandwich, white': 'unit',
  'bread, tortilla white': 'unit',
  'eggs unit': 'unit',
  'fruit yogurt 125 gm': 'unit',
  'ketchup sachet': 'unit',
  'milk 180ml': 'unit',
  'milkshake chocolate 180 ml': 'unit',
  'milkshake strawberry 180 ml': 'unit',
  'pckg, black base rect cont 2 comp': 'unit',
  'pckg, black base rect cont 3 comp': 'unit',
  'pckg, black hd fork individually wrap': 'unit',
  'pckg, black hd spoon individually wrap': 'unit',
  'pckg, cellophane bag small': 'unit',
  'pckg, clear cups 12oz': 'unit',
  'pckg, clear juice glass 10 oz pet': 'unit',
  'pckg, cuttlery pack 4 in 1': 'unit',
  'pckg, cuttlery pack clear/black': 'unit',
  'pckg, kraft lunch box klb120': 'unit',
  'pckg, kraft lunch box klb150': 'unit',
  'pckg, kraft pe take away box 22oz ktab22': 'unit',
  'pckg, paper muffin cup 4 oz': 'unit',
  'pckg, pizza box 22x22': 'unit',
  'pckg, salad bowl 12-oz': 'unit',
  'pckg, sauce cup 2 oz': 'unit',
  'pckg, sauce cup 4 oz': 'unit',
  'pckg, straws - indivisual pack': 'unit',
  
  // Items with "box" as UOM
  'cling flim': 'box',
  'cling film': 'box', // alternate spelling
  'gloves': 'box',
  
  // Items with "pack" as UOM
  'maxi roll': 'pack',
  
  // Items that should remain as "kg"
  'garbage bag': 'kg',
}

// Partial match patterns for more flexible matching
// These will match if the item name CONTAINS the pattern
export const PARTIAL_MATCH_PATTERNS: Array<{ pattern: string; unit: string }> = [
  // Dough items
  { pattern: 'dough manakish', unit: 'unit' },
  { pattern: 'dough pizza', unit: 'unit' },
  
  // Loaf items
  { pattern: 'loaf english', unit: 'unit' },
  
  // Bread items
  { pattern: 'bread samoun', unit: 'unit' },
  { pattern: 'bread, brioche', unit: 'unit' },
  { pattern: 'bread, burger', unit: 'unit' },
  { pattern: 'bread, ciabatta', unit: 'unit' },
  { pattern: 'bread, club sandwich', unit: 'unit' },
  { pattern: 'bread, tortilla', unit: 'unit' },
  
  // Beverages
  { pattern: 'laban up', unit: 'unit' },
  { pattern: 'milk 180', unit: 'unit' },
  { pattern: 'milkshake', unit: 'unit' },
  { pattern: 'fruit yogurt', unit: 'unit' },
  
  // Eggs
  { pattern: 'eggs unit', unit: 'unit' },
  
  // Packaging items (pckg)
  { pattern: 'pckg,', unit: 'unit' },
  
  // Sachets
  { pattern: 'ketchup sachet', unit: 'unit' },
  
  // Bakery items
  { pattern: 'waffle', unit: 'unit' },
  { pattern: 'yorkshire pudding', unit: 'unit' },
  
  // Box items
  { pattern: 'cling fl', unit: 'box' },
  { pattern: 'gloves', unit: 'box' },
  
  // Pack items
  { pattern: 'maxi roll', unit: 'pack' },
  
  // KG items
  { pattern: 'garbage bag', unit: 'kg' },
]

/**
 * Get the correct unit of measure for an item
 * @param itemName - The name of the item
 * @param defaultUnit - The default unit to use if no mapping is found (defaults to 'KG')
 * @returns The correct unit of measure for the item
 */
export function getItemUnit(itemName: string, defaultUnit: string = 'KG'): string {
  const normalizedName = itemName.toLowerCase().trim()
  
  // First, check exact matches
  if (ITEM_UNIT_MAPPINGS[normalizedName]) {
    return ITEM_UNIT_MAPPINGS[normalizedName]
  }
  
  // Then, check partial matches
  for (const { pattern, unit } of PARTIAL_MATCH_PATTERNS) {
    if (normalizedName.includes(pattern.toLowerCase())) {
      return unit
    }
  }
  
  // Return default unit if no match found
  return defaultUnit
}

/**
 * Check if an item has a special unit mapping
 * @param itemName - The name of the item
 * @returns True if the item has a special unit mapping
 */
export function hasSpecialUnitMapping(itemName: string): boolean {
  const normalizedName = itemName.toLowerCase().trim()
  
  // Check exact matches
  if (ITEM_UNIT_MAPPINGS[normalizedName]) {
    return true
  }
  
  // Check partial matches
  for (const { pattern } of PARTIAL_MATCH_PATTERNS) {
    if (normalizedName.includes(pattern.toLowerCase())) {
      return true
    }
  }
  
  return false
}


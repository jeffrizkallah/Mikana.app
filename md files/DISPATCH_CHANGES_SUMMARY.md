# Dispatch System Changes - Total Quantity Parsing

## Summary

The dispatch upload system has been updated to parse **total weekly quantities** per branch instead of date-specific quantities. This aligns with your dispatch workflow where you dispatch once per week using the total quantity needed for each item at each branch.

## What Changed

### Before
- System parsed individual date columns (Mon, Tue, Wed, Thu, Fri) for each branch
- Required selecting a specific delivery date
- Extracted quantities from that specific date column

### After
- System now parses the **Total column** for each branch
- No date selection needed - uses weekly totals automatically
- Simpler workflow: Parse → Generate → Create

## Technical Changes

### File Modified: `app/dispatch/upload/page.tsx`

#### 1. **parseExcelData() Function** (Lines 58-118)
**Changed:** 
- Now looks for "Total" columns in the second header row
- Searches up to 15 columns after each branch name to find "Total"
- Stores the Total column index for each branch
- Removed date column detection logic

**Logic:**
```
For each branch name found in Row 1:
  └─> Look in Row 2 for next "Total" label
      └─> Store that column index
```

#### 2. **generateDispatch() Function** (Lines 120-239)
**Changed:**
- Uses Total column index to extract quantities
- Removed date-specific column lookup
- Directly reads from branchTotalColumns[branchName]

**Logic:**
```
For each item row:
  For each branch:
    └─> Read quantity from Total column
        └─> If quantity > 0, add to dispatch
```

#### 3. **saveDispatch() Function** (Lines 241-301)
**Changed:**
- Uses current date as delivery date instead of parsing Excel date
- Simplified date handling (no longer converts "24-Nov" format)

#### 4. **UI Updates** (Lines 369-409)
**Changed:**
- Step 2 now shows "Generate Dispatch from Total Quantities"
- Removed date selection buttons
- Preview shows "Weekly Total" instead of specific date
- Updated grid from 4 columns to 3 (removed date display)

## Excel Format Expected

### Row Structure
```
Row 1: [Rec Ref] | Recipe | ... | Soufouh | [dates] | [dates] | ... | DIP | [dates] | [dates] | ...
Row 2: [empty]   | [empty]| ... | Total   | Mon     | Tue     | ... | Total | Mon   | Tue    | ...
Row 3+: [data]   | Item   | ... | 2.4     | 0.6     | 0.6     | ... | 3.6   | 0.9   | 0.9    | ...
```

### Key Columns
- **Column B (index 1)**: Recipe/Item name
- **Column I (index 8)**: Unit (Kg, Unit, Liter)
- **Branch columns**: Each branch has date columns followed by a **Total** column

### What Gets Extracted
✅ Item name from Column B  
✅ Unit from Column I  
✅ **Total quantity** from each branch's Total column  
❌ Individual date quantities (ignored)

## Branch Name Mapping

The system recognizes these Excel branch names:
- `Soufouh` → isc-soufouh
- `DIP` → isc-dip
- `Sharja` → isc-sharja
- `AlJada` → isc-aljada
- `Ajman` → isc-ajman
- `UEQ` → isc-ueq
- `RAK` → isc-rak
- `YAS` → sabis-yas
- `Ruwais` → ruwais
- `CA` → ck
- `Ain` → isc-ain
- `Khalifa` → isc-khalifa

## Updated Workflow

### For Head Office (Sara)
1. Copy Excel data (include both header rows)
2. Paste into upload page
3. Click "Parse Data" → System finds Total columns
4. Click "Generate Dispatch Preview" → Uses weekly totals
5. Review and click "Create Digital Dispatches"
6. Done! All branches see their weekly totals

### Example
From your data:
```
Apple Sauce 1 Kg:
- Soufouh Total: 0.2 Kg ✅ (not 0.0 + 0.2 + 0.0...)
- DIP Total: 0.1 Kg ✅
- Sharja Total: 0.2 Kg ✅
```

The dispatch will show:
- ISC Soufouh: Apple Sauce 1 Kg = 0.2 Kg
- ISC DIP: Apple Sauce 1 Kg = 0.1 Kg
- ISC Sharja: Apple Sauce 1 Kg = 0.2 Kg

## Testing Instructions

1. **Navigate to** `/dispatch/upload`
2. **Paste your Excel data** (the data you provided in the request)
3. **Click "Parse Data"**
   - Should show: "Found X branches with Total columns"
4. **Click "Generate Dispatch Preview"**
   - Should display all branches with their total quantities
5. **Review the preview**
   - Check that quantities match the "Total" columns from Excel
   - Verify all branches are included
6. **Click "Create Digital Dispatches"**
   - Dispatch will be created with today's date
7. **Check branch pages**
   - Each branch should see their items with weekly totals

## Documentation Updated

Files updated:
- ✅ `app/dispatch/upload/page.tsx` - Main parsing logic
- ✅ `DISPATCH_GUIDE.md` - User instructions
- ✅ `DISPATCH_CHANGES_SUMMARY.md` - This file

## Notes

- The system now dispatches with **weekly totals only**
- Delivery date is set to today's date (can be adjusted if needed)
- Items with 0 quantity are excluded from the dispatch
- All quantities are read from the "Total" column in Row 2

## Verification

To verify the changes are working:
1. Look for "Total" in console logs when parsing
2. Check that preview shows correct quantities
3. Compare generated dispatch with Excel Total columns
4. Ensure all branches with non-zero totals appear

---

**Changes completed on:** November 13, 2025  
**Modified by:** AI Assistant  
**Requested by:** User (Sara's workflow optimization)


# ✅ Parser Updated for Your Excel Format

## What Was Changed

The dispatch parser has been updated to handle your **exact Excel format** with the complex two-header-row structure.

---

## Key Updates

### 1. **Two-Header-Row Support**
- **Row 1**: Branch names (Soufouh, DIP, Sharja, AlJada, Ajman, UEQ, RAK, YAS, Ruwais, CA, Ain, Khalifa)
- **Row 2**: Date columns (24 Nov, 25 Nov, 26 Nov, 27 Nov, 28 Nov)

### 2. **All 12 Branches Supported**
Updated branch mapping to include:
- Soufouh, DIP, Sharja, AlJada (**not** Atlada)
- Ajman, UEQ, RAK, YAS, Ruwais
- **CA** (Central Kitchen → ck)
- **Ain** (ISC Ain → isc-ain)
- **Khalifa** (ISC Khalifa → isc-khalifa)

### 3. **Correct Column Parsing**
- **Recipe Name**: Column B (index 1)
- **Adj Unit**: Column I (index 8)
- **Quantities**: In branch date columns (dynamically detected)

### 4. **Date Format Support**
Now handles: **"24 Nov"** format (with space between day and month)

### 5. **Comma Handling**
Parser now correctly handles quantities with commas:
- `1,950.0` → `1950.0`
- `1,284.0` → `1284.0`

---

## How It Works Now

1. **Parse Headers**:
   - Scans Row 1 for branch names
   - Scans Row 2 for date columns under each branch
   - Each branch has 5-7 date columns following it

2. **Extract Items**:
   - Starts from Row 3 (skips both headers)
   - Gets recipe name from Column B
   - Gets unit from Column I
   - For each branch and selected date:
     - Finds the column index for that date
     - Extracts quantity
     - Only includes items where quantity > 0

3. **Create Dispatches**:
   - Groups items by branch
   - Shows preview with totals
   - Creates digital dispatch records

---

## Files Updated

1. **`app/dispatch/upload/page.tsx`**
   - Updated `branchNameToSlug` mapping
   - Rewrote `parseExcelData()` function
   - Rewrote `generateDispatch()` function
   - Updated date conversion in `saveDispatch()`

2. **`EXCEL_FORMAT_EXAMPLE.txt`**
   - Updated with correct Excel structure
   - Added two-header-row explanation
   - Updated branch list
   - Updated troubleshooting guide

---

## Testing Instructions

### Step 1: Copy Your Excel Data
1. Open your SharePoint Excel file
2. Select from cell A1 to the last branch column
3. Include **both header rows** and all item rows
4. Press Ctrl+C

### Step 2: Create Dispatch
1. Go to: http://localhost:3000/dispatch/upload
2. Paste data into the textarea (Ctrl+V)
3. Click **"Parse Data"**
4. You should see: "✓ Data parsed successfully! Found 12 branches"

### Step 3: Select Date
1. Click on one of the date buttons (e.g., "24 Nov")
2. Click **"Generate Dispatch Preview"**
3. Review the preview showing branches and item counts

### Step 4: Confirm
1. Click **"Create Digital Dispatches"**
2. System creates dispatches for all branches
3. Branch managers can now see them on their pages!

---

## What To Expect

### When Parsing:
```
✓ Data parsed successfully!

Found 12 branches
Available dates: 24 Nov, 25 Nov, 26 Nov, 27 Nov, 28 Nov

Please select a delivery date below.
```

### In Preview:
```
Preview:
✓ 12 branches detected
✓ ~150-200 total items

📋 ISC Soufouh - 23 items
📋 ISC DIP - 18 items
📋 ISC Sharjah - 21 items
📋 ISC Aljada - 25 items
📋 ISC Ajman - 19 items
📋 ISC UEQ - 17 items
📋 ISC RAK - 15 items
📋 Sabis YAS - 22 items
📋 Ruwais - 12 items
📋 CK - 20 items
📋 ISC Ain - 18 items
📋 ISC Khalifa - 19 items
```

---

## Troubleshooting

### Parser Can't Find Branches
**Issue**: "No branches found in header"

**Solution**:
- Make sure Row 1 contains exact branch names
- Check spelling: AlJada (not Atlada), CA, Ain, Khalifa
- Ensure no extra spaces or special characters

### Parser Can't Find Dates
**Issue**: "No date columns found"

**Solution**:
- Make sure Row 2 contains dates
- Format should be: "24 Nov" (with space)
- Dates should be directly under branch columns

### No Items in Preview
**Issue**: Preview shows 0 items for branches

**Solution**:
- Check that data starts from Row 3
- Verify quantities are in correct columns
- Make sure selected date matches date in Row 2
- Check that quantities are > 0

### Wrong Items or Quantities
**Issue**: Items don't match Excel

**Solution**:
- Verify Recipe name is in Column B
- Check Adj Unit is in Column I
- Ensure you copied complete rows
- Check for merged cells in Excel

---

## Debug Mode

The parser includes console logging for debugging:

1. Open browser console (F12)
2. Paste and parse your data
3. Look for logs:
   ```
   Branch headers: [...]
   Date headers: [...]
   Branch positions: {...}
   Branch date columns: {...}
   ```

4. Check that branches and dates are detected correctly

---

## Example Console Output

```javascript
Branch headers: ["137 Items to be Dispatched to Branches", "", "Mon", "Tue", "Wed", "Thu", "Fri", "", "Soufouh", "", "", "", "", "", "DIP", ...]

Date headers: ["Rec. Ref", "Recipe", "Recipe Cost", "Total Qty Required", "24 Nov", "25 Nov", "26 Nov", "27 Nov", "28 Nov", "Adj Unit", "Total", "24 Nov", ...]

Branch positions: {
  Soufouh: 8,
  DIP: 14,
  Sharja: 20,
  AlJada: 26,
  Ajman: 32,
  UEQ: 38,
  RAK: 44,
  YAS: 50,
  Ruwais: 56,
  CA: 62,
  Ain: 68,
  Khalifa: 74
}

Branch date columns: {
  Soufouh: {
    dateIndices: [11, 12, 13, 14, 15],
    dates: ["24 Nov", "25 Nov", "26 Nov", "27 Nov", "28 Nov"]
  },
  ...
}
```

---

## Next Steps

1. **Test with Real Data**: Paste your actual Excel data
2. **Create Test Dispatch**: Generate for one date
3. **Verify Branches**: Check all 12 branches appear
4. **Verify Items**: Check quantities match Excel
5. **Complete Flow**: Create dispatch and check branch pages

---

## Support

If you encounter issues:
1. Check console for error messages (F12)
2. Verify Excel format matches `EXCEL_FORMAT_EXAMPLE.txt`
3. Make sure all 12 branch names are exact
4. Ensure both header rows are copied

---

**Parser is now ready for your production Excel format!** 🚀

The system can handle:
- ✅ 137+ items
- ✅ 12 branches
- ✅ 5 dates per week
- ✅ Multiple units (Kg, Unit, Liter, #N/A, Portion, etc.)
- ✅ Quantities with commas (1,950.0)
- ✅ Zero/empty cells (skipped automatically)

**Try it now at:** http://localhost:3000/dispatch/upload


# 📋 How to Copy from Excel - Visual Guide

## Quick Steps

1. **Open Excel** → Your SharePoint file
2. **Select Everything** → From A1 to last branch column
3. **Copy** → Ctrl+C
4. **Open Upload Page** → http://localhost:3000/dispatch/upload
5. **Paste** → Ctrl+V in the textarea
6. **Parse** → Click "Parse Data"
7. **Select Date** → Choose delivery date
8. **Generate** → Click "Generate Dispatch Preview"
9. **Create** → Click "Create Digital Dispatches"
10. **Done!** ✅

---

## Detailed Instructions

### 1. Open Your Excel File

Open the SharePoint Excel file that has your dispatch data.

You'll see something like:

```
Row 1: 137 Items to be Dispatched to Branches | Mon | Tue | Wed | Thu | Fri | | Soufouh | | | | | | DIP | ...
Row 2: Rec. Ref | Recipe | Recipe Cost | Total Qty | 24 Nov | 25 Nov | 26 Nov | 27 Nov | 28 Nov | Adj Unit | Total | 24 Nov | ...
Row 3: 8 | Apple Sauce 1 Kg | 6.64 | 1.6 | 0.0 | 1.6 | 0.0 | 0.0 | 0.0 | Kg | 0.2 | 0.0 | 0.2 | ...
```

---

### 2. Select the Data to Copy

**What to select:**
- Start: Cell **A1** (top-left corner)
- End: Last column with branch data (Khalifa or last visible branch)
- Rows: All rows from 1 to the last item

**How to select:**
1. Click on cell **A1**
2. Scroll right to find the last branch (usually **Khalifa**)
3. Scroll down to the last item row
4. Hold **Shift** and click on the last cell
5. Everything should now be highlighted/selected

**Or use keyboard shortcut:**
1. Click on cell **A1**
2. Press **Ctrl + Shift + End** (selects to last used cell)
3. This should select everything automatically

---

### 3. Copy the Selection

Press **Ctrl + C** (or right-click → Copy)

You should see a moving dotted border around the selection indicating it's copied.

---

### 4. Open the Dispatch Upload Page

In your browser, navigate to:
```
http://localhost:3000/dispatch/upload
```

You'll see a page with:
- Large textarea for pasting
- "Parse Data" button
- Instructions

---

### 5. Paste the Data

1. **Click inside the large textarea** (the big empty box)
2. **Press Ctrl + V** (or right-click → Paste)
3. You'll see all your data appear in the textarea

The data will look like rows of text separated by tabs.

---

### 6. Parse the Data

Click the **"Parse Data"** button

The system will:
- Read the branch names from Row 1
- Read the dates from Row 2
- Find where each branch's data is
- Detect all available dates

**You should see an alert:**
```
✓ Data parsed successfully!

Found 12 branches
Available dates: 24 Nov, 25 Nov, 26 Nov, 27 Nov, 28 Nov

Please select a delivery date below.
```

If you see this, great! Move to the next step.

If you see an error, check the troubleshooting section below.

---

### 7. Select Delivery Date

After parsing, you'll see date buttons appear:

```
[ 24 Nov ] [ 25 Nov ] [ 26 Nov ] [ 27 Nov ] [ 28 Nov ]
```

**Click on the date** you want to create dispatches for.

For example, if you want to create dispatches for November 24th, click **"24 Nov"**

---

### 8. Generate Preview

Click **"Generate Dispatch Preview"** button

The system will:
- Extract quantities for the selected date
- Group items by branch
- Count total items
- Show you a preview

**You'll see:**
```
Preview: 12 branches detected
        156 total items

📋 ISC Soufouh - 23 items
   (click "View items" to see details)

📋 ISC DIP - 18 items
   (click "View items" to see details)

... and so on for all branches
```

---

### 9. Review and Create

1. **Review the preview**:
   - Check branch names are correct
   - Verify item counts look reasonable
   - Click "View items" to see sample items if needed

2. **Click "📤 Create Digital Dispatches"**

3. **Wait for confirmation**:
   ```
   ✅ Dispatch Created Successfully!
   12 branches can now see their deliveries
   
   Redirecting to dispatch dashboard...
   ```

---

### 10. Verification

After creation:

1. **Go to dispatch dashboard**: http://localhost:3000/dispatch
2. **See your new dispatch** in the list
3. **Check any branch page** to see dispatches appear
4. **Branch managers can now open their checklists!**

---

## What You're Copying

### Row 1: Branch Headers
```
137 Items... | Mon | Tue | Wed | Thu | Fri | | Soufouh | | | | | | DIP | | | | | | Sharja | ... | Khalifa
```
**The system looks for**: Soufouh, DIP, Sharja, AlJada, Ajman, UEQ, RAK, YAS, Ruwais, CA, Ain, Khalifa

---

### Row 2: Date Headers  
```
Rec. Ref | Recipe | Cost | Total | 24 Nov | 25 Nov | 26 Nov | 27 Nov | 28 Nov | Adj Unit | Total | 24 Nov | 25 Nov | ...
```
**The system looks for**: Date patterns like "24 Nov", "25 Nov" under each branch

---

### Row 3+: Item Data
```
8 | Apple Sauce 1 Kg | 6.64 | 1.6 | 0.0 | 1.6 | 0.0 | 0.0 | 0.0 | Kg | 0.2 | 0.0 | 0.2 | ...
```
**The system extracts**:
- Column B (Recipe): "Apple Sauce 1 Kg"
- Column I (Adj Unit): "Kg"
- Branch date columns: Quantities for each date

---

## Common Mistakes

### ❌ Only copying one header row
**Fix**: Make sure you copy **both** Row 1 (branches) and Row 2 (dates)

### ❌ Not including item rows
**Fix**: Copy at least one item row (Row 3+) along with headers

### ❌ Misspelling branch names
**Fix**: Make sure Excel has exact names:
- ✅ AlJada (not Atlada)
- ✅ CA (for Central Kitchen)
- ✅ Ain (not Al Ain)
- ✅ Khalifa (not Al Khalifa)

### ❌ Wrong date format
**Fix**: Dates should be like "24 Nov" (with space), not "24-Nov" or "Nov 24"

### ❌ Starting from wrong row
**Fix**: Always start from **Row 1** (the very top row with "137 Items...")

---

## Troubleshooting

### "No branches found in header"

**Cause**: Row 1 doesn't have branch names, or names are misspelled

**Solution**:
1. Check that Row 1 is included in your copy
2. Look for exact names: Soufouh, DIP, Sharja, AlJada, Ajman, UEQ, RAK, YAS, Ruwais, CA, Ain, Khalifa
3. Make sure no extra spaces or special characters

---

### "No date columns found"

**Cause**: Row 2 doesn't have dates, or format is wrong

**Solution**:
1. Check that Row 2 is included in your copy
2. Dates should be like: "24 Nov" (day, space, 3-letter month)
3. Make sure dates are in the row directly below branch names

---

### "No items found" or "0 total items"

**Cause**: Item data rows aren't included, or all quantities are zero

**Solution**:
1. Make sure you copied rows starting from Row 3
2. Check that quantities exist for the selected date
3. Verify you selected the correct date
4. Make sure there are non-zero quantities in your Excel

---

### Items don't match Excel

**Cause**: Wrong columns being read

**Solution**:
1. Verify Recipe names are in Column B (second column)
2. Check Adj Unit is in Column I
3. Make sure you copied complete rows (not partial)
4. Check for merged cells in Excel that might cause misalignment

---

## Tips for Success

1. **Copy Everything**: Don't try to select specific columns - copy the whole range
2. **Include Headers**: Always include both header rows
3. **One Date at a Time**: Create dispatches for one delivery date per upload
4. **Check Preview**: Always review the preview before creating
5. **Keep Original**: The system doesn't modify your Excel file

---

## Video Tutorial (If Available)

_[You could record a quick screen recording showing these steps and link it here]_

---

## Quick Reference Card

```
┌─────────────────────────────────────┐
│  EXCEL → DISPATCH IN 10 STEPS      │
├─────────────────────────────────────┤
│  1. Open Excel file                 │
│  2. Click cell A1                   │
│  3. Ctrl + Shift + End              │
│  4. Ctrl + C (copy)                 │
│  5. Open /dispatch/upload           │
│  6. Ctrl + V (paste)                │
│  7. Click "Parse Data"              │
│  8. Select date                     │
│  9. Click "Generate Preview"        │
│  10. Click "Create Dispatches"      │
│                                     │
│  ✅ DONE! Branches notified         │
└─────────────────────────────────────┘
```

---

## Need Help?

- **Check console**: Press F12 to see detailed error messages
- **Read example**: See `EXCEL_FORMAT_EXAMPLE.txt`
- **Check guide**: See `DISPATCH_GUIDE.md`
- **Review update**: See `PARSER_UPDATE_SUMMARY.md`

---

**Ready to try? Go to:** http://localhost:3000/dispatch/upload

**Happy dispatching!** 🚀


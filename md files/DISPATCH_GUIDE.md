# 📦 Digital Dispatch System - User Guide

## Overview
The Digital Dispatch System eliminates paper-based dispatch management by providing a fully digital workflow for creating, tracking, and receiving branch deliveries.

## Features
✅ **Upload Excel Data** - Paste directly from your SharePoint Excel file
✅ **Auto-Parse Dates** - Automatically detects delivery dates from Excel columns
✅ **Branch-Specific Views** - Each branch sees only their dispatches
✅ **Digital Checklist** - Branch managers check items off as they receive them
✅ **Issue Tracking** - Mark items as missing, damaged, or partial
✅ **Progress Monitoring** - Head office sees real-time status
✅ **Complete History** - All dispatch records searchable and accessible

---

## For Head Office (Sara)

### How to Create a Dispatch

1. **Navigate to Dispatch Management**
   - Click "Dispatch" in the top navigation
   - Or go to: `/dispatch`

2. **Click "Create Dispatch"**
   - Takes you to: `/dispatch/upload`

3. **Prepare Your Excel Data**
   - Open your SharePoint Excel file
   - Select ALL columns from the item names to the last branch
   - Include BOTH header rows (Row 1: Branch names, Row 2: Totals)
   - Copy everything (Ctrl+C)

4. **Paste Data**
   - Click in the large text area
   - Paste (Ctrl+V)
   - Click "Parse Data"
   - System will detect branches and their Total columns

5. **Generate Dispatch**
   - The system will use the Total quantity for each branch
   - Click "Generate Dispatch Preview"
   - No need to select a specific date - it uses weekly totals

6. **Review & Create**
   - Check the preview showing all branches and items
   - Verify quantities and branches are correct
   - Click "📤 Create Digital Dispatches"

7. **Done!** ✅
   - All branches can now see their weekly deliveries
   - You'll be redirected to the dispatch dashboard

### How to Monitor Dispatches

1. Go to `/dispatch` dashboard
2. See overview statistics:
   - Total dispatches
   - Pending (yellow)
   - In Progress (blue)
   - Completed (green)
   - With Issues (red)

3. Click on any dispatch to see branch-by-branch details
4. See which branches have received, which are pending

---

## For Branch Managers (Ahmed, Fatima, etc.)

### How to Receive a Delivery

1. **Go to Your Branch Page**
   - Navigate to your branch: `/branch/isc-soufouh` (or your slug)
   - You'll see a new "📦 Dispatches & Deliveries" section

2. **See New Delivery**
   - Look for the orange "🔔 New Delivery" badge
   - Shows delivery date and item count

3. **Open Checklist**
   - Click "Open Checklist" button
   - Opens the receiving page: `/dispatch/{id}/branch/{slug}`

4. **When Delivery Arrives**
   - Open checklist on your phone or tablet
   - Check off items as driver unloads them

5. **Check Each Item**
   - Tap the checkbox when you receive an item
   - Item turns green ✅

6. **Report Issues**
   - If something is wrong, click:
     - **Missing** - Item didn't arrive
     - **Damaged** - Item is damaged/unusable
     - **Partial** - Only received part of the order
   
   - For partial: Enter the actual quantity received
   - Add notes explaining the issue

7. **Add Notes**
   - Add any notes per item
   - Example: "Packaging was torn" or "Expiry date is close"

8. **Overall Notes**
   - Add general delivery notes at the bottom
   - Example: "Driver was 15 minutes late"

9. **Sign Off**
   - When all items are checked
   - Enter your name in "Received By"
   - Click "✅ Complete & Sign Off"

10. **Done!** ✅
    - Dispatch is marked complete
    - Head office can see it's done
    - You can view it later in "Completed" tab

### Saving Progress

Don't need to complete everything at once!
- Click "💾 Save Progress" anytime
- Come back later to finish
- Your checkmarks and notes are saved

---

## Excel Format Requirements

Your Excel file should have:

### Header Structure
```
Row 1: Recipe | ... | Soufouh | (dates) | DIP | (dates) | Sharja | (dates) | ...
Row 2: [Rec Ref] | Recipe | ... | Total | ... | Total | ... | Total | ...
```

### Structure
- **Column B (index 1)**: Recipe/Item names
- **Column I (index 8)**: Unit of measure (Kg, Unit, Liter, etc.)
- **Branch Names**: Soufouh, DIP, Sharja, AlJada, Ajman, UEQ, RAK, YAS, Ruwais, CA, Ain, Khalifa
- **Total Columns**: Each branch has a "Total" column showing the weekly total quantity
- The system extracts quantities from the **Total column only** (not individual date columns)

### Data Rows
- Item name in column B
- Unit in column I
- Total quantity for each branch in its respective Total column
- Empty cells or zero = item not needed for that branch

---

## URLs Reference

### Head Office
- **Dashboard**: `/dispatch`
- **Create Dispatch**: `/dispatch/upload`

### Branch Managers
- **Branch Page**: `/branch/{slug}`
  - Example: `/branch/isc-soufouh`
- **Receiving Checklist**: `/dispatch/{id}/branch/{slug}`

### Navigation
- Click "Dispatch" in top nav to access dispatch management
- Click "Branches" to see all branches

---

## Tips & Best Practices

### For Head Office
1. **Create dispatches 2 days before delivery** - Gives branches time to prepare
2. **Check the preview carefully** - Verify quantities before creating
3. **Monitor the dashboard** - Check which branches have issues
4. **Review completed dispatches** - See patterns in issues

### For Branch Managers
1. **Check dispatch when it's created** - Know what's coming
2. **Use your phone/tablet** - Easy to check items while receiving
3. **Report all issues** - Even small ones help improve the system
4. **Complete same day** - Don't leave dispatches open for days
5. **Add detailed notes** - Helps head office understand problems

---

## Troubleshooting

### "No branches with Total columns found"
- Make sure you copied BOTH header rows (branch names and the "Total" labels)
- Check that there's a "Total" column after the date columns for each branch
- The second row should contain "Total" text in the header

### "Data parsed but no items showing"
- Check that you included data rows, not just headers
- Make sure quantities in the Total columns are numbers, not text
- Verify that items have non-zero quantities in at least one branch's Total column

### "Dispatch not showing on branch page"
- Refresh the page (F5)
- Check if your branch slug matches the Excel name

### Can't complete dispatch
- Make sure "Received By" field is filled
- At least one item should be checked or marked with an issue

---

## Future Enhancements

Possible additions:
- 📧 Email notifications when dispatch is created
- 📱 WhatsApp messages to branch managers
- 📸 Photo upload for damaged items
- 🔔 Push notifications
- 📊 Reports and analytics
- 🚚 Driver tracking
- QR code scanning

---

## Technical Notes

### Data Storage
- Dispatches saved in: `data/dispatches.json`
- Updates in real-time via API endpoints

### API Endpoints
- `GET /api/dispatch` - Get all dispatches
- `POST /api/dispatch` - Create new dispatch
- `PATCH /api/dispatch/[id]` - Update dispatch

---

## Support

If you encounter issues:
1. Refresh the page
2. Check your internet connection
3. Try clearing browser cache
4. Contact IT support

---

**Built for Mikana International Catering Services**
*Eliminating paper, embracing digital efficiency* 🚀


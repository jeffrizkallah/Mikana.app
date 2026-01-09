# Quality Check Quick Mode Guide

## Overview

The quality check system has been streamlined to use a single, optimized entry mode that significantly reduces the time managers spend on daily quality checks.

**Time per item:** ~30-45 seconds (down from ~2 minutes)

## What Changed

### Removed
- ❌ Batch Mode (couldn't capture detailed notes for low scores)
- ❌ Detailed Mode (too many steps for daily use)
- ❌ "Copy Yesterday" button (not needed)
- ❌ Emojis next to field labels
- ❌ Mode selector buttons

### Added
✅ **Notes fields under Taste and Appearance** - Capture specific feedback for each rating  
✅ **Overall Remarks section** - Always visible before submitting  
✅ **Improved star design** - Cleaner, more professional appearance  
✅ **Smart defaults** - Pre-fills portion and temperature based on product type  
✅ **Progress tracking** - See which items you've checked today  

## How to Use

### Step-by-Step Process

1. **Go to Quality Check page** for your branch
2. **Click "Start Quality Check"**
3. **Select Meal Service** (auto-detected based on time)
4. **Choose Section** (Hot/Cold/Bakery/Beverages)
5. **Select Product** - Portion & temp auto-fill!
6. **Rate Quality:**
   - Click stars for Taste (1-5)
   - Click stars for Appearance (1-5)
   - Add notes if needed under each rating
7. **Verify Measurements:**
   - Portion (grams) - pre-filled
   - Temperature (°C) - pre-filled
8. **Add Overall Remarks** (optional but recommended)
9. **Take Photo** (required)
10. **Submit** - Form resets for next item!

### Pro Tips

**For Speed:**
- Stay in the same section for multiple items
- The section persists across submissions
- Green checkmarks show what you've done today
- Smart defaults learn from your entries

**For Items with Issues:**
- Rate below 4 stars automatically shows "Corrective action" checkbox
- Use the notes fields to explain what was wrong
- Use remarks for additional context

**Mobile Users:**
- Large star buttons easy to tap
- Number pad pops up for measurements
- Camera opens with one tap
- Smooth, fast workflow

## New Field Layout

### Ratings Section
```
┌─────────────────┬─────────────────┐
│     Taste       │   Appearance    │
│   ⭐⭐⭐⭐⭐    │   ⭐⭐⭐⭐⭐   │
│      5/5        │      5/5        │
│  [Notes field]  │  [Notes field]  │
└─────────────────┴─────────────────┘
```

### Measurements
```
┌─────────────────┬─────────────────┐
│  Portion (g)    │   Temp (°C)     │
│     [250]       │     [65]        │
└─────────────────┴─────────────────┘
```

### Overall Remarks
```
┌─────────────────────────────────────┐
│  Overall Remarks (optional)         │
│  [Large text area for comments]     │
└─────────────────────────────────────┘
```

## Star Rating Guide

### Visual Appearance
- **Selected stars:** Filled with color (yellow for taste, blue for appearance)
- **Unselected stars:** Light gray outline
- **Hover effect:** Stars scale up slightly
- **Clean design:** Professional, easy to read

### Rating Scale
- ⭐ 1 Star = Poor / Unacceptable
- ⭐⭐ 2 Stars = Below Standard
- ⭐⭐⭐ 3 Stars = Acceptable
- ⭐⭐⭐⭐ 4 Stars = Good
- ⭐⭐⭐⭐⭐ 5 Stars = Excellent (default)

## Smart Defaults

The system remembers values for common products:

### Hot Food
- Chicken Biryani: 250g, 65°C
- Vegetable Biryani: 250g, 65°C
- Pasta: 200g, 70°C
- Grilled Chicken: 180g, 75°C
- Rice: 200g, 65°C

### Cold Food
- Salad: 150g, 4°C
- Coleslaw: 100g, 4°C
- Sandwich: 200g, 8°C

### Bakery
- Croissant: 80g, 22°C
- Pizza: 250g, 70°C

**After your first entry**, the system remembers YOUR specific values for each product!

## Best Practices

### Daily Routine
1. Do quality checks right after food preparation
2. Check 2-3 items per section minimum
3. Always add notes for ratings below 5 stars
4. Use remarks to track trends (e.g., "portion sizes improving")

### Documentation
- **Notes fields:** Quick, specific feedback ("too salty", "great color")
- **Overall remarks:** Context, trends, observations
- **Photos:** Clear shot of the portion and presentation

### When Something's Wrong
If you rate anything below 4 stars:
1. Corrective action checkbox appears automatically
2. Check it if you fixed the issue immediately
3. Describe what you did in the corrective notes field
4. Add details in remarks about what caused it

## Time Savings

**Previous system (detailed mode):**
- 8 items × 2 minutes = 16 minutes per meal service

**New system (quick mode):**
- 8 items × 40 seconds = 5 minutes 20 seconds per meal service

**Time saved:** 
- ~11 minutes per meal service
- ~22 minutes per day
- ~1.8 hours per week per branch

**For 10 branches:** ~18 hours saved weekly across the organization!

## Technical Details

### Data Captured
All the same data as before:
- ✅ Branch, date, meal service
- ✅ Product name and section
- ✅ Taste score (1-5)
- ✅ Appearance score (1-5)
- ✅ **NEW:** Taste notes
- ✅ **NEW:** Appearance notes
- ✅ Portion weight (grams)
- ✅ Temperature (°C)
- ✅ Overall remarks
- ✅ Corrective action (if needed)
- ✅ Photos (1-3 images)
- ✅ Submitted by (automatic)
- ✅ Timestamp (automatic)

### Local Storage
The system uses your browser's local storage to:
- Remember last values per product
- Track today's submissions
- Keep section selection between entries
- Cache smart defaults

**Privacy:** All data syncs to the server. Local storage is just for convenience.

## FAQ

**Q: What if I need to document a complex issue?**  
A: Use the notes fields under each rating, plus the overall remarks field. You have plenty of space for details.

**Q: Can I go back and edit after submitting?**  
A: No, but you can view submitted checks in the history section. Contact operations if you need to correct something.

**Q: What happens if I close the browser mid-entry?**  
A: Your progress on the current item is lost, but submitted items are safe. The form state doesn't persist between sessions.

**Q: Why did my portion/temp values change?**  
A: The system learns from your last entry for each product. If you consistently use different values, it will remember those.

**Q: Can I add a new product not in the list?**  
A: Yes! Click "+ Other" and type the product name manually.

**Q: Do I have to add notes?**  
A: Notes are optional, but highly recommended when rating below 5 stars. Overall remarks are always optional.

## Training Tips

**Day 1:**
- Go through each field carefully
- Understand what each rating means
- Practice adding notes

**Day 2-3:**
- Focus on speed
- Let the smart defaults help you
- Stay in one section at a time

**Week 2+:**
- Should feel natural and fast
- ~30-40 seconds per item is the target
- Notes become quick and specific

## Support

If you need help:
- Check the "Today's Submissions" section to verify your entries
- Contact operations if something looks wrong
- Request new products to be added to quick-select

---

**Version:** 2.1  
**Last Updated:** January 2026  
**Status:** ✅ Active - Single Mode Only


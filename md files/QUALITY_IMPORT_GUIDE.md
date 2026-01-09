# Quality Control Import Feature

## Overview
This feature allows admins to import historical quality control data from Excel files exported from SharePoint. The system uses AI to automatically map columns and match branch names intelligently.

## How to Use

### 1. Access the Import Feature
- Navigate to `/admin/quality-control`
- Click the **"Import"** button in the header (next to Export)

### 2. Upload Your Excel File
- Drag and drop your Excel file (.xlsx, .xls, or .csv)
- Or click "Select File" to browse
- Maximum file size: 10MB

### 3. AI Processing
The system will automatically:
- **Detect columns** using AI pattern matching
- **Match branch names** to your system slugs (e.g., "ISC_Khalifa" → "isc-khalifa")
- **Normalize sections** (Hot, Cold, Bakery, Beverages)
- **Parse dates** in MM/DD/YYYY format
- **Validate scores** (must be 1-5)
- **Handle corrective actions** (TRUE/FALSE values)

### 4. Review Results
After import, you'll see:
- ✅ **Successfully imported records**
- ⚠️ **Warnings** (records imported with defaults/adjustments)
- ❌ **Errors** (records that couldn't be imported)
- **Column mapping** used by AI
- Option to download detailed error report

## Column Mapping

The AI automatically maps these common column names:

| Excel Column Pattern | Database Field |
|---------------------|----------------|
| Branch, Location, Site | Branch Slug |
| Date, Submission, Timestamp | Submission Date |
| Product, Item, Food, Dish | Product Name |
| Section, Category, Type | Section |
| Taste Score, Taste, Flavor | Taste Score |
| Taste Note/Comment | Taste Notes |
| Appearance Score, Look | Appearance Score |
| Appearance Note/Comment | Appearance Notes |
| Portion, Weight, Qty, Gram | Portion (grams) |
| Portion Note/Comment | Portion Notes |
| Temp, Temperature, Celsius | Temperature (°C) |
| Meal, Service | Meal Service |
| Remark, Comment, Note | Remarks |
| Corrective Action | Corrective Action Taken |
| Corrective Note/Action Note | Corrective Action Notes |

## Important Notes

### Default Values
- **Submitter**: Uses the admin importing the data
- **Status**: All imported records are set to "submitted"
- **Meal Service**: Defaults to "lunch" if not specified
- **Photos**: Skipped during import (add manually later if needed)
- **Portion**: Defaults to 100g if invalid/missing

### Branch Matching
The system uses fuzzy matching to find branches:
- Direct slug match: "isc-soufouh" → "isc-soufouh"
- Name match: "ISC Soufouh" → "isc-soufouh"
- Keyword match: "ISC_Soufouh" → "isc-soufouh"

If a branch cannot be matched, that row will be skipped with an error.

### Data Validation
Records are skipped if:
- Branch name cannot be matched
- Product name is missing
- Taste or appearance scores are not 1-5
- Required fields are empty

### Warnings
Records are imported with warnings if:
- Date format is invalid (uses current date)
- Portion quantity is invalid (uses 100g default)
- Temperature is missing or invalid (uses 0°C)

## Troubleshooting

**Q: Some rows failed to import**
- Download the error report to see specific issues
- Common issues: branch name mismatch, missing required fields, invalid scores
- Fix the Excel file and re-import

**Q: Branch names aren't matching**
- Check that branch names in Excel match those in your system
- The AI tries fuzzy matching but may need exact names
- Contact admin if branches need to be added to the system

**Q: Dates are incorrect**
- Ensure dates are in MM/DD/YYYY format
- Excel date serial numbers are automatically converted

**Q: Photos from SharePoint aren't imported**
- Photos are intentionally skipped during import
- You can manually add photos later by editing individual submissions

## Example Excel Format

```
Branch         | Date       | Product Name    | Section | Taste Score | Appearance Score | Portion Qty in Gm | Temp Celsius | Remarks      | Corrective Action Required
---------------|------------|-----------------|---------|-------------|------------------|-------------------|--------------|--------------|---------------------------
ISC_Khalifa    | 1/5/2026   | chicken katsu   | Hot     | 4           | 4                | 5                 | 77           | over all good| FALSE
ISC_Soufouh    | 1/5/2026   | pizza margarita | Bakery  | 4           | 4                | 100               | 85           | children's enjoyed| FALSE
```

## Post-Import

After successful import:
- Records appear in the "Submissions" tab
- All records have status "submitted" and can be reviewed normally
- Branch managers can see their branch submissions
- Admins can review, flag, or mark as reviewed

## Technical Details

- **Processing**: Server-side batch processing
- **Performance**: ~147 rows process in seconds
- **Concurrent imports**: One at a time per user
- **File formats**: .xlsx, .xls, .csv
- **Max file size**: 10MB
- **Max rows**: No hard limit, but 500+ may take longer

## Support

If you encounter issues:
1. Download the error report
2. Check the troubleshooting section above
3. Contact your system administrator
4. Provide the error report for faster resolution


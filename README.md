# minimal-google-expense-tracker

This is a Google Apps Script setup that lets you track your expenses using the Google product suite.

## How to Use

Follow these steps to set up and use the expense tracker:

1. **Create the Initial Script:**
   - Go to the [Google Apps Script page](https://script.google.com/).
   - Create a new script.
   - Paste the contents of `setup.gs` into the script editor.
   - Run the `setupExpenseTracker` function. This will create a Google Form and a Google Sheet, and log their URLs in the console.

2. **Link the Functions to the Sheet:**
   - Open the Google Sheet created in step 1 (use the URL logged in the console).
   - In the sheet, go to **Extensions > Apps Script**.
   - Paste the contents of `functions.gs` into the script editor.
   - Save the script.
   - Set up the automatic trigger: Click the clock icon (Triggers) in the Apps Script editor, add a new trigger for the `onFormSubmit` function, select event source "From spreadsheet", event type "On form submit", and save.

3. **Start Tracking Expenses:**
   - Open the Google Form (use the URL logged in step 1).
   - Submit an entry with an amount, category, and optional notes.
   - The system will automatically generate:
     - A form entry sheet.
     - A monthly sheet for the current month.
     - A yearly summary sheet.

Your expense tracker is now ready to use!

## Maintenance

If you ever manually make edits to the form entry sheet, you can run the `refreshAllSummaries` function to recalculate all details. To do this:
- Open the script editor for the sheet (Extensions > Apps Script).
- Select the `refreshAllSummaries` function from the dropdown.
- Click the run button.

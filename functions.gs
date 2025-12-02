// Helper function to get the form response sheet
function getResponseSheet(ss) {
  // First, check for the renamed sheet
  var sheet = ss.getSheetByName("Expense Data");
  if (sheet) return sheet;
  
  // Fallback to any sheet starting with "Form Responses"
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf("Form Responses") === 0) {
      return sheets[i];
    }
  }
  return null; // Not found
}

// ------------------- ON FORM SUBMIT -------------------
function onFormSubmit(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = e.range.getSheet(); // Get the sheet from the event range
  if (!responseSheet) return;

  // Get submitted row
  var row = e.range.getRow();
  var rowData = responseSheet.getRange(row, 1, 1, responseSheet.getLastColumn()).getValues()[0];


  var timestamp = rowData[0];
  var year = timestamp.getFullYear();
  var month = timestamp.getMonth(); // 0-based
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthSheetName = monthNames[month] + " " + year;

  // ------------------- MONTHLY SHEET -------------------

  var monthSheet = ss.getSheetByName(monthSheetName);
  if (!monthSheet) {
    monthSheet = ss.insertSheet(monthSheetName);
    var headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];
    monthSheet.appendRow(headers);
  }

  // Append the new row to month sheet
  monthSheet.appendRow(rowData);

  // ------------------- UPDATE MONTHLY CATEGORY SUMMARY -------------------
  updateMonthlySummary(monthSheet);

  // ------------------- UPDATE YEARLY SUMMARY -------------------
  updateYearlySummary(ss, year);
}

// ------------------- MONTHLY SUMMARY -------------------
function updateMonthlySummary(monthSheet) {
  var lastRow = monthSheet.getLastRow();
  if (lastRow < 2) return;

  var dataRange = monthSheet.getRange(2, 3, lastRow-1, 1); // column C = Category
  var data = dataRange.getValues().flat().filter(String); // unique non-empty categories
  var categories = Array.from(new Set(data));

  // Clear previous summary
  monthSheet.getRange("G:H").clear();

  // Write header
  monthSheet.getRange("G1").setValue("Category Summary");

  // Write dynamic categories
  if (categories.length > 0) {
    monthSheet.getRange(2, 7, categories.length, 1).setValues(categories.map(c => [c]));
    monthSheet.getRange(2, 7, categories.length, 1).setBorder(false, false, false, true, null, null); // Right border for categories

    // Add SUMIF formulas
    for (var i = 0; i < categories.length; i++) {
      var r = i + 2;
      monthSheet.getRange(r, 8).setFormula(`=SUMIF(C:C, G${r}, B:B)`).setNumberFormat('₹#,##0.00');
    }
    monthSheet.getRange(2, 8, categories.length, 1).setBorder(false, false, false, true, null, null); // Right border for amounts
  }

  // Add grand total
  var totalRow = categories.length + 3;
  monthSheet.getRange("G" + totalRow).setValue("Total:").setFontWeight("bold");
  monthSheet.getRange("H" + totalRow).setFormula("=SUM(B:B)").setNumberFormat('₹#,##0.00').setFontWeight("bold");
  monthSheet.getRange(totalRow, 7, 1, 2).setBorder(true, false, true, true, null, null); // Top and bottom borders for total
  // Add some spacing below summary
  monthSheet.getRange(totalRow + 1, 7, 2, 2).clearContent();
}

// ------------------- YEARLY SUMMARY -------------------
function updateYearlySummary(ss, year) {
  var yearSheetName = year + " Report";
  var yearSheet = ss.getSheetByName(yearSheetName);
  
  if (!yearSheet) {
    yearSheet = ss.insertSheet(yearSheetName);
  } else {
    yearSheet.clear(); // Clear old data
  }

  // 1️⃣ Collect all months and unique categories
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var months = ss.getSheets().filter(s => {
    for (var i = 0; i < monthNames.length; i++) {
      if (s.getName() === monthNames[i] + " " + year) return true;
    }
    return false;
  });
  var allCategoriesSet = new Set();
  months.forEach(monthSheet => {
    var lastRow = monthSheet.getLastRow();
    if (lastRow >= 2) {
      monthSheet.getRange("C2:C" + lastRow).getValues().flat().filter(String).forEach(c => allCategoriesSet.add(c));
    }
  });
  var allCategories = Array.from(allCategoriesSet).sort(); // Alphabetical

  // 2️⃣ Create header for the summary
  yearSheet.appendRow([year + " Yearly Summary"]);
  yearSheet.getRange(1, 1, 1, 2).setFontWeight("bold");
  yearSheet.appendRow([""]); // spacer row

  // 3️⃣ Loop through each month
  months.forEach(monthSheet => {
    var monthName = monthSheet.getName();
    var lastRow = monthSheet.getLastRow();
    var monthCategories = monthSheet.getRange("C2:C" + lastRow).getValues().flat();
    var monthAmounts = monthSheet.getRange("B2:B" + lastRow).getValues().flat();

    // Section header: Month name
    yearSheet.appendRow([monthName]);
    var headerRow = yearSheet.getLastRow();
    yearSheet.getRange(headerRow, 1, 1, 2).setFontWeight("bold");

    // Category sums
    allCategories.forEach(cat => {
      var sum = 0;
      for (var i = 0; i < monthCategories.length; i++) {
        if (monthCategories[i] === cat) sum += Number(monthAmounts[i]);
      }
      yearSheet.appendRow([cat, sum]);
    });

    // Monthly grand total
    var total = monthAmounts.reduce((a, b) => a + Number(b), 0);
    yearSheet.appendRow(["Total", total]);

    // Format the amounts as INR currency
    var lastDataRow = yearSheet.getLastRow();
    yearSheet.getRange(headerRow + 1, 2, lastDataRow - headerRow).setNumberFormat('₹#,##0.00');

    // Add an empty spacer row safely
    yearSheet.appendRow([""]);

    // Optional: add a bottom border to separate months visually
    var borderRow = yearSheet.getLastRow();
    yearSheet.getRange(borderRow, 1, 1, 2).setBorder(false, false, true, false, false, false);
  });
}

// ------------------- Run to Refresh -------------------
function refreshAllSummaries() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var responseSheet = getResponseSheet(ss);
  if (!responseSheet) return;

  var data = responseSheet.getRange(2, 1, responseSheet.getLastRow()-1, responseSheet.getLastColumn()).getValues();


  // Track all months present in the data
  var monthsSet = new Set();
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  data.forEach(row => {
    var timestamp = row[0];
    if (timestamp instanceof Date) {
      var year = timestamp.getFullYear();
      var month = timestamp.getMonth();
      var monthSheetName = monthNames[month] + " " + year;
      monthsSet.add(monthSheetName);
    }
  });


  // Delete old monthly sheets (optional: keep for safety)
  ss.getSheets().forEach(sheet => {
    var name = sheet.getName();
    // Remove sheets matching 'Month YYYY' for any month
    if (monthNames.some(mn => name.startsWith(mn + " "))) {
      ss.deleteSheet(sheet);
    }
  });

  // Rebuild monthly sheets
  monthsSet.forEach(monthName => {
    var monthSheet = ss.insertSheet(monthName);
    var headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];
    monthSheet.appendRow(headers);

    // Append rows for this month
    data.forEach(row => {
      var timestamp = row[0];
      if (timestamp instanceof Date) {
        var year = timestamp.getFullYear();
        var month = timestamp.getMonth();
        var expectedMonthName = monthNames[month] + " " + year;
        if (expectedMonthName === monthName) {
          monthSheet.appendRow(row);
        }
      }
    });

    // Update monthly summary
    updateMonthlySummary(monthSheet);
  });

  // Rebuild yearly summaries
  var yearsSet = new Set();
  data.forEach(row => {
    var timestamp = row[0];
    if (timestamp instanceof Date) {
      yearsSet.add(timestamp.getFullYear());
    }
  });
  yearsSet.forEach(year => {
    updateYearlySummary(ss, year);
  });

  SpreadsheetApp.flush();
  Logger.log("All monthly and yearly summaries refreshed.");
}


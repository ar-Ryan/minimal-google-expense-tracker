function setupExpenseTracker() {
  // ------------------- CREATE GOOGLE FORM -------------------
  var form = FormApp.create("Expense Tracker");
  
  // Amount
  form.addTextItem()
      .setTitle("Amount")
      .setRequired(true);
  
  // Category (Multiple Choice with "Other")
  var categories = ["Food", "Clothes", "Travel", "Bills", "Investments"];
  form.addMultipleChoiceItem()
      .setTitle("Category")
      .setChoiceValues(categories)
      .showOtherOption(true) // Allows custom entries
      .setRequired(true);
  
  // Notes
  form.addParagraphTextItem()
      .setTitle("Notes (optional)");

  // ------------------- CREATE GOOGLE SHEET -------------------
  var ss = SpreadsheetApp.create("Expense Tracker Data");
  var sheet = ss.getActiveSheet();
  sheet.setName("Form Responses 1");
  
  // Add headers manually (for reference)
  sheet.appendRow(["Timestamp", "Amount", "Category", "Notes"]);
  
  // ------------------- LINK FORM TO SHEET -------------------
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // ------------------- LOG LINKS -------------------
  Logger.log("Form URL: " + form.getEditUrl());
  Logger.log("Spreadsheet URL: " + ss.getUrl());
  
  // ------------------- OPTIONAL: CREATE INITIAL YEARLY SUMMARY SHEET -------------------
  var summarySheet = ss.insertSheet("Summary Setup");
  summarySheet.getRange("A1").setValue("This sheet will later contain yearly summaries.");
  
  Logger.log("Setup complete. Your form and spreadsheet are ready!");
}

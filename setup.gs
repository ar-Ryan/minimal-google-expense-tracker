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
  
  // ------------------- LINK FORM TO SHEET -------------------
  // This will automatically create "Form Responses 1" sheet with proper headers
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  
  // Rename the response sheet to something meaningful
  var responseSheet = ss.getSheetByName("Form Responses 1");
  if (responseSheet) {
    responseSheet.setName("Expense Data");
  }
  
  // Delete the default empty sheet
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }
  
  // ------------------- LOG LINKS -------------------
  Logger.log("Form URL: " + form.getEditUrl());
  Logger.log("Spreadsheet URL: " + ss.getUrl());
  
  Logger.log("Setup complete. Your form and spreadsheet are ready!");
}

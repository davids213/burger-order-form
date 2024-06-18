function onSpreadsheetSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Settings');
  var registeredSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registered Users');
  var lastRow = sheet.getLastRow();
  
  var email = sheet.getRange(lastRow, 2).getValue(); // Email column B
  var timestamp = new Date(sheet.getRange(lastRow, 1).getValue()); // Timestamp column A
  var selection = sheet.getRange(lastRow, 3).getValue(); // Order details column C
  var vegaPatty = sheet.getRange(lastRow, 4).getValue(); // Vegan option column D
  var pickupTime = sheet.getRange(lastRow, 5).getValue(); // Pickup time column E

  // Generate pickup number
  var lastPickupNumber = settingsSheet.getRange("A1").getValue();
  var pickupNumber = lastPickupNumber + 1;
  settingsSheet.getRange("A1").setValue(pickupNumber);
  sheet.getRange(lastRow, 6).setValue(pickupNumber); // Pickup number column F

  // Check if the email is registered
  var registeredEmails = registeredSheet.getRange("C2:C" + registeredSheet.getLastRow()).getValues().flat();
  if (registeredEmails.indexOf(email) === -1) {
    var subject = "Registration Required at 4 Season Burgers";
    var body = `
      <html>
        <body>
          <p>Dear Customer,</p>
          <p>Your email is not registered. Please register to place an order.</p>
          <p>Regards,<br>4 Season Burgers</p>
        </body>
      </html>`;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body
    });
    return; // Stop further processing if the email is not registered
  }

  // Check the number of orders in the last 24 hours
  var orderCount = 0;
  var oneDayAgo = new Date(timestamp.getTime() - (24 * 60 * 60 * 1000));
  for (var i = 2; i <= lastRow; i++) {
    var rowEmail = sheet.getRange(i, 2).getValue();
    var rowTimestamp = new Date(sheet.getRange(i, 1).getValue());
    if (rowEmail === email && rowTimestamp >= oneDayAgo) {
      orderCount++;
    }
  }

  var subject, body;
  if (orderCount > 2) {
    subject = "Order Failed at 4 Season Burgers";
    body = `
      <html>
        <body>
          <p>Dear Customer,</p>
          <p>You have placed more than two orders within 24 hours. Your latest order has failed.</p>
          <p>Regards,<br>4 Season Burgers</p>
        </body>
      </html>`;
  } else {
    var vegaPattyText = vegaPatty ? "<tr><td>Vegan Patty:</td><td>Yes</td></tr>" : "";
    
    subject = "Order Confirmation at 4 Season Burgers";
    body = `
      <html>
        <body>
          <p>Dear Customer,</p>
          <p>Thank you for your order! Here are your order details:</p>
          <table>
            <tr><td>Order Details:</td><td>${selection}</td></tr>
            ${vegaPattyText}
            <tr><td>Pickup Time:</td><td>${pickupTime}</td></tr>
            <tr><td>Pickup Number:</td><td>${pickupNumber}</td></tr>
          </table>
          <p>We look forward to serving you!</p>
          <p>Regards,<br>4 Season Burgers</p>
        </body>
      </html>`;
  }

  // Send the email
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: body
  });
}

function createTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == 'onSpreadsheetSubmit') {
      return; // Trigger already exists
    }
  }
  ScriptApp.newTrigger('onSpreadsheetSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}

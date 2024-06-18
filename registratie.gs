function registerNewUsers() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Orders');
  var registeredSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Registered Users');
  var lastRow = sheet.getLastRow();
  var registeredEmails = registeredSheet.getRange("C2:C" + registeredSheet.getLastRow()).getValues().flat();

  for (var i = 2; i <= lastRow; i++) { // Assuming the first row is headers
    var worksAt = sheet.getRange(i, 13).getValue(); // Column M
    var name = sheet.getRange(i, 14).getValue(); // Column N
    var email = sheet.getRange(i, 15).getValue(); // Column O

    if (email && registeredEmails.indexOf(email) === -1) { // If email exists and is not already registered
      var subject = "Your email has been activated at 4 Season Burgers";
      var body = `
        <html>
          <body>
            <p>Dear ${name},</p>
            <p>Your email address has been successfully activated. You can now use our deals and place orders.</p>
            <p>Regards,<br>4 Season Burgers</p>
          </body>
        </html>`;
      
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: body
      });

      registeredSheet.appendRow([worksAt, name, email]);
      registeredEmails.push(email);
    }
  }
}


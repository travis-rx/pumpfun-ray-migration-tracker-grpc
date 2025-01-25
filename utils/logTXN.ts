export function searchForCreate(transaction) {
    const logMessages = transaction.meta?.logMessages || [];
     if (logMessages.some(log => log.includes('Create'))) {
        console.log("Create Transaction Found", logMessages);
      return transaction;
     }
}

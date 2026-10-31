// Payment reconciliation.
//
// Reads payments.jsonl and works out how much money we actually collected.
// Run:  node reconcile.js

const fs = require("fs");

const latestTransactions = new Map();

let total = 0;
let count = 0;

const lines = fs.readFileSync("payments.jsonl", "utf8").split("\n").filter((l) => l.length > 0);
for (const line of lines) {
  // const event = JSON.parse(line);
  let event;
  try {
      event = JSON.parse(line);
  } catch (error) {
      continue;
  }
  if (!event.txn_id) {
      continue;
  }

  const existing = latestTransactions.get(event.txn_id);
  if (!existing || new Date(event.ts) > new Date(existing.ts)) {
      latestTransactions.set(event.txn_id, event);
  }

  // if (event.status === "success") {
  //   total += Number(event.amount);
  //   count += 1;
  // }

}

for (const event of latestTransactions.values()) {
    if (event.status === "success") {
        total += Number(String(event.amount).replace(/,/g, ""));
        count += 1;
    }
}


const expected = parseInt(fs.readFileSync("expected.txt", "utf8").trim(), 10);

if (count !== expected) {
  console.log(`Check failed: counted ${count} successful payments, expected ${expected}.`);
  console.log("Something in the data isn't being handled the way the README describes.");
} else {
  console.log(`Check passed: ${count} successful payments.`);
  console.log(`Your code: KOYA-${Math.round(total)}`);
}

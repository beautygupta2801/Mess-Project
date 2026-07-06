const ExcelJS = require("exceljs");

async function testGenerate() {
  console.log("Starting test...");
  try {
    const billItems = [
        { name: "Electricity", amount: 200 },
        { name: "Fine", amount: 10 }
    ];
    const dietRate = 20;
    const students = [
        { _id: "s1", roomNo: "101", name: "Alice", rollNo: "R001" },
        { _id: "s2", roomNo: "102", name: "Bob", rollNo: "R002" }
    ];
    const mealMap = new Map([["s1", 30], ["s2", 25]]);
    const extraMap = new Map([["s1", 50], ["s2", 0]]);

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Bill");

    const columns = [
      { header: "Serial No", key: "serial", width: 10 },
      { header: "Room No", key: "roomNo", width: 12 },
      { header: "Name", key: "name", width: 30 },
      { header: "Roll No", key: "rollNo", width: 18 },
      { header: "Diet", key: "diet", width: 10 },
      { header: "Diet Rate", key: "dietRate", width: 12 },
      { header: "DietRate × Diet", key: "dietTotal", width: 16 },
      { header: "Extra", key: "extra", width: 12 },
    ];

    // Add dynamic columns for bill items
    let billItemsTotal = 0;
    const safeBillItems = Array.isArray(billItems) ? billItems : [];
    
    safeBillItems.forEach((item, index) => {
        columns.push({ header: item.name, key: `item_${index}`, width: 15 });
        billItemsTotal += Number(item.amount) || 0;
    });
    
    columns.push({ header: "Total Bill", key: "total", width: 14 });

    ws.columns = columns;

    students.forEach((s, idx) => {
      const diet = mealMap.get(String(s._id)) || 0;
      const extra = extraMap.get(String(s._id)) || 0;
      const dietTotal = Number(diet) * Number(dietRate);
      const total = dietTotal + Number(extra) + billItemsTotal;

      const row = {
        serial: idx + 1,
        roomNo: s.roomNo,
        name: s.name,
        rollNo: s.rollNo,
        diet,
        dietRate: Number(dietRate),
        dietTotal,
        extra,
        total,
      };

      // Add dynamic item amounts to row
      safeBillItems.forEach((item, index) => {
          row[`item_${index}`] = Number(item.amount);
      });

      ws.addRow(row);
    });

    ws.columns.forEach((col, index) => {
        if (index >= 4) { 
            col.numFmt = "#,##0.00";
        }
    });

    await workbook.xlsx.writeFile("test_bill.xlsx");
    console.log("File written successfully.");

  } catch (err) {
    console.error("Error:", err);
  }
}

testGenerate();

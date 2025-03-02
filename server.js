const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files (CSS, JS, etc.)

app.post("/generate-quotation", (req, res) => {
    const { customer_name, car_name, car_variant, car_price, discount, insurance, accessories } = req.body;

    // Convert string inputs to numbers
    const price = parseFloat(car_price);
    const discountRate = parseFloat(discount);
    const insuranceCost = parseFloat(insurance);
    const accessoriesCost = parseFloat(accessories);

    // Calculations
    const discounted_price = price - (price * (discountRate / 100));
    const registration_cost = price * 0.09; // 9% Registration Cost
    const total_cost = discounted_price + registration_cost + insuranceCost + accessoriesCost;

    // Generate PDF
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, "quotation.pdf");
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(18).text("Sai Services - Automobiles", { align: "center" });
    doc.fontSize(12).text("Wagholi, Pune | Contact: +91 9604329317", { align: "center" });
    doc.moveDown(2);

    // Customer Details
    doc.fontSize(14).text("Quotation Details", { align: "center" }).moveDown();
    doc.fontSize(12).text(`Customer Name: ${customer_name}`);
    doc.text(`Car Name: ${car_name}`);
    doc.text(`Car Variant: ${car_variant}`);
    doc.moveDown();

    // Table Headers
    doc.fontSize(12).text("Description", 100, doc.y, { underline: true });
    doc.text("Amount (₹)", 350, doc.y, { underline: true });
    doc.moveDown();

    // Table Data
    doc.text("Car Price", 100, doc.y);
    doc.text(price.toFixed(2), 350, doc.y);
    doc.moveDown();

    doc.text("Discount Applied", 100, doc.y);
    doc.text(`${discountRate.toFixed(2)}%`, 350, doc.y);
    doc.moveDown();

    doc.text("Discounted Price", 100, doc.y);
    doc.text(discounted_price.toFixed(2), 350, doc.y);
    doc.moveDown();

    doc.text("Registration Cost (9%)", 100, doc.y);
    doc.text(registration_cost.toFixed(2), 350, doc.y);
    doc.moveDown();

    doc.text("Insurance Cost", 100, doc.y);
    doc.text(insuranceCost.toFixed(2), 350, doc.y);
    doc.moveDown();

    doc.text("Accessories Cost", 100, doc.y);
    doc.text(accessoriesCost.toFixed(2), 350, doc.y);
    doc.moveDown();

    doc.font("Helvetica-Bold").text("Total Cost", 100, doc.y);
    doc.text(total_cost.toFixed(2), 350, doc.y);
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).text("Thank you for choosing Sai Services!", { align: "center" });

    doc.end();

    stream.on("finish", () => {
        res.download(filePath, "quotation.pdf", (err) => {
            if (err) console.error(err);
            fs.unlinkSync(filePath); // Delete the file after sending
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

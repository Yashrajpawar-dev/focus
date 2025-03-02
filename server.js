const express = require("express");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // Ensure static files are served (if needed)

// Endpoint to generate and send the PDF
app.post("/generate-quotation", (req, res) => {
    const { customer_name, car_name, car_variant, car_price, discount, insurance, accessories } = req.body;

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, "quotation.pdf");

    // Pipe PDF content to a file
    doc.pipe(fs.createWriteStream(filePath));

    // PDF Content
    doc.fontSize(16).text("Sai Services - Automobiles", { align: "center" });
    doc.fontSize(12).text("Wagholi, Pune | Contact: +91 9604329317", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Quotation Details", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Customer Name: ${customer_name}`);
    doc.text(`Car Name: ${car_name}`);
    doc.text(`Variant: ${car_variant}`);
    doc.text(`Car Price: ₹${car_price}`);
    doc.text(`Discount: ${discount}%`);
    doc.text(`Insurance: ₹${insurance}`);
    doc.text(`Accessories: ₹${accessories}`);
    doc.text("------------------------------------------------------");
    
    // Final Price Calculation
    const discountedPrice = car_price - (car_price * (discount / 100));
    const registrationCost = car_price * 0.09; // 9% Registration Cost
    const totalCost = discountedPrice + registrationCost + parseFloat(insurance) + parseFloat(accessories);

    doc.fontSize(14).text(`Total Cost: ₹${totalCost.toFixed(2)}`, { align: "center" });
    doc.moveDown();
    doc.text("Thank you for choosing Sai Services!", { align: "center" });

    doc.end();

    // Send the file after it is fully written
    doc.on("end", () => {
        res.download(filePath, "Quotation.pdf", (err) => {
            if (err) {
                console.error("Download error:", err);
                res.status(500).send("Error generating PDF.");
            }
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
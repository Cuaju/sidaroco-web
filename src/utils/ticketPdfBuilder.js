import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function buildTicketPdf({
    ticketId,
    routeName,
    travelDate,
    travelTime,
    purchaseDateTime,
    seat,
    price,
    username,
    email,
    logoBase64
}) {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    const PRIMARY = [2, 53, 49];
    const SECONDARY = [43, 148, 107];
    const ACCENT = [221, 185, 71];
    const LIGHT = [247, 240, 223];
    const DARK = [17, 24, 39];

    pdf.setFillColor(...SECONDARY);
    pdf.rect(0, 0, pageWidth, 50, "F");

    pdf.setFillColor(...PRIMARY);
    pdf.rect(0, 40, pageWidth, 10, "F");

    if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", 20, 12, 45, 0);
    }

    pdf.setFontSize(28);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text("BOARDING PASS", pageWidth - 20, 28, { align: "right" });

    pdf.setFontSize(11);
    pdf.setFont(undefined, "normal");
    pdf.text(`Ticket #${ticketId}`, pageWidth - 20, 38, { align: "right" });

    const y = 65;

    pdf.setFillColor(220, 220, 220);
    pdf.roundedRect(21, y + 1, pageWidth - 42, 150, 4, 4, "F");

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(20, y, pageWidth - 40, 150, 4, 4, "FD");

    let originName = "ORIGIN";
    let destinationName = "DESTINATION";

    if (typeof routeName === "string") {
        if (routeName.includes("→")) {
            const [o, d] = routeName.split("→").map(v => v.trim());
            originName = o;
            destinationName = d;
        } else if (routeName.includes("->")) {
            const [o, d] = routeName.split("->").map(v => v.trim());
            originName = o;
            destinationName = d;
        } else {
            originName = routeName;
        }
    }

    const routeY = y + 18;

    pdf.setFontSize(10);
    pdf.setTextColor(120, 120, 120);
    pdf.text("ORIGIN", 35, routeY - 10);
    pdf.text("DESTINATION", pageWidth - 35, routeY - 10, { align: "right" });

    pdf.setFontSize(18);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(...PRIMARY);
    pdf.text(originName, 35, routeY, { maxWidth: pageWidth / 2 - 55 });

    pdf.text(destinationName, pageWidth - 35, routeY, {
        align: "right",
        maxWidth: pageWidth / 2 - 55
    });

    pdf.setDrawColor(...SECONDARY);
    pdf.setLineWidth(1);
    pdf.line(pageWidth / 2 - 25, routeY - 4, pageWidth / 2 + 25, routeY - 4);

    const detailsY = y + 52;
    const leftCol = 35;
    const rightCol = pageWidth / 2 + 10;

    const showDetail = (label, value, x, yPos) => {
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.setFont(undefined, "normal");
        pdf.text(label.toUpperCase(), x, yPos);

        pdf.setFontSize(12);
        pdf.setTextColor(...DARK);
        pdf.setFont(undefined, "bold");
        pdf.text(String(value), x, yPos + 7);
    };

    showDetail("Date", travelDate, leftCol, detailsY);
    showDetail("Time", travelTime, rightCol, detailsY);
    showDetail("Seat", seat, leftCol, detailsY + 20);
    showDetail("Price", `$${price}`, rightCol, detailsY + 20);

    const passengerY = y + 120;

    pdf.setFillColor(...LIGHT);
    pdf.roundedRect(30, passengerY, pageWidth - 60, 30, 3, 3, "F");

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("PASSENGER", 38, passengerY + 8);

    pdf.setFontSize(13);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(...PRIMARY);
    pdf.text(username.toUpperCase(), 38, passengerY + 17);

    pdf.setFontSize(9);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(email, 38, passengerY + 24);

    const amenitiesY = passengerY + 35;
    
    pdf.setFillColor(240, 248, 245);
    pdf.roundedRect(30, amenitiesY, pageWidth - 60, 22, 3, 3, "F");
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("AMENITIES", 38, amenitiesY + 7);
    
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(...SECONDARY);
    const amenities = "WiFi  •  A/C  •  Charger  •  Seats  •  Bathroom";
    pdf.text(amenities, 38, amenitiesY + 16);

    const qrData = `TICKET:${ticketId}|ROUTE:${routeName}|DATE:${travelDate}|SEAT:${seat}`;
    const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 1,
        color: { dark: "#023531", light: "#FFFFFF" }
    });

    const qrSize = 30;
    const qrX = pageWidth - qrSize - 32;
    const qrY = y + 54;

    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...SECONDARY);
    pdf.setLineWidth(1.5);
    pdf.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, "FD");

    pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text("Scan to validate", qrX + qrSize / 2, qrY + qrSize + 6, {
        align: "center"
    });


    const infoY = amenitiesY + 30;

    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(`Bought: ${purchaseDateTime}`, 20, infoY);

    pdf.setFillColor(250, 250, 250);
    pdf.rect(20, infoY + 10, pageWidth - 40, 35, "F");

    pdf.setDrawColor(230, 230, 230);
    pdf.rect(20, infoY + 10, pageWidth - 40, 35, "S");

    pdf.setFontSize(7);
    pdf.setFont(undefined, "bold");
    pdf.text("TERMS AND CONDITIONS", 25, infoY + 16);

    pdf.setFont(undefined, "normal");
    [
        "• Present yourself 30 minutes before departure with official identification",
        "• This ticket is personal and non-transferable",
        "• Please keep this ticket until the end of your trip",
        "• Baggage allowance: 1 suitcase (25kg) + 1 carry-on bag"
    ].forEach((t, i) => {
        pdf.text(t, 25, infoY + 22 + i * 5);
    });

    pdf.setDrawColor(...SECONDARY);
    pdf.setLineWidth(2);
    pdf.line(0, pageHeight - 20, pageWidth, pageHeight - 20);

    pdf.setFontSize(9);
    pdf.setTextColor(...PRIMARY);
    pdf.setFont(undefined, "bold");
    pdf.text("SIDAROCO", 20, pageHeight - 10);

    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text("Your travel buddy", 20, pageHeight - 6);
    pdf.text("www.sidaroco.com", pageWidth - 20, pageHeight - 10, { align: "right" });

    pdf.save(`BoardingPass_${ticketId}.pdf`);
}

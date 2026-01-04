import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
    const HEADER_HEIGHT = 42;

    if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", 15, 12, 38, 0);
    }

    pdf.setFontSize(18);
    pdf.text("Bus Ticket", 15, HEADER_HEIGHT);

    pdf.setFontSize(11);
    pdf.text(`Ticket ID: ${ticketId}`, 15, HEADER_HEIGHT + 8);

    autoTable(pdf, {
        startY: HEADER_HEIGHT + 18,
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 6 },
        headStyles: { fillColor: [30, 30, 30], textColor: 255 },
        body: [
            ["Route", routeName],
            ["Travel date", travelDate],
            ["Travel time", travelTime],
            ["Seat", seat],
            ["Price", `$${price}`],
            ["Purchased at", purchaseDateTime]
        ]
    });

    autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 10,
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 6 },
        headStyles: { fillColor: [17, 24, 39], textColor: 255 },
        body: [
            ["Passenger", username],
            ["Email", email]
        ]
    });

    const qrDataUrl = await QRCode.toDataURL("https://www.sidaroco.com");

    pdf.addImage(qrDataUrl, "PNG", 170, 12, 30, 30);

    pdf.setFontSize(8);
    pdf.text("sidaroco.com", 170, 45);

    const pageHeight = pdf.internal.pageSize.height;
    pdf.setTextColor(130);
    pdf.text("© 2026 SIDAROCO · Digital ticket", 15, pageHeight - 15);

    pdf.save(`ticket-${ticketId}.pdf`);
}

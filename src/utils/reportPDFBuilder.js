import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function buildFinanceReportPdf({
    title,
    periodLabel,
    queriedAt,
    summary,
    tableHeaders,
    tableRows,
    logoBase64
}) {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;

    const PRIMARY = [2, 53, 49];
    const SECONDARY = [43, 148, 107];
    const ACCENT = [221, 185, 71];
    const LIGHT_BG = [247, 240, 223];
    const DARK = [15, 23, 42];

    pdf.setFillColor(...PRIMARY);
    pdf.rect(0, 0, pageWidth, 8, "F");

    pdf.setFillColor(...SECONDARY);
    pdf.rect(0, 8, pageWidth, 2, "F");

    if (logoBase64) {
        pdf.addImage(logoBase64, "PNG", 20, 15, 40, 0);
    }

    if (queriedAt) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(queriedAt, pageWidth - 20, 18, { align: "right" });
    }

    pdf.setFontSize(24);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(...PRIMARY);
    pdf.text(title, 20, 45);

    pdf.setDrawColor(...SECONDARY);
    pdf.setLineWidth(1);
    pdf.line(20, 48, 80, 48);

    pdf.setFontSize(12);
    pdf.setFont(undefined, "normal");
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Period: ${periodLabel}`, 20, 56);

    let y = 70;

    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.setTextColor(...PRIMARY);
    pdf.text("Financial summary", 20, y);

    y += 10;

    const cardsPerRow = 2;
    const cardWidth = 85;
    const cardHeight = 22;
    const cardSpacing = 10;

    summary.forEach((row, index) => {
        const col = index % cardsPerRow;
        const rowNum = Math.floor(index / cardsPerRow);

        const x = 20 + col * (cardWidth + cardSpacing);
        const cardY = y + rowNum * (cardHeight + 8);

        pdf.setFillColor(220, 220, 220);
        pdf.roundedRect(x + 1, cardY + 1, cardWidth, cardHeight, 3, 3, "F");

        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "FD");

        pdf.setFillColor(...ACCENT);
        pdf.roundedRect(x, cardY, 3, cardHeight, 0, 0, "F");

        pdf.setFontSize(9);
        pdf.setFont(undefined, "normal");
        pdf.setTextColor(100, 100, 100);
        pdf.text(row.label, x + 8, cardY + 8);

        pdf.setFontSize(13);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(...SECONDARY);

        const text = String(row.value ?? "—");
        const maxTextWidth = cardWidth - 14;

        const lines = pdf.splitTextToSize(text, maxTextWidth);

        const lineHeight = 5;
        const textBlockHeight = lines.length * lineHeight;

        const textY =
            cardY +
            (cardHeight / 2) +
            (textBlockHeight / 2) -
            2;

        pdf.text(lines, x + 8, textY, {
            maxWidth: maxTextWidth
        });

    });

    const totalRows = Math.ceil(summary.length / cardsPerRow);
    y += totalRows * (cardHeight + 8) + 15;

    if (tableHeaders.length && tableRows.length) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, "bold");
        pdf.setTextColor(...PRIMARY);
        pdf.text("Transaction Details", 20, y);

        y += 8;

        autoTable(pdf, {
            startY: y,
            head: [tableHeaders],
            body: tableRows,
            theme: "striped",
            styles: {
                fontSize: 9,
                cellPadding: 5,
                lineColor: [220, 220, 220],
                lineWidth: 0.1
            },
            headStyles: {
                fillColor: PRIMARY,
                textColor: 255,
                fontSize: 10,
                fontStyle: "bold",
                halign: "left"
            },
            alternateRowStyles: {
                fillColor: LIGHT_BG
            },
            margin: { left: 20, right: 20 }
        });
    }

    const pageHeight = pdf.internal.pageSize.height;

    pdf.setDrawColor(...SECONDARY);
    pdf.setLineWidth(0.5);
    pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);

    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont(undefined, "normal");
    pdf.text("© 2025 SIDAROO", 20, pageHeight - 15);

    pdf.setFont(undefined, "italic");
    pdf.text("Finance Manager · Confidential Report", 20, pageHeight - 10);

    pdf.setFont(undefined, "normal");
    pdf.text(`Page 1`, pageWidth - 20, pageHeight - 15, { align: "right" });

    pdf.save(`${title.replace(/\s+/g, "_")}.pdf`);
}
import type { ResultState } from "@/types";

function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportAsJson(data: ResultState, filename: string) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    triggerDownload(blob, `${filename}.json`);
}

function escapeCsvCell(cell: string) {
    if (cell.includes(',')) {
        return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
}

export function exportAsCsv(data: ResultState, filename:string) {
    let csvContent = "Type,Content\r\n";

    // Add summary
    csvContent += `Summary,${escapeCsvCell(data.summary)}\r\n`;

    // Add objections
    data.objections.forEach(objection => {
        csvContent += `Objection,${escapeCsvCell(objection)}\r\n`;
    });

    // Add action items
    data.actionItems.forEach(item => {
        csvContent += `Action Item,${escapeCsvCell(item)}\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${filename}.csv`);
}

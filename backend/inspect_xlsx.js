
const XLSX = require('xlsx');
const path = require('path');

const filePath = 'c:\\Users\\Prakruthi G\\Downloads\\hire-drive---database-driven-records-manager\\Toptimize - Google sheet.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('--- HEADERS ---');
    console.log(Object.keys(jsonData[0] || {}).join(', '));
    console.log('--- SAMPLE ROW ---');
    console.log(JSON.stringify(jsonData[0], null, 2));
} catch (err) {
    console.error('Error reading file:', err.message);
}

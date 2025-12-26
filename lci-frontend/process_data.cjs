const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_JSON_PATH = '/Users/sonjuyeong/Desktop/countryMouse/lci-backend/src/main/resources/regions_data.json';
const DATA_DIR = '/Users/sonjuyeong/Desktop/countryMouse/data';

const FILES = [
    { type: 'apt', file: '아파트(전월세)_실거래가_20251223140251.xlsx' },
    { type: 'officetel', file: '오피스텔(전월세)_실거래가_20251223140225.xlsx' },
    { type: 'villa', file: '연립다세대(전월세)_실거래가_20251223140214.xlsx' },
    { type: 'oneroom', file: '단독다가구(전월세)_실거래가_20251223140135.xlsx' }
];

// Helper to init stats object
const createStats = () => ({
    apt: { rentSum: 0, rentCount: 0, jeonseSum: 0, jeonseCount: 0 },
    officetel: { rentSum: 0, rentCount: 0, jeonseSum: 0, jeonseCount: 0 },
    villa: { rentSum: 0, rentCount: 0, jeonseSum: 0, jeonseCount: 0 },
    oneroom: { rentSum: 0, rentCount: 0, jeonseSum: 0, jeonseCount: 0 },
    tworoom: { rentSum: 0, rentCount: 0, jeonseSum: 0, jeonseCount: 0 } // New
});

// Load Base JSON
console.log("Loading base regions data...");
const regions = JSON.parse(fs.readFileSync(BASE_JSON_PATH, 'utf8'));

// Two Sets of Maps: Exact and Parent
const exactMap = new Map();
const parentMap = new Map();

// Initialize maps
regions.forEach(r => {
    const baseName = r.name.split(' (')[0].trim();
    if (!exactMap.has(baseName)) {
        exactMap.set(baseName, createStats());
    }
    const parentName = baseName.replace(/\d+가$/, '').replace(/\d+동$/, '');
    if (!parentMap.has(parentName)) {
        parentMap.set(parentName, createStats());
    }
});

console.log(`Initialized maps. Exact keys: ${exactMap.size}, Parent keys: ${parentMap.size}`);

// Process Files
FILES.forEach(({ type, file }) => {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${file}`);
        return;
    }

    console.log(`Processing ${type} data from ${file}...`);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 16, defval: null });

    // Determine Logic based on Type
    // Apt/Officetel/Villa: Type=6, Deposit=10, Rent=11
    // OneRoom: Type=5, Deposit=8, Rent=9, Area=4
    let typeIdx = 6;
    let depositIdx = 10;
    let rentIdx = 11;
    let areaIdx = -1; // Not used for others yet

    if (type === 'oneroom') {
        typeIdx = 5;
        depositIdx = 8;
        rentIdx = 9;
        areaIdx = 4;
    }

    rows.forEach(row => {
        try {
            const rawAddress = row[1]; // "서울특별시 송파구 장지동"
            if (!rawAddress) return;

            const parts = rawAddress.split(' ');
            if (parts.length < 3) return;
            const fullDong = `${parts[1]} ${parts[2]}`; // "송파구 장지동"

            const contractType = row[typeIdx];
            const depositStr = row[depositIdx];
            const rentStr = row[rentIdx];

            if (!depositStr) return;

            const deposit = parseInt(String(depositStr).replace(/,/g, ''), 10) * 10000;
            const rent = parseInt(String(rentStr || '0').replace(/,/g, ''), 10) * 10000;

            // Determine effective type (split oneroom -> oneroom/tworoom)
            let effectiveType = type;
            if (type === 'oneroom') {
                const areaStr = row[areaIdx];
                const area = parseFloat(areaStr || '0');
                if (area >= 40.0) {
                    effectiveType = 'tworoom';
                }
            }

            // Update Logic
            const updateStats = (map, key) => {
                if (map.has(key)) {
                    const data = map.get(key)[effectiveType];
                    if (contractType === '전세') {
                        data.jeonseSum += deposit;
                        data.jeonseCount++;
                    } else {
                        data.rentSum += rent;
                        data.rentCount++;
                    }
                }
            };

            updateStats(exactMap, fullDong);
            const parentName = fullDong.replace(/\d+가$/, '').replace(/\d+동$/, '');
            updateStats(parentMap, parentName);

        } catch (err) {
            // Ignore
        }
    });
});

console.log("Aggregating data with fallback...");

// Update Regions List
const updatedRegions = regions.map(r => {
    const baseName = r.name.split(' (')[0].trim();
    const parentName = baseName.replace(/\d+가$/, '').replace(/\d+동$/, '');

    const exactStats = exactMap.get(baseName);
    const parentStats = parentMap.get(parentName);

    const getSmartAvg = (type, mode, currentVal) => {
        const exact = exactStats ? exactStats[type] : null;
        const parent = parentStats ? parentStats[type] : null;

        let sum = 0, count = 0;

        const modeSum = mode === 'rent' ? 'rentSum' : 'jeonseSum';
        const modeCount = mode === 'rent' ? 'rentCount' : 'jeonseCount';

        if (exact && exact[modeCount] >= 3) {
            sum = exact[modeSum];
            count = exact[modeCount];
        } else if (parent && parent[modeCount] > 0) {
            sum = parent[modeSum];
            count = parent[modeCount];
        } else if (exact && exact[modeCount] > 0) {
            sum = exact[modeSum];
            count = exact[modeCount];
        } else {
            return currentVal || 0;
        }

        return count > 0 ? Math.floor(sum / count) : (currentVal || 0);
    };

    r.aptAvgRent = getSmartAvg('apt', 'rent', r.aptAvgRent);
    r.aptAvgJeonse = getSmartAvg('apt', 'jeonse', r.aptAvgJeonse);

    r.officetelAvgRent = getSmartAvg('officetel', 'rent', r.officetelAvgRent);
    r.officetelAvgJeonse = getSmartAvg('officetel', 'jeonse', r.officetelAvgJeonse);

    r.villaAvgRent = getSmartAvg('villa', 'rent', r.villaAvgRent);
    r.villaAvgJeonse = getSmartAvg('villa', 'jeonse', r.villaAvgJeonse);

    r.oneRoomAvgRent = getSmartAvg('oneroom', 'rent', r.oneRoomAvgRent);
    r.oneRoomAvgJeonse = getSmartAvg('oneroom', 'jeonse', r.oneRoomAvgJeonse);

    // New Two Room Fields
    r.twoRoomAvgRent = getSmartAvg('tworoom', 'rent', r.twoRoomAvgRent);
    r.twoRoomAvgJeonse = getSmartAvg('tworoom', 'jeonse', r.twoRoomAvgJeonse);

    return r;
});

fs.writeFileSync(BASE_JSON_PATH, JSON.stringify(updatedRegions, null, 2), 'utf8');
console.log("Successfully updated regions_data.json with One/Two Room Separation!");

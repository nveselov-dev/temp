const fs = require('fs');
const path = require('path');
const kdocAdapter = require('../kdoc-adapter/kdoc-adapter');

const htmlsDir = path.join(__dirname, '../docs/htmls');
const jsonsDir = path.join(__dirname, '../docs/jsons');

function getTestFiles() {
    if (!fs.existsSync(htmlsDir)) return [];
    return fs.readdirSync(htmlsDir)
        .filter(file => file.endsWith('.html'))
        .sort();
}

describe('KDoc Adapter', () => {
    const testFiles = getTestFiles();

    if (testFiles.length === 0) {
        test('HTML файлы не найдены', () => expect(true).toBe(true));
        return;
    }

    // ВАЖНО: увеличиваем таймаут для каждого теста
    jest.setTimeout(30000); // 30 секунд на тест

    test.each(testFiles)(
        'конвертирует %s',
        async (htmlFile) => {
            const htmlPath = path.join(htmlsDir, htmlFile);
            const jsonFile = htmlFile.replace('.html', '.json');
            const jsonPath = path.join(jsonsDir, jsonFile);

            const html = fs.readFileSync(htmlPath, 'utf-8');

            // Засекаем время
            const start = Date.now();
            const result = await kdocAdapter(html);
            const duration = Date.now() - start;

            console.log(`✅ ${htmlFile} — ${duration}ms, объектов: ${result.objects.length}`);

            const resultJson = JSON.stringify(result, null, 2);

            if (!fs.existsSync(jsonPath)) {
                fs.writeFileSync(jsonPath, resultJson, 'utf-8');
                console.warn(`⚠️ Создан эталон: ${jsonFile}`);
                return;
            }

            const expectedJson = fs.readFileSync(jsonPath, 'utf-8');
            expect(resultJson).toBe(expectedJson);
        }
    );
});
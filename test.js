const assert = require('assert');
const fs = require('fs');

const FILEPATH = './README.md';

function extractWords() {
    const content = fs.readFileSync(FILEPATH).toString();
    const words = content.match(/\*\s(.*)/g)
        .map(w => w.replace('* ', '').trim());
    return words;
}

describe('shiritori', () => {
    it('should not contain same word', () => {
        const words = extractWords();
        words.forEach((w1, i) => {
            words.forEach((w2, j) => {
                if (i === j) return;
                if (w1 === w2) {
                    throw new Error(`Duplicated word: ${w1}`);
                }
            });
        });
    });
});

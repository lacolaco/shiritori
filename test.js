const assert = require('assert');
const fs = require('fs');

const FILEPATH = './README.md';

function extractWordsFromREADME() {
    const content = fs.readFileSync(FILEPATH).toString();
    const words = content.match(/\*\s(.*)/g)
        .map(w => w.replace('* ', '').trim());
    return words;
}

function assertDuplicatedWord(words) {
    words.forEach((w1, i) => {
        words.forEach((w2, j) => {
            if (i === j) return;
            if (w1 === w2) {
                throw new Error(`Duplicated word: ${w1}`);
            }
        });
    });
}

function assertEndSuffix(words) {
    words.forEach((w, i) => {
        if (w.endsWith('ン') || w.endsWith('ん')) {
            throw new Error(`End suffix: ${w}`)
        }
    });
}

describe('shiritori', () => {
    it('should not contain same word', () => {
        const words = extractWordsFromREADME();
        assertDuplicatedWord(words);
    });

    it('should not have `nn` suffix', () => {
        const words = extractWordsFromREADME();
        assertEndSuffix(words);
    })
});

describe('meta_test', () => {
    describe('assertDuplicatedWord', () => {
        it('should work well with valid words', () => {
            const words = ['しりとり', 'りんご'];
            assertDuplicatedWord(words);
        });
        it('should work well with invalid words', () => {
            const words = ['しりとり', 'しりとり'];
            assert.throws(() => assertDuplicatedWord(words), /Duplicated word/);
        })
    });
    describe('assertEndSuffix', () => {
        it('should work well with valid words', () => {
            const words = ['しりとり', 'りんご'];
            assertEndSuffix(words);
        });
        it('should work well with invalid words', () => {
            const words = ['しりとり', 'りん'];
            assert.throws(() => assertEndSuffix(words), /End suffix/);
        })
    });
});
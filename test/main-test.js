const assert = require('assert');
const fs = require('fs');
const path = require('path');

const tokenizer = require('./tokenizer');

function extractWordsFromREADME() {
    const content = fs.readFileSync(path.join(__dirname, '../README.md')).toString();
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

function assertGameEnd(words) {
    words.forEach((w, i) => {
        if (w.endsWith('ン') || w.endsWith('ん')) {
            throw new Error(`Game end: ${w}`);
        }
    });
}

function assertGameEndByPronunciation(words) {
    return Promise.all(
        words.map((w, i) => {
            return tokenizer.tokenize(w).then(tokens => {
                const lastToken = tokens[tokens.length - 1];
                if (!lastToken.pronunciation) {
                    // カタカナ語の場合、発音が含まれない場合がある。
                    // この場合はassertGameEndでチェック可能なのでここでは素通しする
                    return;
                }
                if (lastToken.pronunciation.endsWith('ン')) {
                    throw new Error(`Game end: ${w} (${lastToken.pronunciation})`);
                }
            });
        })
    );
}

describe('shiritori', () => {
    it('should not contain same word', () => {
        const words = extractWordsFromREADME();
        assertDuplicatedWord(words);
    });

    it('should not have game-end suffix', () => {
        const words = extractWordsFromREADME();
        assertGameEnd(words);
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
    describe('assertGameEnd', () => {
        it('should work well with valid words', () => {
            const words = ['しりとり', 'りんご'];
            assertGameEnd(words);
        });
        it('should work well with invalid words', () => {
            const words = ['しりとり', 'りん'];
            assert.throws(() => assertGameEnd(words), /Game end/);
        })
    });
    describe('tokenizer', () => {
        it('should work well', () => {
            return tokenizer.tokenize('りんご');
        });
    });
    describe('assertGameEndByPronunciation', () => {
        it('should work well with valid words', () => {
            const words = ['しりとり', 'りんご'];
            return assertGameEndByPronunciation(words);
        });
        it('should work well with invalid words', () => {
            const words = ['ティッシュ', '習慣'];
            return assertGameEndByPronunciation(words)
                .then(() => {
                    throw new Error('no error');
                }, err => {
                    console.log(err);
                });
        })
    });
});
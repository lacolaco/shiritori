'use srtict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const tokenizer = require('./tokenizer');
const Bot = require('./github-bot');

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

function getPronunciation(word) {
    const match = word.match(/.+\s+\<(.+)\>/)
    if (match) {
        return Promise.resolve(match[1]);
    } else {
        return tokenizer.tokenize(word).then(tokens => {
            return tokens.map(token => token.pronunciation || token.surface_form).join('')
        });
    }
}

function assertGameEndByPronunciation(words) {
    return Promise.all(
        words.map((w, i) => {
            return getPronunciation(w).then(pron => {
                if (pron.endsWith('ン') || pron.endsWith('ん')) {
                    throw new Error(`Game end: ${w} (${pron})`);
                }
            });
        })
    );
}

function assertConnection(words) {
    const arr = [];
    const promises = words.map((w, i) => {
        return getPronunciation(w).then(pron => {
            arr[i] = pron;
        });
    });
    return Promise.all(promises).then(() => {
        arr.forEach((pron, i) => {
            if (i === 0) return;
            const prevPron = arr[i - 1];
            const prevArr = Array.from(prevPron);
            var prevLast = prevArr[prevArr.length - 1];
            if (/[ァィゥェォャュョー]/.test(prevLast)) {
                // 長音、促音の場合は次の文字まで一致を求める
                prevLast = prevArr[prevArr.length - 2] + prevLast;
            }
            console.log([prevPron, prevLast, pron]);
            if (!pron.startsWith(prevLast)) {
                throw new Error(`Unconnected words: ${words[i - 1]} (${prevPron}) -> ${words[i]} (${pron})`);
            }
        })
    });
}

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
            return tokenizer.tokenize('りんご').then(tokens => console.log(tokens));
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
    describe('assertConnection', () => {
        it('should work well with valid words', () => {
            const words = ['しりとり', 'りんご'];
            return assertConnection(words);
        });
        it('should work well with valid words (special)', () => {
            const words = ['ティッシュ', 'シュークリーム'];
            return assertConnection(words);
        });
        it('should work well with invalid words', () => {
            const words = ['しりとり', '忍者'];
            return assertConnection(words)
                .then(() => {
                    throw new Error('no error');
                }, err => {
                    console.log(err);
                });
        });
        it('should work well with invalid words (special)', () => {
            const words = ['サッカー', 'かもめ'];
            return assertConnection(words)
                .then(() => {
                    throw new Error('no error');
                }, err => {
                    console.log(err);
                });
        })
    });
});

describe('shiritori', () => {
    it('should not contain same word', () => {
        const words = extractWordsFromREADME();
        assertDuplicatedWord(words);
    });

    it('should not have game-end suffix', () => {
        const words = extractWordsFromREADME();
        assertGameEnd(words);
    });

    it('should not have game-end suffix (by pronunciation)', () => {
        const words = extractWordsFromREADME();
        return assertGameEndByPronunciation(words);
    });

    it('should keep connection', () => {
        const words = extractWordsFromREADME();
        return assertConnection(words);
    });

    after(() => {
        var bot = null;
        if (process.env.CI_PULL_REQUEST && process.env.GITHUB_TOKEN) {
            const url = process.env.CI_PULL_REQUEST.split('/');
            bot = new Bot(+url[url.length - 1]);
            bot.setToken(process.env.GITHUB_TOKEN);
        }
        if (bot) {
            const words = extractWordsFromREADME();
            const lastWord = words[words.length - 1];
            return getPronunciation(lastWord)
                .then(pron => {
                    return bot.comment(`
* **単語**: ${lastWord}
* **読み**: ${pron}

もし想定外の読みになっている場合は次のように修正してください

    * 単語 <タンゴ>

`)
                });
        }
    })
});

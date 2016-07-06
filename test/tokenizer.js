'use strict';

const path = require('path');
const kuromoji = require('kuromoji');

class Tokenizer {
    constructor() {
        this._kuromoji = null;
    }

    getTokenizer() {
        if (!this._kuromoji) {
            return new Promise((resolve, reject) => {
                kuromoji.builder({ dicPath: path.join(__dirname, '../node_modules/kuromoji/dist/dict/') })
                    .build((err, tokenizer) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        this._kuromoji = tokenizer;
                        resolve(this._kuromoji);
                    });
            });
        } else {
            return Promise.resolve(this._kuromoji);
        }
    }
    
    tokenize(text) {
        return this.getTokenizer()
            .then(tokenizer => {
                return tokenizer.tokenize(text);
            });
    }
}

module.exports = new Tokenizer();
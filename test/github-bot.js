'use strict';

const GitHubApi = require('github');

const baseOptions = {
    user: 'laco0416',
    repo: 'shiritori'
};

function createOptions(options) {
    return Object.assign(baseOptions, options);
}

class Bot {

    constructor(issueNumber) {
        this.issueNumber = issueNumber;
        this.github = new GitHubApi({
            // optional
            debug: true,
            protocol: "https",
            headers: {
                "user-agent": "laco-gh-bot" // GitHub is happy with a unique user agent
            },
            timeout: 5000
        });
    }

    setToken(token) {
        this.github.authenticate({
            type: "oauth",
            token: token
        });
    }

    comment(message) {
        return this.github.issues.createComment(createOptions({
            number: this.issueNumber,
            body: message
        }));
    }
}

module.exports = Bot;
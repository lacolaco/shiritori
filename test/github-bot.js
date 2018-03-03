const Octokit = require('@octokit/rest');

class Bot {
  constructor() {
    this.octokit = new Octokit({
      // optional
      debug: true,
      protocol: 'https',
      headers: {
        'user-agent': 'laco-gh-bot' // GitHub is happy with a unique user agent
      },
      timeout: 5000
    });
  }

  setToken(token) {
    this.octokit.authenticate({
      type: 'oauth',
      token: token
    });
  }

  createIssueComment({ message, owner, repo, number }) {
    return this.octokit.issues.createComment({
      owner,
      repo,
      number: number,
      body: `**From Circle CI** 

${message}`
    });
  }
}

module.exports = Bot;

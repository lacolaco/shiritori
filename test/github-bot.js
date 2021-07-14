const { Octokit } = require('@octokit/rest');

class Bot {
  constructor() {
    this.octokit = new Octokit({
      // optional
      debug: true,
      protocol: 'https',
      headers: {
        'user-agent': 'laco-gh-bot', // GitHub is happy with a unique user agent
      },
      timeout: 5000,
    });
  }

  async createIssueComment({ message, owner, repo, number }) {
    return await this.octokit.issues.createComment({
      owner,
      repo,
      number: number,
      body: `**From Circle CI** 

${message}`,
    });
  }
}

module.exports = Bot;

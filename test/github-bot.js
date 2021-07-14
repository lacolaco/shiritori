const { Octokit } = require('@octokit/rest');

class Bot {
  constructor() {
    this.octokit = new Octokit();
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

const { Octokit } = require('@octokit/action');

class Bot {
  constructor() {
    this.octokit = new Octokit();
  }

  async createIssueComment({ message, owner, repo, number }) {
    return await this.octokit.issues.createComment({
      owner,
      repo,
      issue_number: number,
      body: `${message}`,
    });
  }
}

module.exports = Bot;

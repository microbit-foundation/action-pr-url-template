// SPDX-License-Identifier: MIT
// (c) 2020 Micro:bit Educational Foundation and contributors

import * as core from "@actions/core";
import * as uriTemplate from "uri-template";
import * as github from "@actions/github";

export async function run(): Promise<void> {
  try {
    const uriTemplateInput: string = core.getInput("uri-template");
    const repoToken: string = core.getInput("repo-token");
    const pr = github.context.payload.pull_request;
    if (!pr) {
      throw new Error(`Expected to run on PR events only.`);
    }
    let uriTemplateExpander;
    try {
      uriTemplateExpander = uriTemplate.parse(uriTemplateInput);
    } catch (e) {
      throw new Error(`Invalid uri-template input: ${e.message}`);
    }
    // context.ref is refs/pulls/123 which isn't helpful!
    const branch = pr.head.ref;
    const context = { branch };
    core.debug(
      `Expanding ${uriTemplateInput} with context ${JSON.stringify(context)}`
    );
    const uri = uriTemplateExpander.expand(context);
    core.info(`Commenting on #${pr.number} with URL ${uri}`);

    const octokit = new github.GitHub(repoToken);
    const { repo } = github.context;
    const response = await octokit.issues.createComment({
      ...repo,
      issue_number: pr.number,
      body: `Preview build will be at ${uri}`
    });
    core.debug(`Created comment ${response.data.url}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

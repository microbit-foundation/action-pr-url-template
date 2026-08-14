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
      const message = e instanceof Error ? e.message : String(e);
      throw new Error(`Invalid uri-template input: ${message}`);
    }
    // context.ref is refs/pulls/123 which isn't helpful!
    // we could make this sanitization configurable if there was a need
    const branch = pr.head.ref.replace(/[^a-zA-Z0-9]/g, "-");
    const variables = {branch};
    core.debug(
      `Expanding ${uriTemplateInput} with variables ${JSON.stringify(
        variables
      )}`
    );
    const uri = uriTemplateExpander.expand(variables);
    core.info(`Commenting on #${pr.number} with URL ${uri}`);

    const octokit = github.getOctokit(repoToken);
    const {repo} = github.context;
    const response = await octokit.rest.issues.createComment({
      ...repo,
      issue_number: pr.number,
      body: `Preview build will be at\n${uri}`
    });
    core.debug(`Created comment ${response.data.url}`);
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

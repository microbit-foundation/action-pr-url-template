// SPDX-License-Identifier: MIT
// (c) 2020 Micro:bit Educational Foundation and contributors

jest.mock("@actions/github");
jest.mock("@actions/core");

import { run } from "../src/action";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { mocked } from "ts-jest/utils";

describe("action", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("error if not a PR event", async () => {
    await run();

    expect(core.setFailed).toBeCalledWith("Expected to run on PR events only.");
  });

  it("no action if ref is not a branch", async () => {
    withInputsAndContext(
      { "uri-template": "https://{branch}.example.com" },
      { ref: "refs/tags/v1", payload: { pull_request: { number: 123 } } }
    );

    await run();

    expect(core.setFailed).not.toBeCalled();
  });

  it("fails for invalid URI template", async () => {
    withInputsAndContext(
      { "uri-template": "{{{{" },
      { ref: "refs/heads/master", payload: { pull_request: { number: 123 } } }
    );

    await run();

    expect(core.setFailed).toBeCalledWith(
      'Invalid uri-template input: Expected "(", "*", ",", ":", "}", [\\/;:.?&+#] or [a-zA-Z0-9_.%] but "{" found.'
    );
  });

  it("comments on PR for branch", async () => {
    withInputsAndContext(
      { "uri-template": "https://{branch}.example.com" },
      { ref: "refs/heads/master", payload: { pull_request: { number: 123 } } }
    );
    const createComment = jest.fn();
    createComment.mockReturnValue({
      data: { url: "https://example.com/some-issue-url" }
    });
    mocked(github.GitHub).mockImplementation(
      () =>
        ({
          issues: {
            createComment
          }
        } as any)
    );

    await run();

    expect(createComment).toBeCalledWith({
      issue_number: 123,
      body: `Preview build will be at https://master.example.com`
    });
    expect(core.setFailed).not.toBeCalled();
  });
});

const withInputsAndContext = (inputs: Record<string, string>, context: any) => {
  const githubMock = github as any;
  githubMock.context = context;
  mocked(core.getInput).mockImplementation(
    (param: string, _options?: core.InputOptions) => inputs[param]
  );
};

// SPDX-License-Identifier: MIT
// (c) 2020 Micro:bit Educational Foundation and contributors

// An explicit factory rather than an automock: automocking has to load the real
// module to read its exports, which pulls in undici via @actions/http-client.
// __esModule is required: without it esModuleInterop's __importStar rebuilds the
// namespace object with getter-only bindings, so tests cannot assign to context.
jest.mock("@actions/github", () => ({
  __esModule: true,
  context: {},
  getOctokit: jest.fn()
}));
jest.mock("@actions/core");

import {run} from "../src/action";
import * as core from "@actions/core";
import * as github from "@actions/github";

describe("action", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("error if not a PR event", async () => {
    withInputsAndContext(
      {"uri-template": "https://{branch}.example.com"},
      {
        payload: {
          not_a_pull_request: {number: 123, head: {ref: "master"}}
        }
      }
    );

    await run();

    expect(core.setFailed).toBeCalledWith("Expected to run on PR events only.");
  });

  it("fails for invalid URI template", async () => {
    withInputsAndContext(
      {"uri-template": "{{{{"},
      {payload: {pull_request: {number: 123, head: {ref: "master"}}}}
    );

    await run();

    expect(core.setFailed).toBeCalledWith(
      expect.stringMatching(/^Invalid uri-template input: /)
    );
  });

  it("comments on PR for branch", async () => {
    withInputsAndContext(
      {"uri-template": "https://{branch}.example.com"},
      {payload: {pull_request: {number: 123, head: {ref: "master"}}}}
    );
    const createComment = mockedCreateCommentApi();

    await run();

    expect(createComment).toBeCalledWith({
      issue_number: 123,
      body: `Preview build will be at\nhttps://master.example.com`
    });
    expect(core.setFailed).not.toBeCalled();
  });

  it("sanitises the branch name", async () => {
    withInputsAndContext(
      {"uri-template": "https://{branch}.example.com"},
      {
        payload: {
          pull_request: {number: 123, head: {ref: "feature/yak/shaving"}}
        }
      }
    );
    const createComment = mockedCreateCommentApi();

    await run();

    expect(createComment).toBeCalledWith({
      issue_number: 123,
      body: `Preview build will be at\nhttps://feature-yak-shaving.example.com`
    });
    expect(core.setFailed).not.toBeCalled();
  });
});

const mockedCreateCommentApi = () => {
  const createComment = jest.fn();
  createComment.mockReturnValue({
    data: {url: "https://example.com/some-issue-url"}
  });
  jest.mocked(github.getOctokit).mockImplementation(
    () =>
      ({
        rest: {
          issues: {
            createComment
          }
        }
      } as any)
  );
  return createComment;
};

const withInputsAndContext = (inputs: Record<string, string>, context: any) => {
  const githubMock = github as any;
  githubMock.context = context;
  jest
    .mocked(core.getInput)
    .mockImplementation(
      (param: string, _options?: core.InputOptions) => inputs[param]
    );
};

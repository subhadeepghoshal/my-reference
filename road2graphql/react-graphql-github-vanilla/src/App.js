import React, { Component } from "react";
import axios from "axios";
import {
  GET_ORGANIZATION,
  GET_REPOSITORY_OF_ORGANIZATION,
  GET_ISSUES_OF_REPOSITORY,
} from "./gql/Query";

import { ADD_STAR, REMOVE_STAR } from "./gql/Mutation";

import Organization from "./components/Organization";

const TITLE = "React GraphQL GitHub Client";

const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const resolveIssuesQuery = (queryResult, cursor) => (state) => {
  console.log(queryResult);
  const { data, errors } = queryResult.data;

  if (!cursor) {
    return {
      organization: data.organization,
      errors,
    };
  }

  const { edges: oldIssues } = state.organization.repository.issues;
  const { edges: newIssues } = data.organization.repository.issues;
  const updatedIssues = [...oldIssues, ...newIssues];

  return {
    organization: {
      ...data.organization,
      repository: {
        ...data.organization.repository,
        issues: {
          ...data.organization.repository.issues,
          edges: updatedIssues,
        },
      },
    },
    errors,
  };
};

const resolveAddStarMutation = (viewerHasStarred, count) => (state) => {
  return {
    ...state,
    organization: {
      ...state.organization,
      repository: {
        ...state.organization.repository,
        viewerHasStarred,
        stargazers: {
          totalCount: count,
        },
      },
    },
  };
};

const getIssuesOfRepository = (path, cursor) => {
  const [organization, repository] = path.split("/");

  return axiosGitHubGraphQL.post("", {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository, cursor },
  });
};

const addStarToRepository = (repositoryId) => {
  return axiosGitHubGraphQL.post("", {
    query: ADD_STAR,
    variables: { repositoryId },
  });
};

const removeStarFromRepository = (repositoryId) => {
  return axiosGitHubGraphQL.post("", {
    query: REMOVE_STAR,
    variables: { repositoryId },
  });
};

class App extends Component {
  state = {
    path: "the-road-to-learn-react/the-road-to-learn-react",
    organization: null,
    errors: null,
  };

  onStarRepository = (repositoryId, viewerHasStarred) => {
    if (!viewerHasStarred) {
      addStarToRepository(repositoryId).then((mutationResult) => {
        let viewerHasStarredResult = mutationResult.data.data.addStar.starrable.viewerHasStarred;
        let count = mutationResult.data.data.addStar.starrable.stargazers.totalCount;
        this.setState(resolveAddStarMutation(viewerHasStarredResult, count));
      });
    } else {
      removeStarFromRepository(repositoryId).then((mutationResult) => {
        let viewerHasStarredResult = mutationResult.data.data.removeStar.starrable.viewerHasStarred;
        let count = mutationResult.data.data.removeStar.starrable.stargazers.totalCount;
        this.setState(resolveAddStarMutation(viewerHasStarredResult, count));      
      });
    }
  };

  onFetchMoreIssues = () => {
    const { endCursor } = this.state.organization.repository.issues.pageInfo;
    this.onFetchFromGitHub(this.state.path, endCursor);
  };

  onFetchFromGitHub = (path, cursor) => {
    getIssuesOfRepository(path, cursor).then((queryResult) =>
      this.setState(resolveIssuesQuery(queryResult, cursor))
    );
  };

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onSubmit = (event) => {
    this.onFetchFromGitHub(this.state.path);
    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ path: event.target.value });
  };

  render() {
    const { path, organization, errors } = this.state;

    return (
      <div>
        <h1>{TITLE}</h1>

        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">Show open issues for https://github.com/</label>
          <input
            id="url"
            type="text"
            value={path}
            onChange={this.onChange}
            style={{ width: "300px" }}
          />
          <button type="submit">Search</button>
        </form>
        <hr />
        {organization ? (
          <Organization
            organization={organization}
            errors={errors}
            onFetchMoreIssues={this.onFetchMoreIssues}
            onStarRepository={this.onStarRepository}
          />
        ) : (
          <p>No information yet ...</p>
        )}
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";
import axios from "axios";
import {
  GET_ORGANIZATION,
  GET_REPOSITORY_OF_ORGANIZATION,
  GET_ISSUES_OF_REPOSITORY,
} from "./gql/Query";
import Organization from "./components/Organization";

const TITLE = "React GraphQL GitHub Client";

const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`,
  },
});

const resolveIssuesQuery = (queryResult) => () => ({
  organization: queryResult.data.data.organization,
  errors: queryResult.data.errors,
});

const getIssuesOfRepository = (path) => {
  const [organization, repository] = path.split("/");

  return axiosGitHubGraphQL.post("", {
    query: GET_ISSUES_OF_REPOSITORY,
    variables: { organization, repository },
  });
};
class App extends Component {
  state = {
    path: "the-road-to-learn-react/the-road-to-learn-react",
    organization: null,
    errors: null,
  };

  onFetchFromGitHub = (path) => {
    getIssuesOfRepository(path).then((queryResult) =>
      this.setState(resolveIssuesQuery(queryResult))
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
          <Organization organization={organization} errors={errors} />
        ) : (
          <p>No information yet ...</p>
        )}
      </div>
    );
  }
}

export default App;

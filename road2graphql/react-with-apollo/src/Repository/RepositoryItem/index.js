import React from "react";
import Link from "../../Link";
import Button from "../../Button";
import {GET_REPOSITORIES_OF_CURRENT_USER,GET_CURRENT_USER} from '../../gql/queries'

import { gql, useMutation, useQuery } from "@apollo/client";
import "../style.css";

const STAR_REPOSITORY = gql`
  mutation ($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;

const UNSTAR_REPOSITORY = gql`
  mutation ($id: ID!) {
    removeStar(input: { starrableId: $id }) {
      starrable {
        id
      }
    }
  }
`;

const RepositoryItem = ({
  id,
  name,
  url,
  descriptionHTML,
  primaryLanguage,
  owner,
  stargazers,
  watchers,
  viewerSubscription,
  viewerHasStarred,
}) => {

  const [addStar, { loading, error, data }] = useMutation(
    STAR_REPOSITORY,
    {
      variables: {
        id,
      },
      refetchQueries: [{ query: GET_REPOSITORIES_OF_CURRENT_USER }],
      onCompleted: () => {
        //props.history.push(`/note/${id}`);
      },
    }
  );

  const [unStar] = useMutation(
    UNSTAR_REPOSITORY,
    {
      variables: {
        id,
      },
      refetchQueries: [{ query: GET_REPOSITORIES_OF_CURRENT_USER }],
      onCompleted: () => {
        //props.history.push(`/note/${id}`);
      },
    }
  );

  return (
    <div>
      <div className="RepositoryItem-title">
        <h2>
          <Link href={url}>{name}</Link>
        </h2>
        <div>
        {viewerHasStarred ? (
          <Button className={"RepositoryItem-title-action"} onClick={unStar}>
            {stargazers.totalCount} Star
          </Button>):(
          <Button className={"RepositoryItem-title-action"} onClick={addStar}>
            {stargazers.totalCount} Star
          </Button>)}
        </div>
      </div>

      <div className="RepositoryItem-description">
        <div
          className="RepositoryItem-description-info"
          dangerouslySetInnerHTML={{ __html: descriptionHTML }}
        />
        <div className="RepositoryItem-description-details">
          <div>
            {primaryLanguage && <span>Language: {primaryLanguage.name}</span>}
          </div>
          <div>
            {owner && (
              <span>
                Owner: <a href={owner.url}>{owner.login}</a>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryItem;

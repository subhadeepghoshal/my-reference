import React from "react";
import {useQuery } from "@apollo/client";
import {GET_REPOSITORIES_OF_CURRENT_USER,GET_CURRENT_USER} from '../gql/queries'
import Loading from '../Loading';
import ErrorMessage from '../Error';
import RepositoryList from '../Repository';


const Profile = () => {
  
    const { loading, error, data } = useQuery(GET_REPOSITORIES_OF_CURRENT_USER);

  if (loading) {
    return <Loading/>
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }


  return <RepositoryList repositories={data.viewer.repositories} />;
  //return (<p>hi</p>)

};
export default Profile;

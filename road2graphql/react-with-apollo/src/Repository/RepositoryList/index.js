import React from "react";
import RepositoryItem from "../RepositoryItem";
import "../style.css";

const RepositoryList = ({repositories}) => {
  return (
   repositories.edges.map(({ node }) => (
    <div key={node.id} className="RepositoryItem">
      { <RepositoryItem {...node} /> }
      {/* {node.name} */}
    </div> 
  )))};
export default RepositoryList;

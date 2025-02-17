import React from "react";
import { fetchNewManhwa } from "../utils/api";
import Navbar from "../components/common/Navbar";

const ManhwaList = async () => {
  const newManhwa = await fetchNewManhwa();
  return (
    <div>
      
      <Navbar />
      <h1 className="text-blue-500">ManhwaList</h1>
    </div>
  );
};
export default ManhwaList;

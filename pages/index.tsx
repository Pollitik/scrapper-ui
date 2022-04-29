import React from "react";
import { useRouter } from "next/router";

import type { NextPage } from "next";

const Home: NextPage = () => {
  const router = useRouter();

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    if(formData.get("url") == "https://morningconsult.com/global-leader-approval/"){
      router.push("/morningconsult?url=" + formData.get("url"));
   
    }

    if(formData.get("url") !== "https://morningconsult.com/global-leader-approval/"){
    // else{
      router.push("/scrape?url=" + formData.get("url"));
    }
    
   
  };
  return (
    <div className="min-h-screen flex justify-center items-center">
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <input
          className="border-2 border-black"
          type="text"
          name="url"
          id="url"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Home;

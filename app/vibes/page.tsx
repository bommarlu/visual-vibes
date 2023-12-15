"use client";
import React from "react";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ImageUploader from "@/components/ImageUploader";
import ImageDisplay from "@/components/ImageDisplay";
import FieldInput from "@/components/FieldInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import ImageSlider from "@/components/ImageSlider";
import { url } from "inspector";
import Auth from "@/components/Auth";
export default function Vibes() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [statusText, setStatusText] = useState(
    "Get started by uploading your image!"
  );
  const [makePublic, setMakePublic] = useState(true);
  const [generating, setGenerating] = useState("finished");
  const [imgUrls, setImgUrls] = useState([
    "https://kputvqghrldexbwkvwgr.supabase.co/storage/v1/object/public/gallery/00eda4f38a3dfc834c4de91cc5f73651cb6544c7/image0.png",
    "https://kputvqghrldexbwkvwgr.supabase.co/storage/v1/object/public/gallery/00eda4f38a3dfc834c4de91cc5f73651cb6544c7/image1.png",
    "https://kputvqghrldexbwkvwgr.supabase.co/storage/v1/object/public/gallery/00eda4f38a3dfc834c4de91cc5f73651cb6544c7/image2.png",
  ]);
  const [prevOpenAIKey, setPrevOpenAIKey] = useState("");

  const checkImageRequirements = (image: any) => {
    // TODO: Implement image req check
    return true;
  };

  const onImageUpload = (e: any) => {
    // console.log(e.target.files[0])
    if (checkImageRequirements(e.target.files[0]) == true) {
      setSelectedImage(e.target.files[0]);
      setStatusText("Image Upload Success!");
    }
  };

  async function runOpenAIGen(e: any) {
    //TODO: PREVENT SUBMISSION WHILE LOADING
    e.preventDefault();
    if (!selectedImage) {
      setStatusText("Please upload an image before submitting.");
      return;
    }
    if (!apiKey) {
      setStatusText("Please add your API Key before submitting.");
      return;
    }

    setGenerating("generating");
    setStatusText("Vibes generating... please be patient!");
    setPrevOpenAIKey(apiKey);

    // Create a FormData object and append the image file to it
    const formData = new FormData();
    formData.append("starterImage", selectedImage);
    formData.append("apiKey", apiKey);
    formData.append("makePublic", makePublic.toString());
    // Send data to the '/api/generate' route
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // If the response status is OK (2xx), parse the JSON data
        var responseData = await response.json();
        if (responseData.couldNotIdentifyMainSubject) {
          setStatusText(
            "Could not identify a main subject in your image. Please try again with a different image."
          );
          setGenerating("not-started");
          return;
        }
        // console.log(responseData);
        // Now responseData contains the data from the API response
      } else {
        // Handle non-OK response (e.g., error handling)
        console.error("Error:", response.status, response.statusText);
      }
    } catch (error) {
      // Handle network or other errors
      console.error("Error:", error);
    }
    const urlStrings = responseData.urls;
    setImgUrls(urlStrings);
    setStatusText("Vibes Have Been Generated!");
    setGenerating("finished");
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden py-6 sm:py-12">
      <div className="relative bg-zinc-800 px-6 pt-2 pb-8 shadow-xl ring-1 ring-gray-400/10 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
        <div className="space-y-6 py-8 text-base leading-7 text-white">
          <h2 className="text-yellow-400">{statusText}</h2>
          {generating === "not-started" && (
            <div>
              <ImageDisplay
                image={selectedImage}
                onRemove={() => {
                  setSelectedImage(null);
                  setStatusText("Please upload a new image");
                }}
              />
              <br />

              {/* Image Input */}
              <ImageUploader onChange={onImageUpload} />

              {/* API Key Input */}
              <FieldInput
                placeholder={prevOpenAIKey}
                onChange={(e: any) => {
                  setApiKey(e.target.value);
                }}
              />

              {/* Make Public Button */}
              <p>
                {" "}
                <input
                  type="checkbox"
                  id="makePublic"
                  name="Make Public"
                  defaultChecked={true}
                  onChange={(e) => {
                    setMakePublic(e.target.checked);
                  }}
                />
                <label htmlFor="makePublic">
                  {" "}
                  Make this submission public!
                </label>
              </p>

              {/* Submission Button */}
              <div className="pt-8 text-base font-semibold leading-7">
                <p className="text-red-400">Ready?</p>
                <p>
                  {" "}
                  <button
                    onClick={runOpenAIGen}
                    className="text-orange-500 hover:text-sky-600"
                  >
                    Take me to the vibes! &rarr;
                  </button>{" "}
                </p>
              </div>
            </div>
          )}
          {generating === "generating" && <LoadingSpinner />}
          {generating === "finished" && (
            <div>
              <ImageSlider imageUrls={imgUrls} />
              <div className="p-4  text-center flex-col justify-center items-center" >
                  {(!makePublic && <p className="text-red-400">Since your generation was private, it is only accessible here.</p>)}
                  <p>Enter your email to view your generations in one place! (We will not email you at all except for signup.)</p>
                  <Auth />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

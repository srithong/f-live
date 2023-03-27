import { useEffect, useState } from "react";
import Webcam from "react-webcam";
import { Route, Routes, useSearchParams } from "react-router-dom";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

function Home() {
  let [searchParams] = useSearchParams();
  const [comments, setComments] = useState([]);
  let name = searchParams.get("name");
  useEffect(() => {
    if (!name) return;
    const events = new EventSource(
      `${process.env.VITE_API_URL}/live?name=${searchParams.get("name")}`
    );
    events.addEventListener("live", (message) => {
      setComments(JSON.parse(message.data));
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    });
  }, []);

  const scrollToBottom = () => {
    const element = document.getElementById("bottom");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div>
      <main>
        <div className=" bg-black w-full h-full flex justify-between items-center">
          <Webcam className="w-full" />
          <div className=" h-96 overflow-y-scroll px-10 w-4/12">
            {comments.map((comment, index) => (
              <div key={index} className="pb-2">
                <small className=" text-white text-lg font-semibold">
                  {comment.name.toUpperCase()}
                </small>
                <div
                  className="text-gray-500 text-sm "
                  style={{
                    color: comment.color,
                  }}
                >
                  {comment.message}
                </div>
              </div>
            ))}
            <div id="bottom"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

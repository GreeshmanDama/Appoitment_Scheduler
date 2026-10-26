import { useEffect } from "react";
import api from "../utils/axios";

function App() {
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { data } = await api.get("/v1/health");
        console.log(data?.message);
      } catch (error) {
        console.log("error in health check: ", error);
      }
    };

    checkHealth();
  }, []);
  
  return <div>App</div>;
}

export default App;

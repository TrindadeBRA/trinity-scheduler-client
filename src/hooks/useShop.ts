import { useEffect, useState } from "react";
import { getShopInfo } from "../services/shopService";
import niche from "../config/niche.json";

export function useShopName() {
  const [name, setName] = useState(niche.businessName);

  useEffect(() => {
    getShopInfo()
      .then((info) => setName(info.name))
      .catch(() => {
        // fallback to niche config
      });
  }, []);

  return name;
}

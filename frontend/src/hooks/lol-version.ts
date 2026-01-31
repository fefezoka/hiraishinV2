import axios from "@/service/axios"
import { useQuery } from "@tanstack/react-query"
import React from "react"

export const useLolVersion = () => {
  const { data } = useQuery({
    queryKey: ["lol-version"],
    queryFn: async () => (await axios.get("/hiraishin/lol-version")).data,
  })

  return data
}

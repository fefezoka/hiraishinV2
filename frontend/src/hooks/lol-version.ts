import axios from "@/service/axios"
import { useQuery } from "@tanstack/react-query"

export const useLolVersion = () => {
  const { data } = useQuery<string>({
    queryKey: ["lol-version"],
    queryFn: async () => (await axios.get<string>("/hiraishin/lol-version")).data,
  })

  return data
}

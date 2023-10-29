import { useAction, useMutation, useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import World from "./components/World"

function App() {
  const [newIdea, setNewIdea] = useState("")
  const [includeRandom, setIncludeRandom] = useState(true)
  

  return (
    <>
     <div>
      <World></World>
     </div>
    </>
  )
}

export default App

// This is an example component that uses next/headers
// Replace this with the actual component that's causing the error
import { headers } from "next/headers"

export default function ExampleComponent() {
  const headerList = headers()
  const pathname = headerList.get("next-url")

  return (
    <div>
      <p>Pathname: {pathname}</p>
    </div>
  )
}

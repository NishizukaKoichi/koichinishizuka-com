import SigilExploreClient from "./explore-client"

function getFirstString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

export default function SigilExplorePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const initialCategory = getFirstString(searchParams?.category) ?? "all"
  return <SigilExploreClient initialCategory={initialCategory} />
}

